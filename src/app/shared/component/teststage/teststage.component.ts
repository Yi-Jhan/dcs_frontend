import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild, inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import _ from 'lodash';
import { IDialogConfig } from '../../../core/model';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from '../../shared.module';
import { onDestroyed } from '../../common-lib';
import { DialogService, EventService } from '../../service';
import { DialogButtonType, DialogStatus } from '../../../core/enum';
import { toolAPI } from '../../restful-api';

@Component({
  selector: 'app-teststage',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule
  ],
  templateUrl: './teststage.component.html',
  styleUrls: ['./teststage.component.scss']
})
export class TeststageComponent implements OnInit {
  destroy$ = onDestroyed();
  dialogService = inject(DialogService);
  eventService = inject(EventService);

  @ViewChild('addStageDialog') addStageDialog!: TemplateRef<any>;
  @ViewChild('addTestToolDialog') addTestToolDialog!: TemplateRef<any>;
  @ViewChild('editTestToolDialog') editTestToolDialog!: TemplateRef<any>;
  @ViewChild('toolInfoDialog') toolInfoDialog!: TemplateRef<any>;
  @ViewChild('deviceToolDialog') deviceToolDialog!: TemplateRef<any>;
  @Input() chkisSaved: boolean;
  @Input() displayOnly: boolean;
  @Input() displayData: any;
  @Output() detectstageData = new EventEmitter<string>();
  @Input() toolDialog:any;
  stageForm: FormGroup = new FormGroup({});
  addtestToolForm: FormGroup = new FormGroup({});
  editToolForm: FormGroup = new FormGroup({});
  toolInfoForm: FormGroup = new FormGroup({});
  addFormDef:any;
  editFormDef:any;
  toolInfoDef:any;
  stageData: any = [];
  testToolData: any;
  testItem: any;
  testItemName: any;
  stageIndex: any;
  toolCatalogyData:any;
  toolNameData:any
  isRepeatChecked:boolean;
  testtool:any;
  tasksetExpand:boolean = false;

  toolAPI = toolAPI();

  constructor(
    private formBuilder: FormBuilder,
    private router:Router,
    private translate: TranslateService
  ) {

    this.chkisSaved = false;
    this.displayOnly = false;
    this.isRepeatChecked = false;

    this.addFormDef = [
      { field: 'category', name: 'i18n_Category', selectVal: '', selectable: true },
      { field: 'name', name: 'i18n_Name', selectVal: '', selectable: true },
      { field: 'delayTime', name: 'i18n_DelayTime', inputVal:''},
      { field: 'repeated' , name: 'i18n_Repeat' , checked:false, inputVal:0 }
    ];

    this.editFormDef = [
      { field: 'category', name: 'i18n_Category', selectVal: '', selectable: true },
      { field: 'name', name: 'i18n_Name', selectVal: '', selectable: true },
      { field: 'delayTime', name: 'i18n_DelayTime', inputVal:''},
      { field: 'repeated' , name: 'i18n_Repeat' , checked:false, inputVal:0 }
    ];

  }

  ngOnInit(): void {
    this.initEvent();
    this.initDialogItem();
    if(!this.displayOnly){
      this.gettestToolData();
    }
  }

  ngOnChanges() {
    if (!this.chkisSaved) {
      this.stageData = [];
    }
    if(this.displayData){
      this.stageData = this.displayData;
    }
  }

