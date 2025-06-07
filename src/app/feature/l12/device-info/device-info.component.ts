import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import _ from 'lodash';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../shared/service';
import { BreadcrumbEvent } from '../../../core/enum';
import { IDialogConfig } from '../../../core/model';
import { CommonModule } from '@angular/common';
import { SharedModule, deviceAPI } from '../../../shared';
import { RackviewComponent, TeststageComponent } from '../../../shared/component';
import { MatBadge } from '@angular/material/badge';
import { ToolpoolComponent } from '../deploy-mgmt/toolpool/toolpool.component';

@Component({
  selector: 'app-device-info',
  standalone:true,
  imports:[
    CommonModule,
    SharedModule,
    RackviewComponent,
    TeststageComponent,
    MatBadge
  ],
  templateUrl: './device-info.component.html',
  styleUrls: ['./device-info.component.scss'],
  providers: [ToolpoolComponent]
})

export class DeviceInfoComponent implements OnInit {
  innerWidth: number = 0;


  deviceUrl: any;
  deviceInfo: any = [];
  deviceStages: any = [];

  diskTotalSize: number = 0;
  memoryTotalSize: number = 0;

  defaultOpt: any = 'Current';
  stagesOpt: any = [];
  selectedStage: any = [];

  profileStatus: string = '';
  profileColor: string = '';
  toolDef: any;

  passTool: any = [];
  createdTool: any = [];
  failTool: any = [];
  processingTool: any = [];
  allTool: any = [];
  failProcessingTools: any = [];
  completedProgress: number = 0;

  toolDialog: any;
  toolStatusFormControl = new FormControl('');
  toolStatusOpt: any = [];
  columnPanelExpanded: boolean = false;

  deviceAPI = deviceAPI();

  constructor(
    private translate: TranslateService,
    private eventService: EventService,
    private router: Router
  ) {
    this.deviceUrl  = this.router.getCurrentNavigation()?.extras.state;
    this.stagesOpt = [
      { index: 0, value: 'Current', display: 'Current' }
    ];
    this.toolDef = [
      { field: 'category', name: 'i18n_Category', inputVal: '' },
      { field: 'name', name: 'i18n_Name', inputVal: '' },
      { field: 'createdAt', name: 'i18n_CreatedAt', inputVal: '' },
      { field: 'updatedAt', name: 'i18n_UpdateAt', inputVal: '' },
      { field: 'remark', name: 'i18n_Remark', inputVal: '' },
      { field: 'logData', name: 'i18n_LogData', inputVal: '' }
    ];
    this.toolStatusOpt = [
      { name: 'Pass', value: 'i18n_Pass', checked: true },
      { name: 'Fail', value: 'i18n_Fail', checked: true },
      { name: 'Processing', value: 'i18n_Processing', checked: true },
      { name: 'Created', value: 'i18n_Created', checked: true }];
  }

