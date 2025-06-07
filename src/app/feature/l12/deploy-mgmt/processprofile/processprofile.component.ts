import { NavigationEnd, Router } from '@angular/router';
import { Component, OnInit, input, model } from '@angular/core';
import { filter } from 'rxjs';
import _ from 'lodash';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule, onDestroyed, profileAPI } from '../../../../shared';
import { ChipsInputComponent, DataTableComponent } from '../../../../shared/component';
import { DialogService, EventService } from '../../../../shared/service';
import { ChipsInputEvent } from '../../../../core/enum';

@Component({
  selector: 'app-processprofile',
  standalone:true,
  imports:[
    CommonModule,
    SharedModule,
    ChipsInputComponent,
    DataTableComponent
  ],
  templateUrl: './processprofile.component.html',
  styleUrls: ['./processprofile.component.scss']
})
export class Processprofile implements OnInit {
  destroy$ = onDestroyed();
  stageData:any = [];
  profileData = new Array();
  columnsDef: Array<any>;
  groupByColumns: Array<string>;
  filters = new Array<string>();
  // tableInfo: any;
  tableID =  'processprofile';
  isLoadingResults:boolean;
  id = input.required<string>();
  placeholder = input('i18n_EnterToSearch');
  enteredValue = model<Array<string>>([]);

  profileAPI = profileAPI();

  constructor(
    private eventService: EventService,
    private router: Router,
    private dialogService: DialogService,
  ) {
    this.isLoadingResults = false;

    this.columnsDef = [
      { field: 'name', headerName: 'ProcessProfile.Table.Name', width: '120px' },
      { field: 'description', headerName: 'ProcessProfile.Table.Description', width: '120px' },
      { field: 'stageSteps', headerName: 'ProcessProfile.Table.StageSteps', width: '120px' },
      { field: 'toolCount', headerName: 'ProcessProfile.Table.ToolCount', width: '120px' },
      { field: 'updatedAt', headerName: 'ProcessProfile.Table.LastUpdateTime', width: '120px', cellRender: this.lastupdtCellRender }
    ];

    this.groupByColumns = ['stageSteps'];
  }

  ngOnInit(): void {
    this.initEvent();
    this.getProfileData();
  }

  ngAfterViewInit() {
    this.getrouteAction();
  }

  getrouteAction() {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      this.dialogService.closeAll();
    });
  }

  initEvent() {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      // console.log('event',event)
      switch (event.eventName) {
        case ChipsInputEvent.InputChange:
          this.filters = _.clone(event.data);
          break;
          case 'rowClicked':
            const profileid = event.data ? event.data.id : null;
            if(profileid) {
              this.router.navigate(['ProcessProfileConfig'],{queryParams:{profileid:JSON.stringify(profileid)},state:{profileData:this.profileData}});
            }
            break;
      }
    });
  }

  getProfileData(){
    this.profileAPI.getProfile().subscribe((resp:any)=>{
      this.profileData = resp;
    });
  }

  createNewProfile(){
    this.router.navigate(['ProcessProfileConfig']);
  }

  lastupdtCellRender(data:any){
    const date = new Date(data.updatedAt);
    // const Lastupdt = new Date(date.getTime() - date.getTimezoneOffset()*60*1000);
    const Lastupdt = new Date(date.getTime() - date.getTimezoneOffset());
    const newLastupdt:any = new DatePipe('en-US').transform(Lastupdt,'yyyy/MM/dd HH:mm');
    const div = document.createElement('div');
    const i = document.createElement('i');
    div.innerHTML = newLastupdt;
    div.prepend(i);
    return div;
  }

}