  initEvent() {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      switch (event.id) {
        case 'addStage':
          switch (event.eventName) {
            case 'dialogButtonClicked':
              switch (event.data.id) {
                case 'Save':
                  if (!_.isEmpty(this.stageForm.value.itemDef[0].inputVal)) {
                    this.stageData.push({ name: this.stageForm.value.itemDef[0].inputVal,descr:'', tasks: [] });
                  }
                  this.dialogService.closeAll();
                  this.stageForm.reset();
                  this.initDialogItem();
                  break;
                case 'Cancel':
                  this.dialogService.closeAll();
                  this.stageForm.reset();
                  this.initDialogItem();
                  break;
              }
          }
          break;
        case 'addTestTool':
          switch (event.eventName) {
            case 'dialogButtonClicked':
              switch (event.data.id) {
                case 'Save':
                  this.saveTestTool(this.addtestToolForm.value, 'add');
                  break;
                case 'Cancel':
                  this.dialogService.closeAll();
                  this.addtestToolForm.reset();
                  this.initDialogItem();
                  break;
              }
          }
          break;

          case 'editTestTool':
            switch (event.eventName) {
              case 'dialogButtonClicked':
                switch (event.data.id) {
                  case 'Save':
                    this.saveTestTool(this.editToolForm.value, 'edit');
                    break;
                  case 'Cancel':
                    this.dialogService.closeAll();
                    this.editToolForm.reset();
                    this.initDialogItem();
                    break;
                }
            }
            break;
      }
    });
  }

  gettestToolData() {
    this.toolAPI.getTool().subscribe((tooldata: any) => {
        this.testToolData = tooldata;
        this.toolCatalogyData =_.uniqBy(this.testToolData,'category');
      });
  }

  initDialogItem() {
    this.stageForm = this.formBuilder.group({
      itemDef: this.createStageFormArray()
    });

    this.addtestToolForm = this.formBuilder.group({
      itemDef: this.createTestToolForm()
    });

    this.editToolForm = this.formBuilder.group({
      itemDef: this.createEditTestToolForm()
    });
  }

  createStageFormArray() {
    var itemDef: any = [
      { field: 'Name', name: 'i18n_Name', inputVal: '' }
    ];

    return new FormArray(
      itemDef.map(
        (item: any) =>
          new FormGroup({
            field: new FormControl(item.field),
            fieldName: new FormControl(this.translate.instant(item.name)),
            inputVal: new FormControl(item.inputVal)
          })
      )
    )
  }

  createTestToolForm() {
    return new FormArray(
      this.addFormDef.map(
        (item: any) =>
          new FormGroup({
            field: new FormControl(item.field),
            fieldName: new FormControl(this.translate.instant(item.name)),
            selectVal: new FormControl(item.selectVal),
            inputVal: new FormControl(item.inputVal),
            selectable: new FormControl(item.selectable),
            checked: new FormControl(item.checked),
            delayTime: new FormControl(item.inputVal,[Validators.max(60),Validators.min(0)]),
            repeat: new FormControl(item.repeat),
          })
      )
    )
  }

  createEditTestToolForm() {
    return new FormArray(
      this.editFormDef.map(
        (item: any) =>
          new FormGroup({
            field: new FormControl(item.field),
            fieldName: new FormControl(this.translate.instant(item.name)),
            selectVal: new FormControl(item.selectVal),
            inputVal: new FormControl(item.inputVal),
            selectable: new FormControl(item.selectable),
            checked: new FormControl(item.checked),
            delayTime: new FormControl(item.inputVal,[Validators.max(60),Validators.min(0)]),
            repeat: new FormControl(item.repeat),
          })
      )
    )
  }

  createToolInfoForm(itemDef:any,data?:any) {
    this.toolInfoDef = itemDef;
    if(data){
      !_.isUndefined(data.toolpackagePath) ? data.toolPackageName = data.toolpackagePath.split('/tool_package')[1] : '';
      !_.isUndefined(data.scriptPath) ? data.scriptName = data.scriptPath.split('/script')[1] : '';
      this.toolInfoDef = _.forEach(this.toolInfoDef, item => {
        switch (item.field) {
          case 'createdAt':
            item['inputVal'] = new DatePipe('en-US').transform(data[item.field], 'yyyy/MM/dd HH:mm');
            break;
          case 'updatedAt':
            item['inputVal'] = new DatePipe('en-US').transform(data[item.field], 'yyyy/MM/dd HH:mm');
            break;
          case 'logData':
            var val = '';
            _.forEach(data.logData, el => {
              val = val + el.message + ' ' + new DatePipe('en-US').transform(el.timestamp, 'yyyy/MM/dd HH:mm') + '\n\n';
            });
            item['inputVal'] = val;
            break;
          default:
            item['inputVal'] = data[item.field];
            break;
        }
      });
    }

    return new FormArray(
      this.toolInfoDef.map(
        (item: any) =>
          new FormGroup({
            field: new FormControl(item.field),
            fieldName: new FormControl(this.translate.instant(item.name)),
            inputVal: new FormControl(item.inputVal),
            upload: new FormControl(item.upload)
          })
      )
    )
  }

  openAddStageDialog() {
    const dialogInfo: IDialogConfig = {
      title: 'i18n_AddStage',
      matConfig: { id: 'addStage', data: '' , disableClose:true},
      status: DialogStatus.Primary,
      buttons: [
        { id: 'Cancel', desc: 'i18n_Cancel', type: DialogButtonType.Cancel }
        , { id: 'Save', desc: 'i18n_Save', type: DialogButtonType.General }]
    };
    this.dialogService.open(this.addStageDialog, dialogInfo);
  }

  openAddTestToolDialog(index: any) {
    const dialogInfo: IDialogConfig = {
      title: 'i18n_AddTool',
      matConfig: { id: 'addTestTool', data: '' , disableClose:true},
      status: DialogStatus.Primary,
      buttons: [
        { id: 'Cancel', desc: 'i18n_Cancel', type: DialogButtonType.Cancel }
        , { id: 'Save', desc: 'i18n_Save', type: DialogButtonType.General }]
    };
    this.dialogService.open(this.addTestToolDialog, dialogInfo);
    this.stageIndex = index;
  }

  async openTestToolDialog(index?: any,testtool?:any) {
    const dialogInfo: IDialogConfig = {
      title: 'i18n_EditTool',
      matConfig: { id: 'editTestTool', data: testtool },
      status: DialogStatus.Warning,
      buttons: [
        { id: 'Cancel', desc: 'i18n_Cancel', type: DialogButtonType.Cancel }
        , { id: 'Save', desc: 'i18n_Save', type: DialogButtonType.General }]
    };
    if(!this.displayOnly){
      this.dialogService.open(this.editTestToolDialog, dialogInfo);
      this.testtool = testtool;
      this.stageIndex = index;
      await Promise.all([
        this.editToolForm = this.formBuilder.group({
          itemDef: this.updateEditFormArray(testtool)
        })
      ]).then(()=>{
        this.getTestTool(testtool.tool.category,'edit');
        testtool.repeated > 0 ? this.isRepeatChecked = true : this.isRepeatChecked = false;
      });
    }
    else{
       if(this.toolDialog.itemDef){
        if(testtool.status){
          switch (testtool.status) {
            case 'Created':
              this.toolDialog.dialogconfig.title = 'Created Tool';
              this.toolDialog.dialogconfig.status = 'secondary';
              break;
            case 'Processing':
              this.toolDialog.dialogconfig.title = 'Processing Tool';
              this.toolDialog.dialogconfig.status = 'info';
              break;
            case 'Pass':
              this.toolDialog.dialogconfig.title = 'Pass Tool';
              this.toolDialog.dialogconfig.status = 'success';
              break;
            case 'Fail':
              this.toolDialog.dialogconfig.title = 'Fail Tool';
              this.toolDialog.dialogconfig.status = 'danger';
              break;
            default:
              break;
          }
        }
        await Promise.all([
          this.toolInfoForm = this.formBuilder.group({
            itemDef:  this.createToolInfoForm(this.toolDialog.itemDef, testtool.tool)
          })
        ]).then(()=>{
          if (this.toolDialog.dialogconfig.matConfig.id == "deviceToolDialog") {
            this.dialogService.open(this.deviceToolDialog, this.toolDialog.dialogconfig);
          }
          else {
            this.dialogService.open(this.toolInfoDialog, this.toolDialog.dialogconfig);
          }
        });
       }
       else{
        this.dialogService.open(this.toolDialog.content, this.toolDialog.dialogconfig);
       }
    }
  }

  updateEditFormArray(data: any) {
    this.editFormDef = _.forEach(this.editFormDef, item => {
      if(item.selectable){
        item['selectVal'] = data.tool[item.field];
      }
      else{
        item['inputVal'] = data[item.field]
      }
    });
    return new FormArray(
      this.editFormDef.map(
        (item: any) =>
        new FormGroup({
          field: new FormControl(item.field),
          fieldName: new FormControl(this.translate.instant(item.name)),
          selectVal: new FormControl(item.selectVal),
          inputVal: new FormControl(item.inputVal),
          selectable: new FormControl(item.selectable),
          checked: new FormControl(item.checked),
          delayTime: new FormControl(item.inputVal,[Validators.max(60),Validators.min(0)]),
          repeat: new FormControl(item.repeat),
        })
      )
    )
  }

  openWarningDialog(){
    const dialogInfo: IDialogConfig = {
      title: 'Warning',
      matConfig: { id: 'WarningTestStage', data: '' },
      buttons: []
    };
    this.dialogService.open('i18n_CheckInputMsg', dialogInfo);
  }

  saveTestTool(data:any, type:any){
    var toolForm  = _.filter(data.itemDef,item=>{
      return _.isEmpty(item.selectVal) && !_.isNull(item.selectVal);
    });
    if(toolForm.length > 0){
      this.openWarningDialog();
    }
    else{
      var toolDelayTime:any;
      var toolRepeat:any;
      const addDelaytime:any = document.getElementById('addDelaytime');
      const addRepeat:any = document.getElementById('addRepeat');
      const editDelaytime:any = document.getElementById('editDelaytime');
      const editRepeat:any = document.getElementById('editRepeat');
      if (!_.isEmpty(this.testItem) && type == 'add') {
        // toolDelayTime = _.find(this.addtestToolForm.value.itemDef, testTool => {
        //   return testTool.field == 'delayTime';
        // }).inputVal;
        // toolRepeat = _.find(this.addtestToolForm.value.itemDef, testTool => {
        //   return testTool.field == 'repeated';
        // }).inputVal;
        toolDelayTime = Number(addDelaytime.value);
        toolRepeat = addRepeat != null ? Number(addRepeat.value) : 0;

        _.filter(this.stageData, (stageData, index) => {
          if (index == this.stageIndex) {
            stageData.tasks.push({delayTime:toolDelayTime,name:stageData.name,repeated:_.isNull(toolRepeat.repeat) ? 0:toolRepeat,step:stageData.tasks.length+1,tool:this.testItem});
          }
        });
        this.addtestToolForm.reset();
      }

      else if(!_.isEmpty(this.testItem) && type == 'edit'){
        // toolDelayTime = _.find(this.editToolForm.value.itemDef, testTool => {
        //   return testTool.field == 'delayTime';
        // }).inputVal;
        // toolRepeat = _.find(this.editToolForm.value.itemDef, testTool => {
        //   return testTool.field == 'repeated';
        // }).inputVal;
        toolDelayTime = Number(editDelaytime.value);
        toolRepeat = editRepeat != null ? Number(editRepeat.value) : 0;

        _.forEach(this.stageData[this.stageIndex].tasks, taskData=>{
          if(taskData.id == this.testtool.id){
            taskData.delayTime = toolDelayTime;
            taskData.repeated = toolRepeat;
            taskData.tool = this.testItem;
            this.isRepeatChecked == true ? taskData.repeated = toolRepeat : taskData.repeated = null;
          }
        });
        this.editToolForm.reset();
      }
      this.dialogService.closeAll();
      this.initDialogItem();
    }
  }

  dropStage(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.stageData, event.previousIndex, event.currentIndex);
    this.detectstageData.emit(this.stageData);
  }

  removeStage(stageIndex: any) {
    this.stageData = _.filter(this.stageData, (data: any, dataIndex) => {
      return stageIndex != dataIndex;
    });
    this.detectstageData.emit(this.stageData);
  }

  getTestTool(testCatalogy: any,type:any) {
    if(_.isUndefined(testCatalogy)){
      this.router.navigate(['/ToolPool'],{queryParams:{action:JSON.stringify('addtool')}});
      this.dialogService.closeAll();
    }
    var findCatalogy =  _.filter(this.testToolData, data => { return data.category == testCatalogy; });
    var toolcatalogyVal:any;
    var toolnameVal:any;
    if(type == 'add'){
      toolcatalogyVal = _.find(this.addtestToolForm.value.itemDef,val =>{ return val.field == 'category'}).selectVal;
      toolnameVal = _.find(this.addtestToolForm.value.itemDef,val =>{ return val.field == 'name'}).selectVal;
    }
    else{
      toolcatalogyVal = _.find(this.editToolForm.value.itemDef,val =>{ return val.field == 'category'}).selectVal;
      toolnameVal = _.find(this.editToolForm.value.itemDef,val =>{ return val.field == 'name'}).selectVal;
    }
    if(findCatalogy.length > 0){
      this.toolNameData = toolnameVal;
      this.toolNameData = _.filter(this.testToolData,tooldata=>{ return tooldata.category == testCatalogy; });
    }
    this.testItem = _.find(this.testToolData, data => { return data.category == toolcatalogyVal && data.name == toolnameVal; });
    this.detectstageData.emit(this.stageData);
  }

  removetestTool(stageIndex: any, toolIndex: any) {
    this.stageData[stageIndex].tasks = _.filter(this.stageData[stageIndex].tasks, (data: any, dataIndex) => {
      return toolIndex != dataIndex;
    });
    this.detectstageData.emit(this.stageData);
  }

  dropTool(event: CdkDragDrop<any>,stageIndex:any) {
    this.stageIndex = stageIndex;
    this.stageData[this.stageIndex].tasks[event.previousContainer.data.index] = event.container.data.testtool;
    this.stageData[this.stageIndex].tasks[event.container.data.index] = event.previousContainer.data.testtool;
    this.detectstageData.emit(this.stageData);
  }

  moveStageDown(index:any){
    moveItemInArray(this.stageData,index, index+1);
    this.detectstageData.emit(this.stageData);
  }

  moveStageUp(index:any){
    moveItemInArray(this.stageData,index, index-1);
    this.detectstageData.emit(this.stageData);
  }

  expandTaskset(){
    this.tasksetExpand = !this.tasksetExpand;
    const profileForm = document.querySelector('app-processprofileconfig > mat-card');
    const teststage = document.getElementById('teststage');
    const tasksetContent = document.querySelector(' app-teststage > mat-card > mat-card-content');
    const processBtn = document.getElementById('processBtn');
    profileForm?.setAttribute('style','opacity:0.1;');
    teststage?.setAttribute('class','tasksetExpand');
    tasksetContent?.setAttribute('style','');
    processBtn?.setAttribute('style','display:none;');

  }

  collapseTaskset(){
    this.tasksetExpand = !this.tasksetExpand;
    const profileForm = document.querySelector('app-processprofileconfig > mat-card');
    const teststage = document.getElementById('teststage');
    const tasksetContent = document.querySelector(' app-teststage > mat-card > mat-card-content');
    const processBtn = document.getElementById('processBtn');
    profileForm?.setAttribute('style','opacity:1;');
    teststage?.setAttribute('class','tasksetCollapse');
    tasksetContent?.setAttribute('style','height: 55vh;overflow-y: auto;');
    processBtn?.setAttribute('style','position: relative;text-align: right;bottom: -10px;}');
  }
}