  @HostListener('window:resize', ['$event'])
    onResize(event:any) {
      // this.deviceInfoInnerWidth = event.target.innerWidth;
      this.innerWidth = window.innerWidth;
      // console.log('this.innerWidth: ', this.innerWidth);
  }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    if (this.deviceUrl) {
      this.getBreadcrumb();
      this.setToolDialog();
      this.getDeviceInfo();
      this.getDeviceProfile();
    } else {
      this.router.navigateByUrl('Overview');
    }
  }

  getBreadcrumb() {
    this.eventService.emit({
      id: '',
      eventName: BreadcrumbEvent.LabelOverwrite,
      data: { key: 'DeviceInfo', labelName: this.deviceUrl.serialNumber+'-node'+this.deviceUrl.nodeNumber }
    });
  }

  getDeviceInfo() {
    this.deviceAPI.getDeviceInfo(String(this.deviceUrl.serialNumber), Number(this.deviceUrl.nodeNumber)).subscribe(
      {
        next: (resp: any) => {
          this.deviceInfo = resp;
          this.deviceInfo[0].diskSet[0].value.forEach((el: any) => {
            this.diskTotalSize = Number(this.diskTotalSize + el.size) / 1000 / 1000 / 1000;
          });
          this.deviceInfo[0].memorySet[0].value.forEach((el: any) => {
            this.memoryTotalSize = Number(this.memoryTotalSize + el.capacity) / 1000 / 1000 / 1000;
          });
        },
        complete: () => { },
        error: () => { this.router.navigateByUrl('/error'); }
      }
    );
  }

  getDeviceProfile() {
    this.deviceAPI.getDeviceProfile(String(this.deviceUrl.serialNumber), String(this.deviceUrl.nodeNumber)).subscribe(
      {
        next: (resp: any) => {
          this.deviceStages = resp.stages;
          this.deviceStages.forEach((el: any, index: number) => {
            el.tasks.forEach((e: any) => {
              switch (e.status) {
                case 'Pass':
                  this.passTool.push(e);
                  break;
                case 'Fail':
                  e.stageName = el.name;
                  e.stageIndex = index+1;
                  this.failTool.push(e);
                  this.profileStatus = this.translate.instant('i18n_Fail');
                  this.profileColor = 'warn';
                  break;
                case 'Processing':
                  e.stageName = el.name;
                  e.stageIndex = index+1;
                  this.processingTool.push(e);
                  this.profileStatus = this.translate.instant('i18n_Processing');
                  this.profileColor = 'primary';
                  break;
                case 'Created':
                  this.createdTool.push(e);
                  break;
              }
            });
            this.stagesOpt.push({ index: el.index, value: el.name, display: el.index + 1 + '. ' + el.name });
          });

          this.allTool = this.passTool.concat(this.failTool, this.processingTool, this.createdTool);
          this.failProcessingTools = this.failTool.concat(this.processingTool);

          if (this.passTool.length === this.allTool.length) {
            this.profileStatus = this.translate.instant('i18n_Pass');
            this.profileColor = 'accent';
          }
          if (this.createdTool.length === this.allTool.length) {
            this.profileStatus = this.translate.instant('i18n_Created');
            this.profileColor = 'undefined';
          }
          this.completedProgress = Math.round(this.passTool.length / this.allTool.length * 100);
        },
        complete: () => { this.selectStage('Current'); },
        error: () => { }
      }
    );
  }

  selectStage(value: any) {
    let copy = _.cloneDeep(this.deviceStages);
    let passTools: any = [];
    let failProcessTool: any = [];
    let createdTools: any = [];
    let result: any = [];
    if (value === 'Current') {
      copy.some((el: any) => {
        passTools = el.tasks.filter((e: any) => {
          return e.status === 'Pass';
        });
        failProcessTool = el.tasks.filter((e: any) => {
          return e.status === 'Fail' || e.status === 'Processing';
        });
        createdTools = el.tasks.filter((e: any) => {
          return e.status === 'Created';
        });

        if (passTools.length === el.tasks.length) {
          el.tasks = passTools;
        } else {
          el.tasks = failProcessTool.concat(createdTools);
        }
        result = [el];
        return failProcessTool.length !== 0 || createdTools.length === el.tasks.length;
      });
    }
    else {
      result = copy.filter((el: any) => {
        return el.name === value;
      });
    }
    this.selectedStage = _.cloneDeep(result);
  }

  // filterTask(value: string, checked?: any) {
  //   if (checked) {
  //     this.http.get('./assets/deviceInfo_stage.json').subscribe((resp: any) => {
  //       resp.forEach((el: any, i: number) => {
  //         el.tasks = el.tasks.filter((e: any) => {
  //           return e.status === value;
  //         });
  //         this.deviceStages[i].tasks = this.deviceStages[i].tasks.concat(el.tasks);
  //         this.deviceStages[i].tasks = this.deviceStages[i].tasks.sort((obj1: any, obj2: any) => {
  //           if (obj1.index > obj2.index) return 1;
  //           if (obj1.index < obj2.index) return -1;
  //           return 0;
  //         });
  //       });
  //     })
  //   }
  //   else {
  //     this.deviceStages.forEach((el: any) => {
  //       el.tasks = el.tasks.filter((e: any) => {
  //         return e.status !== value;
  //       })
  //     });
  //   }
  //   this.deviceStages = _.clone(this.deviceStages);
  // }

  setToolDialog() {
    const dialogInfo: IDialogConfig = {
      title: '',
      matConfig: { id: 'deviceToolDialog', data: '', width: '600px' }
    };
    const toolDialogConfig = {
      content: '',
      itemDef: this.toolDef,
      dialogconfig: dialogInfo
    };
    this.toolDialog = toolDialogConfig;
  }

}
