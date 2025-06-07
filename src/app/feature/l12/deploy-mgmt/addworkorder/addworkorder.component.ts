import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { Component, OnInit, ViewChild, TemplateRef, model, input, effect } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { interval } from 'rxjs';
import _ from 'lodash';
import * as echarts from 'echarts';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CommonLibService, SharedModule, deviceAPI, onDestroyed, profileAPI, workOrderAPI } from '../../../../shared';
import { ChipsInputComponent, DataTableComponent, RackviewComponent, TeststageComponent } from '../../../../shared/component';
import { ToolpoolComponent } from '../toolpool/toolpool.component';
import { IDialogConfig, IExportConfig } from '../../../../core/model';
import { DialogService, EventService, SpinnerOverlayService, StateService } from '../../../../shared/service';
import { ChipsInputEvent, DialogButtonType, DialogStatus, ExportEvent, TableEvent, Theme } from '../../../../core/enum';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-addworkorder',
  standalone:true,
  imports:[
    CommonModule,
    SharedModule,
    MatStepperModule,
    ChipsInputComponent,
    TeststageComponent,
    RackviewComponent,
    DataTableComponent
  ],
  templateUrl: './addworkorder.component.html',
  styleUrls: ['./addworkorder.component.scss'],
  providers: [ToolpoolComponent]
})
export class AddworkorderComponent implements OnInit {
  destroy$ = onDestroyed();
  @ViewChild('addDialog') addDialog!: TemplateRef<any>;
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;
  @ViewChild('stepper') stepper!:MatStepper;
  addForm: FormGroup = new FormGroup({});
  editForm: FormGroup = new FormGroup({});
  nodeProfileForm: FormGroup = new FormGroup({});
  // tableInfo: any;
  tableID = 'bomadddevice';
  tableInfoData = new Array();
  columnsDef: Array<any>;
  groupByColumns: Array<string>;
  columns: Array<any>;
  isLoadingResults = false;
  filters = new Array<string>();
  deviceData: any = [];
  exportData = {} as IExportConfig;
  profileData:any;
  stageData:any;
  addFormDef:any;
  editFormDef:any;
  editData:any;
  firststepFormGroup:any = new FormGroup({});
  addOrderViewData:any;
  discoveredData:any;
  previewRackData:any = [];
  taskData:any = [];
  isDiscovering = false;
  isDiscovered = false;
  isRunning = false;
  isCreated = false;
  connectionPieChartOption: any;
  chartId: any;
  connectionPieChart: any;
  connectionBarChartOption:any;
  connectionBarChart: any;
  deviceChartOption:any;
  deviceChart: any;
  chartsLabelColor: any;
  connectedAll:any;
  connectedResp:any;
  factoriesData:any;
  newCustomItem:any = [];
  connectionUpdatetime:any;
  isupdating = false;
  tableData:any;
  toolDialog:any;
  profileId:any;
  serialNumFilter:any;
  profileFilter:any;
  discoverInterval:any;
  tableListExpand:boolean = false;
  tasksetExpand:boolean = false;
  orderNumber:any;
  stepperEditable = true;
  id = input.required<string>();
  placeholder = input('i18n_EnterToSearch');
  enteredValue = model<Array<string>>([]);
  theme = this.stateService.theme;
  mode = this.theme();
  lang$ = toObservable(this.stateService.language);

  workorderAPI = workOrderAPI();
  profileAPI = profileAPI()
  deviceAPI = deviceAPI();

  constructor(
    private eventService: EventService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private commonLib: CommonLibService,
    private stateService: StateService,

    private toolpoolComponent:ToolpoolComponent,
    private translate: TranslateService,

    private loading: SpinnerOverlayService,
    private router: Router) {

    this.columnsDef = [
      { field: 'serialNumber', headerName: 'i18n_SerialNumber', width: '120px' },
      { field: 'profile', headerName: 'i18n_Profile', width: '120px', cellRender: this.profileCellRender, cellEvent:'click'},
      { field: 'cabinet', headerName: 'i18n_Cabinet', width: '120px' },
      { field: 'model', headerName: 'i18n_Model', width: '120px' },
      { field: 'position', headerName: 'i18n_Position', width: '120px' },
      { field: 'size', headerName: 'i18n_Size', width: '120px' },
      { field: 'node', headerName: 'i18n_Node', width: '120px' }
    ];

    this.groupByColumns = ['cabinet'];

    this.columns = _.map(this.columnsDef, item => {
      return { field: item.field, name: item.headerName, checked: _.includes(this.groupByColumns, item.field) };
    });

    this.firststepFormGroup = this.formBuilder.group({
      ordernumber: ['', Validators.required],
      startTime: ['', Validators.required],
      edgegateway: ['', Validators.required],
      description:['']
    });

    this.addFormDef = [
      { field: 'serialNumber', name: 'i18n_SerialNumber', inputVal: '' , type: 'text' },
      { field: 'cabinet', name: 'i18n_Cabinet', inputVal: '', type: 'text' },
      { field: 'model', name: 'i18n_Model', inputVal: '', type: 'text' },
      { field: 'position', name: 'i18n_Position', inputVal: '', type: 'number', min: 1, max: 42, id:'addPosition' },
      { field: 'size', name: 'i18n_Size', inputVal: '', type: 'number', min: 1, max: 10 , id:'addSize' },
      { field: 'node', name: 'i18n_Node', inputVal: '', type: 'number', min: 1, max: 10 , id:'addNode' }
    ];

    this.editFormDef = [
      { field: 'serialNumber', name: 'i18n_SerialNumber', inputVal: '' , type: 'text' },
      { field: 'cabinet', name: 'i18n_Cabinet', inputVal: '' , type: 'text' },
      { field: 'model', name: 'i18n_Model', inputVal: '' , type: 'text' },
      { field: 'position', name: 'i18n_Position', inputVal: '', type: 'number', min: 1, max: 42, id:'editPosition' },
      { field: 'size', name: 'i18n_Size', inputVal: '' , type: 'number', min: 1, max: 10 , id:'editSize' },
      { field: 'node', name: 'i18n_Node', inputVal: '' , type: 'number', min: 1, max: 10 , id:'editNode' }
    ];
    const navigation  = this.router.getCurrentNavigation();
    this.orderNumber = navigation?.extras.state ? navigation?.extras.state:undefined;

    effect(() => {
      const currentClass = this.theme() === Theme.Light ? Theme.Dark : Theme.Light;
      if (currentClass == 'theme-dark') {
        this.chartsLabelColor = 'black';
      }
      else {
        this.chartsLabelColor = 'white';
      }
      this.initChart();
    });
  }

  ngOnInit(): void {
    this.initDialogItem();
    this.initEvent();
    this.getprofileData();
    this.openToolDialog();
    this.getLang();
    this.setToCheckStatus(this.orderNumber);
    this.initChart();
  }

  getLang(){
    this.lang$.subscribe(()=>{
      this.initChart();
    });
  }

  setToCheckStatus(orderNo:any){
      setTimeout(() => {
        if(_.isString(orderNo)){
          const matFirstStep = document.querySelector('mat-stepper > div:nth-child(1) > mat-step-header');
          const matSecondStep = document.querySelector('mat-stepper > div:nth-child(2) > mat-step-header');
          matFirstStep?.setAttribute('style','pointer-events: none !important;opacity:0.1;');
          matSecondStep?.setAttribute('style','pointer-events: none !important;opacity:0.1;');
          this.stepperEditable = false;
          this.stepper._getIndicatorType = () => 'number';
          this.firststepFormGroup.patchValue({ordernumber:orderNo});
          this.discoverDevice();
          this.stepper.linear  = false;
          this.stepper.selectedIndex = 2;
          var deviceObj = {};
          var createdData:any = [];
          this.loading.show();
          this.workorderAPI.getWorkOrderData(orderNo).subscribe({
            next:resp=>{
              _.forEach(resp.workOrder.deviceInfoList, orderData=>{
                for(var i = 0; i < orderData.node;i++){
                  deviceObj = {
                    serialNumber:orderData.serialNumber + '-node'+(i+1),
                    profile: !_.isUndefined(orderData.profile[i]) ? orderData.profile[i].value.name : '',
                    cabinet: orderData.cabinet,
                    model: orderData.model,
                    position: orderData.position,
                    size: orderData.size,
                    node: orderData.node,
                  }
                  createdData.push(deviceObj);
                }
              });
              this.deviceData = createdData;
              this.previewRackview();
              this.loading.hide();
            }
          });
        }
      }, 0);
  }

  getprofileData(){
    this.workorderAPI.getFactories().subscribe(data=>{
      this.factoriesData = data;
    });
    this.profileAPI.getProfile().subscribe((resp:any)=>{
      this.profileData = resp;
    });
  }

  changeStep(step: any) {
    if(step.selectedIndex == 1){
      this.eventService.emit({id: '', eventName: ExportEvent.ExportPrivilege, data: true});
    }
    else if(step.selectedIndex == 2){
      this.submitWorkOrder();
    }
    else{
      this.eventService.emit({id: '', eventName: ExportEvent.ExportPrivilege, data: false});
    }
  }

  openToolDialog(){
    const dialogInfo: IDialogConfig = {
      title: 'i18n_ToolInformation',
      matConfig: { id: 'addWorkOrderTestTool', data: '', width: '500px' },
      status: DialogStatus.Primary
    };

    const toolDialogConfig = {
      content: '',
      itemDef: this.toolpoolComponent.editFormDef,
      dialogconfig: dialogInfo
    };

    this.toolDialog = toolDialogConfig;
  }

  initChart(){
    setTimeout(() => {
      this.connectionBarChartOption = {
        grid:{
          left:'90px',
        },
        xAxis: {
           show:false,
           type: 'value'
        },
        yAxis: {
          type: 'category',
          data: [this.translate.instant('i18n_Connected'),
                 this.translate.instant('i18n_Disconnected'),
                 this.translate.instant('i18n_Error')],
          axisLabel: {
            textStyle: {
                color: this.chartsLabelColor
            }
        }
        },
        series: [
          {
            data: [
              {value:0,itemStyle: { color: 'rgb(79, 185, 254)' }},
              {value:0,itemStyle: { color: 'rgb(79, 185, 254)' }},
              {value:0,itemStyle: { color: 'rgb(79, 185, 254)' }}],
            type: 'bar',
            name:'Name',
            stack: 'StackName',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(79, 185, 254, 0.2)'
            },
            itemStyle : {
              // normal: {label : {show: false, position: 'inside*',color:this.chartsLabelColor,fontSize:'16px'}}},
              normal: {label : {show: false}}},
            }
        ]
      };

      this.connectionPieChartOption = {
        series: [
          {
            type: 'pie',
            radius: ['61%', '70%'],
            label: {
              show: true,
              position: 'center',
              color: this.chartsLabelColor,
              fontSize: 16
            },
            center: ['55%', '40%']
          }
        ]
      };

      this.deviceChartOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: [
            this.translate.instant('i18n_Connected'),
            this.translate.instant('i18n_Disconnected'),
            this.translate.instant('i18n_Error')],
          bottom:'10%',
          textStyle:{
            color:this.chartsLabelColor
          }
        },
        xAxis: [
          {
            type: 'category',
            axisTick: { show: false },
            data: [''],
            axisLabel: {
              textStyle: {
                  color: this.chartsLabelColor
              }
            }
          }

      ],
      yAxis: [
        {
          type: 'value',
          minInterval:1,
          axisLabel: {
            textStyle: {
                color: this.chartsLabelColor
            }
          }
        }
      ],
      series: [
        {
          name: this.translate.instant('i18n_Connected'),
          type: 'bar',
          barGap: 0,
          // label: labelOption,
          emphasis: {
            focus: 'series'
          },
          data: [0,0,0],
          color:'#0070cc'
        },
        {
          name: this.translate.instant('i18n_Disconnected'),
          type: 'bar',
          // label: labelOption,
          emphasis: {
            focus: 'series'
          },
          data: [0,0,0],
          color:'#ffc107'
        },
        {
          name: this.translate.instant('i18n_Error'),
          type: 'bar',
          // label: labelOption,
          emphasis: {
            focus: 'series'
          },
          data: [0,0,0],
          color:'#f14141'
        },
      ]
    }

    var echartsName: any = ['ConnectionBar','ConnectionPie','Device'];
    for (let e = 0; e < echartsName.length; e++) {
      this.chartId = document.getElementById('chart' + echartsName[e]);
      if (this.chartId) {
        switch (echartsName[e]) {
          case 'ConnectionBar':
            let connectionBarChart = echarts.getInstanceByDom(this.chartId);
            if( connectionBarChart == null){
              this.connectionBarChart = echarts.init(this.chartId);
            }
          }
        }

        series: [
          {
            name: this.translate.instant('i18n_Connected'),
            type: 'bar',
            barGap: 0,
            // label: labelOption,
            emphasis: {
              focus: 'series'
            },
            data: [0,0,0],
            color:'#1997ff'
          },
          {
            name: this.translate.instant('i18n_Disconnected'),
            type: 'bar',
            // label: labelOption,
            emphasis: {
              focus: 'series'
            },
            data: [0,0,0],
            color:'#ffc107'
          },
          {
            name: this.translate.instant('i18n_Error'),
            type: 'bar',
            // label: labelOption,
            emphasis: {
              focus: 'series'
            },
            data: [0,0,0],
            color:'#f14141'
          },
        ]
      }

      var echartsName: any = ['ConnectionBar','ConnectionPie','Device'];
      for (let e = 0; e < echartsName.length; e++) {
        this.chartId = document.getElementById('chart' + echartsName[e]);
        if (this.chartId) {
          switch (echartsName[e]) {
            case 'ConnectionBar':
              let connectionBarChart = echarts.getInstanceByDom(this.chartId);
              if( connectionBarChart == null){
                this.connectionBarChart = echarts.init(this.chartId);
              }
              this.connectionBarChart.setOption(this.connectionBarChartOption);
              break;
            case 'ConnectionPie':
              let connectionPieChart = echarts.getInstanceByDom(this.chartId);
              if( connectionPieChart == null){
                this.connectionPieChart = echarts.init(this.chartId);
              }
              this.connectionPieChart.setOption(this.connectionPieChartOption);
              this.connectionPieChart.setOption({
                series: [{
                  label: {
                    formatter: () => {
                      return 0 + '%\n\n' + this.translate.instant('i18n_CurrentConnectionRates');
                    },
                  },
                  data: [
                    // { value: 0, name: 'Done', itemStyle: { color: 'rgb(79, 185, 254)', borderRadius: '10%' } },
                    { value: 0, name: 'All', itemStyle: { color: 'rgb(230, 231, 238)' } }
                  ]
                }]
              });
              break;

            case 'Device':
              let deviceChart = echarts.getInstanceByDom(this.chartId);
              if( deviceChart == null){
                this.deviceChart = echarts.init(this.chartId);
              }
              this.deviceChart.setOption(this.deviceChartOption);
              break;
          }

        }
      }
    }, 0);
  }

  initEvent() {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      // console.log(event)
      switch (event.eventName) {
        case ChipsInputEvent.InputChange:
          this.filters = _.clone(event.data);
          break;
        case 'dialogButtonClicked':
          switch (event.id){
            case 'addWorkOrder':
              switch (event.data.id) {
                case 'Save':
                  this.dynamicAddColumn(this.addForm.value.customItemList).then(addFormdata => {
                    var nodeFormData = _.map(this.nodeProfileForm.value.itemDef, nodeProfile => { return nodeProfile.value });
                    var addDeviceData = _.concat(addFormdata).concat(nodeFormData);
                    this.addDeviceInfo(addDeviceData);
                  });
                  break;
              }
              break;
              case 'editWorkOrder':
                switch (event.data.id) {
                  case 'Save':
                    const updateData = _.concat(this.editForm.value.itemDef).concat(this.nodeProfileForm.value.itemDef);
                    this.updateWorkOrder(updateData);
                    break;
                  case 'Delete':
                    this.openDeleteDialog();
                    break;
                }
                break;
                case 'deleteWorkOrderDevice':
                  switch (event.data.id) {
                    case 'Submit':
                      this.deleteData();
                      break;
                  }
                  this.dialogService.closeAll();
                   break;
                case 'resetWorkOrderDevice':
                switch (event.data.id) {
                  case 'Submit':
                    this.resetWorkOrder();
                    break;
                }
                this.dialogService.closeAll();
                break;
        }
          break;
        case TableEvent.ColumnVisible:
          this.tableData = event.data;
          break;
          case 'rowClicked':
            this.openEditDialog(event.data);
            break;

            case 'cellEvent':
              if(event.data.profile){
                this.profileId = _.find(this.profileData,data=>{return data.name == event.data.profile}).id;
                this.serialNumFilter = event.data.serialNumber;
                // this.profileFilter = _.find(this.profileData,data=>{return data.name == event.data.profile}).name;
                this.profileFilter = event.data.profile;
                this.profileAPI.getProfile(this.profileId).subscribe((resp:any)=>{
                  this.stageData = resp.stages;
                });
              }
              break;

              case ExportEvent.Export:
                this.exportFile();
                break;
      }
    });
  }

  dynamicAddColumn(customItemList: any) {
    // this.tableInfo.columnDefs = this.columnsDef;
    return new Promise(resolve => {
      for (let item of customItemList) {
        let finddObject = _.find(this.columnsDef, function(e) {
          return _.upperCase(e.field) === _.upperCase(item.field);
        });
        if(!finddObject){
          this.columnsDef.push({ field: _.upperCase(item.field), headerName: _.upperCase(item.field), width: '120px' });
          this.addForm.value.itemDef.push({ field: _.upperCase(item.field), fieldName: _.upperCase(item.field), inputVal: item.inputVal });
          this.editForm.value.itemDef.push({ field: _.upperCase(item.field), fieldName: _.upperCase(item.field), inputVal: item.inputVal, selectVal:item.selectVal });
        }
        else{
          this.addForm.value.itemDef = _.chain(this.addForm.value.itemDef)
          .filter(data=>{return !_.isEmpty(data.field)})
          .forEach((element:any)=>{
            if(_.upperCase(element.field) == _.upperCase(item.field)){
              element['inputVal'] = item.inputVal;
            }
          }).value();

          this.editForm.value.itemDef = _.chain(this.editForm.value.itemDef)
          .filter(data=>{return !_.isEmpty(data.field)})
          .forEach((element:any)=>{
            if(_.upperCase(element.field) == _.upperCase(item.field)){
              element['inputVal'] = item.inputVal;
            }
          }).value();
        }
      }
      resolve(this.addForm.value.itemDef);
    });
  }

  addDeviceInfo(data: any) {
    var device:any = [];
    var deviceObj = {};
    const addPosition:any = document.getElementById('addPosition')?.querySelector('input');
    const addSize:any = document.getElementById('addSize')?.querySelector('input');
    const addNode:any = document.getElementById('addNode')?.querySelector('input');
    var chkMaxPosition = addPosition.value > 42 ? true:false;
    var chkMinPosition = addPosition.value < 1 ? true:false;

    _.forEach(this.addForm.controls['itemDef'].value,item=>{
      switch (item.field){
        case 'position':
          item['inputVal'] = addPosition.value;
          break;
        case 'size':
          item['inputVal'] = addSize.value;
          break;
        case 'node':
          item['inputVal'] = addNode.value;
          break;
      }
    });


    var addFormValid  = _.filter(data,item=>{
      return !_.isUndefined(item.inputVal) && _.isEmpty(item.inputVal);
    });

    var nodeFormValid  = _.filter(data,item=>{
      return !_.isUndefined(item.selectVal) && _.isEmpty(item.selectVal);
    });

    if(addFormValid.length > 0 || nodeFormValid.length > 0 || chkMaxPosition || chkMinPosition){
      this.openWarningDialog();
    }
    else{
      var convertVal = _.map(data, (e: any) => {
        var data: any = {};
        if(e.inputVal){
          data[e.field] = e.inputVal;
        }
        else if(e.selectVal){
          data[e.field] = e.selectVal;
        }
        return data;
      }).reduce(function (i, c) {
        return _.assign(i, c);
      }, {});

      var chkCabinetData = _.filter(this.deviceData,devicedata=>{ return _.lowerCase(devicedata.cabinet) == _.lowerCase(convertVal.cabinet) && _.lowerCase(devicedata.position) == _.lowerCase(convertVal.position)});
      if(chkCabinetData.length > 0){
        this.openDataExistsDialog();
      }
      else{
        device.push(convertVal);
        _.forEach(device, deviceData=>{
          for(var i = 0; i< deviceData.node; i++){
            deviceObj = {
              serialNumber:deviceData.serialNumber + '-node'+(i+1),
              cabinet:deviceData.cabinet,
              model:deviceData.model,
              position:Number(deviceData.position),
              size:Number(deviceData.size),
              node:Number(deviceData.node),
              profile:deviceData['node'+`${i+1}`+'Profile']
            }
            this.deviceData.push(deviceObj);
          }
        });
        this.tableInfoData = this.deviceData;
        this.dialogService.closeAll();
        this.addForm.reset();
        this.nodeProfileForm.reset();
        this.initDialogItem();
        this.profileId = _.find(this.profileData,data=>{return data.name == this.tableInfoData[this.tableInfoData.length-1].profile}).id;
        this.serialNumFilter = this.tableInfoData[this.tableInfoData.length-1].serialNumber;
        this.profileFilter = this.tableInfoData[this.tableInfoData.length-1].profile;
        this.profileAPI.getProfile(this.profileId).subscribe((resp:any)=>{
          this.stageData = resp.stages;
        });
        this.previewRackview();
      }
    }
  }

  openAddDialog() {
    const dialogInfo: any = {
      title: 'i18n_AddDevice',
      matConfig: { id: 'addWorkOrder', data: '', width: '500px' , disableClose: true },
      status:'primary',
      buttons: [
        { id: 'Cancel', desc: 'i18n_Cancel', type: 'cancel' }
        , { id: 'Save', desc: 'i18n_Save', type: 'general' }]
    };
    this.dialogService.open(this.addDialog, dialogInfo);

    let nodeProfileForm: any = (this.nodeProfileForm.get('itemDef') as FormArray);
    nodeProfileForm.controls = [];

    setTimeout(() => {
    const addPosition:any = document.getElementById('addPosition');
    const addSize:any = document.getElementById('addSize');
    const addNode:any = document.getElementById('addNode');
    const addNodeIcon:any = addNode.querySelectorAll('i');
    addPosition.onkeyup = function(event:any) {
      let value = Number(this.value);
      let max = Number(event.target.max);
      let min = Number(event.target.min);
      if(value > max){
        this.value = '';
        return false;
      }
      else if(value < min){
        this.value = '';
        return false;
      }
      else{
        return true;
      }
     };
    addSize.onkeydown = function() { return false };
    addNode.onkeydown = function() { return false };
    for (let i = 0; i < addNodeIcon.length; i++) {
      addNodeIcon[i].addEventListener("click", ()=> {
        this.dynamicNodeFiled(addNode.querySelector('input').value);
      });
    }
    }, 500);
  }

  openEditDialog(clickdata:any) {
    const dialogInfo: any = {
      title: 'i18n_EditDevice',
      matConfig: { id: 'editWorkOrder', data: '', width: '500px', disableClose: true },
      status:"warning",
      buttons: [
        { id: 'Cancel', desc: 'i18n_Cancel', type: 'cancel' },
        { id: 'Delete', desc: 'i18n_Delete', type: 'general', color: 'danger' },
        { id: 'Save', desc: 'i18n_Save', type: 'general' }]
    };
    this.dialogService.open(this.editDialog, dialogInfo);

    setTimeout(() => {
      const editPosition:any = document.getElementById('editPosition');
      const editSize:any = document.getElementById('editSize');
      const editNode:any = document.getElementById('editNode');
      const editNodeIcon:any = editNode.querySelectorAll('i');
      editPosition.onkeyup = function(event:any) {
        let value = Number(this.value);
        let max = Number(event.target.max);
        let min = Number(event.target.min);
        if(value > max){
          this.value = '';
          return false;
        }
        else if(value < min){
          this.value = '';
          return false;
        }
        else{
          return true;
        }
       };
      editSize.onkeydown = function() { return false };
      editNode.onkeydown = function() { return false };
      for (let i = 0; i < editNodeIcon.length; i++) {
        editNodeIcon[i].addEventListener("click", ()=> {
          this.dynamicNodeFiled(editNode.querySelector('input').value);
        });
      }
      }, 500);

    var deviceData:any = [];
    var deviceObj:any = {};
    _.chain(this.tableData.data)
    .filter(data => { return data.cabinet })
    .groupBy(filterData=>String(filterData.serialNumber).split('-')[0])
    .map((val,key)=>({ serialNumber:key, data:val}))
    .forEach((groupData,index)=>{
      deviceObj = {
        serialNumber: groupData.serialNumber,
        cabinet: groupData.data[0].cabinet,
        model: groupData.data[0].model,
        position: Number(groupData.data[0].position),
        size: Number(groupData.data[0].size),
        node: Number(groupData.data[0].node),
        profile: _.map(groupData.data,(data,index)=>{ return { node:index+1,value:data.profile }})
      }
      deviceData.push(deviceObj);
    })
    .value();

    var deviceFilter = _.find(deviceData, d=>{return d.serialNumber == String(clickdata.serialNumber).split('-')[0]});
    var deviceProfile:any = [];
    var deviceProfileData:any = {};

    _.forEach(deviceFilter.profile, profile=>{
      deviceProfile.push({field:'node' + profile.node + 'Profile',name:this.translate.instant('i18n_Node') + profile.node + this.translate.instant('i18n_Profile'), selectVal: ''})
    });

    for(var i = 0; i < deviceFilter.profile.length; i++){
      deviceProfileData['node' + deviceFilter.profile[i].node + 'Profile'] = deviceFilter.profile[i].value;
    }

    this.editData = deviceFilter;
    this.editForm = this.formBuilder.group({
      itemDef: this.updateEditFormArray(this.editFormDef,this.editData),
      customItemList: new FormArray([])
    });

    this.nodeProfileForm = this.formBuilder.group({
      itemDef:this.updateFormNodeArray(deviceProfile,deviceProfileData)
    });
  }

  openRackNodeDialog(rackdata:any){
    const dialogInfo: any = {
      title: 'i18n_EditDevice',
      matConfig: { id: 'editWorkOrder', data: '', width: '500px', disableClose: true },
      status:"warning",
      buttons: [
        { id: 'Cancel', desc: 'i18n_Cancel', type: 'cancel' },
        { id: 'Delete', desc: 'i18n_Delete', type: 'general', color: 'danger' },
        { id: 'Save', desc: 'i18n_Save', type: 'general' }]
    };
    this.dialogService.open(this.editDialog, dialogInfo);

    setTimeout(() => {
      const editPosition:any = document.getElementById('editPosition');
      const editSize:any = document.getElementById('editSize');
      const editNode:any = document.getElementById('editNode');
      const editNodeIcon:any = editNode.querySelectorAll('i');
      editPosition.onkeyup = function(event:any) {
        let value = Number(this.value);
        let max = Number(event.target.max);
        let min = Number(event.target.min);
        if(value > max){
          this.value = '';
          return false;
        }
        else if(value < min){
          this.value = '';
          return false;
        }
        else{
          return true;
        }
       };
      editSize.onkeydown = function() { return false };
      editNode.onkeydown = function() { return false };
      for (let i = 0; i < editNodeIcon.length; i++) {
        editNodeIcon[i].addEventListener("click", ()=> {
          this.dynamicNodeFiled(editNode.querySelector('input').value);
        });
      }
      }, 500);

    var nodeProfile:any = [];
    var rackProfileData:any = {};

    _.forEach(rackdata.profile, profile=>{
      nodeProfile.push({field:'node' + profile.node + 'Profile',name:this.translate.instant('i18n_Node') + profile.node + this.translate.instant('i18n_Profile'), selectVal: ''})
    });

    for(var i = 0; i < rackdata.profile.length; i++){
      rackProfileData['node' + rackdata.profile[i].node + 'Profile'] = rackdata.profile[i].value;
    }

    this.editData = rackdata;
    this.editForm = this.formBuilder.group({
      itemDef: this.updateRackEditFormArray(this.editFormDef,this.editData),
      customItemList: new FormArray([])
    });

    this.nodeProfileForm = this.formBuilder.group({
      itemDef:this.updateFormNodeArray(nodeProfile,rackProfileData)
    });
  }

  openWarningDialog(){
    const dialogInfo: IDialogConfig = {
      title: 'Warning',
      matConfig: { id: 'WarningWorkOrder', data: '' },
      buttons: [],
      status: DialogStatus.Warning
    };
    this.dialogService.open('i18n_CheckInputMsg', dialogInfo);
  }

  openDataExistsDialog(){
    const dialogInfo: IDialogConfig = {
      title: 'Warning',
      matConfig: { id: 'WarningWorkOrderDataExists', data: '' },
      buttons: [],
      status: DialogStatus.Warning
    };
    this.dialogService.open('i18n_DataExistMsg', dialogInfo);
  }


  openDeleteDialog(){
    const dialogInfo: IDialogConfig = {
      title: 'Delete',
      matConfig: { id: 'deleteWorkOrderDevice', data: '' },
      buttons: [
        { id: 'Submit', desc: 'Submit', type: DialogButtonType.General }],
      status: DialogStatus.Danger
    };
    this.dialogService.open('i18n_DeleteDeviceMsg', dialogInfo);
  }

  openResetDialog(){
    const dialogInfo: IDialogConfig = {
      title: 'Reset',
      matConfig: { id: 'resetWorkOrderDevice', data: '' },
      buttons: [
        { id: 'Submit', desc: 'Submit', type: DialogButtonType.General }],
      status: DialogStatus.Danger
    };
    this.dialogService.open('Are you sure you want to reset this work order?', dialogInfo);
  }

  // getProfile(profile:any){
  //   if(profile){
  //     this.profileId = _.find(this.profileData,data=>{return data.name == profile}).id;
  //     this.profileAPI.getProfile(this.profileId).subscribe((resp:any)=>{
  //       this.stageData = resp.stages;
  //     });
  //   }
  // }

  uploadCSV(event: any) {
    const files = event.files;
    if (files && files.length) {
      const fileToRead = files[0];
      let reader: FileReader = new FileReader();
      reader.readAsText(fileToRead);
      reader.onload = (fileLoadedEvent: any) => {
        var textFromFileLoaded = fileLoadedEvent.target.result.trim();
        var csvData = textFromFileLoaded.split(/\r\n|\n/);
        var header = _.map(this.columnsDef, item => { return item.field; });
        for (let i = 1; i < csvData.length; i++) {
          this.deviceData.push(_.zipObject(header, csvData[i].split(',')));
        }
        this.deviceData = _.uniqBy(this.deviceData, 'serialNumber');
        this.tableInfoData = this.deviceData;
        this.profileId = _.find(this.profileData,data=>{return data.name == this.tableInfoData[0].profile}).id;
        this.serialNumFilter = this.tableInfoData[0].serialNumber;
        this.profileFilter = this.tableInfoData[0].profile;
        this.profileAPI.getProfile(this.profileId).subscribe((resp:any)=>{
          this.stageData = resp.stages;
        });
        this.previewRackview();
      }
    }

  }

  initDialogItem() {
    this.addForm = this.formBuilder.group({
      itemDef: this.createFormArray(),
      customItemList: new FormArray([])
    });

    this.editForm = this.formBuilder.group({
      itemDef: this.createEditFormArray(),
      customItemList: new FormArray([])
    });

    this.nodeProfileForm = this.formBuilder.group({
      itemDef: new FormArray([])
    })
  }

  createFormArray() {
    return new FormArray(
      this.addFormDef.map(
        (item: any) =>
          new FormGroup({
            field: new FormControl(item.field),
            fieldName: new FormControl(this.translate.instant(item.name)),
            inputVal: new FormControl(item.inputVal,Validators.required),
            type: new FormControl(item.type),
            min: new FormControl(item.min),
            max: new FormControl(item.max),
            id: new FormControl(item.id)
          })
      )
    );
  }

  createEditFormArray(){
    return new FormArray(
      this.editFormDef.map(
        (item: any) =>
        new FormGroup({
          field: new FormControl(item.field),
          fieldName: new FormControl(this.translate.instant(item.name)),
          inputVal: new FormControl(item.inputVal,Validators.required),
          type: new FormControl(item.type),
          min: new FormControl(item.min),
          max: new FormControl(item.max),
          id: new FormControl(item.id)
        })
      )
    )
  }

  updateEditFormArray(columnsDef:any, editdata?:any) {
    var itemDef: any = [];
    var editFormField:any = [];
    _.map(this.editFormDef,e=>{
      editFormField.push(e.field);
    });
    if(editdata){
      itemDef = _.forEach(columnsDef, item=>{
        item['inputVal'] = editdata[item.field];
      });
    }
    return new FormArray(
      itemDef.map(
        (item: any) =>
          new FormGroup({
            field: new FormControl(item.field),
            fieldName: new FormControl(this.translate.instant(item.name)),
            inputVal: new FormControl(item.inputVal,Validators.required),
            type: new FormControl(item.type),
            min: new FormControl(item.min),
            max: new FormControl(item.max),
            id: new FormControl(item.id)
          })
      )
    );
  }

  updateRackEditFormArray(columnsDef:any, editdata?:any){
    var itemDef: any = [];
    var editFormField:any = [];
    _.map(this.editFormDef,e=>{
      editFormField.push(e.field);
    });
    if(editdata){
      itemDef = _.forEach(columnsDef, item=>{
        item['inputVal'] = editdata[item.field];
      });
    }

    return new FormArray(
      itemDef.map(
        (item: any) =>
          new FormGroup({
            field: new FormControl(item.field),
            fieldName: new FormControl(this.translate.instant(item.name)),
            inputVal: new FormControl(item.inputVal,Validators.required),
            type: new FormControl(item.type),
            min: new FormControl(item.min),
            max: new FormControl(item.max),
            id: new FormControl(item.id)
        })
      )
    );
  }

  updateFormNodeArray(columnsDef:any,editdata:any){
    var itemDef: any = [];
    if(editdata){
      itemDef = _.forEach(columnsDef, item=>{
        item['selectVal'] = editdata[item.field];
      });
    }

    return new FormArray(
      itemDef.map(
        (item: any) =>
          new FormGroup({
            field: new FormControl(item.field),
            fieldName: new FormControl(item.name),
            selectVal: new FormControl(item.selectVal,Validators.required)
          })
      )
    )

  }

  updateWorkOrder(updateData:any){
    const editPosition:any = document.getElementById('editPosition')?.querySelector('input');
    const editSize:any = document.getElementById('editSize')?.querySelector('input');
    const editNode:any = document.getElementById('editNode')?.querySelector('input');
    var serialNum:any;
    var node1Profile:any;
    var chkMaxPosition = editPosition.value > 42 ? true:false;
    var chkMinPosition = editPosition.value < 1 ? true:false;

    _.forEach(this.editForm.controls['itemDef'].value,item=>{
      switch (item.field){
        case 'position':
          item['inputVal'] = editPosition.value;
          break;
        case 'size':
          item['inputVal'] = editSize.value;
          break;
        case 'node':
          item['inputVal'] = editNode.value;
          break;
      }
    });

    var editFormValid = _.filter(updateData,item=>{
      return !_.isUndefined(item.inputVal) && _.isEmpty(String(item.inputVal));
    });

    var nodeFormValid = _.filter(updateData,item=>{
      if(item.field){
        return !_.isUndefined(item.selectVal) && _.isEmpty(item.selectVal);
      }
      else{
        return item.status == 'INVALID';
      }
    });

    if(editFormValid.length > 0 || nodeFormValid.length > 0 || chkMaxPosition || chkMinPosition){
      this.openWarningDialog();
    }
    else{
      var convertVal = _.map(updateData, (e: any) => {
        var data: any = {};
        if(e.inputVal){
          data[e.field] = e.inputVal;
        }
        else{
          if(e.field){
            data[e.field] = e.selectVal;
          }
          else{
            data[e.value.field] = e.value.selectVal;
          }
        }
        return data;
      }).reduce(function(i,c){
        return _.assign(i,c);
      }, {});

      var node = Number(convertVal.node);
      var nodePorfile = {};
      var nodePorfileData:any = [];
      for(var i = 0; i < node;i++){
        nodePorfile = {
          serialNumber : convertVal.serialNumber+'-node'+Number(i+1),
          cabinet: convertVal.cabinet,
          model: convertVal.model,
          position: Number(convertVal.position),
          node : Number(convertVal.node),
          size : Number(convertVal.size),
          profile : convertVal['node'+Number(i+1)+'Profile']
        }
        nodePorfileData.push(nodePorfile);
      }

      var deviceData = _.filter(this.deviceData,element=>{
        return String(element.serialNumber).split('-')[0] != this.editData.serialNumber;
      });

      this.deviceData = deviceData.concat(nodePorfileData);
      this.tableInfoData = this.deviceData;
      _.forEach(updateData,data=>{
        switch (data.field){
          case 'serialNumber':
            serialNum = data['inputVal'];
          break;
          case 'node1Profile':
            node1Profile = data['selectVal'];
          break;
        }
      });
      this.profileId = _.find(this.profileData,data=>{return data.name == node1Profile}).id;
      this.serialNumFilter = serialNum;
      this.profileFilter = node1Profile;
      this.profileAPI.getProfile(this.profileId).subscribe((resp:any)=>{
        this.stageData = resp.stages;
      });
      this.dialogService.closeAll();
      this.previewRackview();
   }
  }

  deleteData(){
    this.deviceData = _.filter(this.deviceData,(data:any)=>{
      return String(data.serialNumber).split('-')[0] !== this.editData.serialNumber;
    });
    this.tableInfoData = this.deviceData;
    if(this.tableInfoData.length > 0){
      this.profileId = _.find(this.profileData,data=>{return data.name == this.tableInfoData[0].profile}).id;
      this.serialNumFilter = this.tableInfoData[0].serialNumber;
      this.profileFilter = this.tableInfoData[0].profile;
      this.profileAPI.getProfile(this.profileId).subscribe((resp:any)=>{
        this.stageData = resp.stages;
      });
    }
    else{
      this.serialNumFilter = '';
      this.profileFilter = '';
      this.stageData = [];
    }
    this.previewRackview();
  }

  exportcsv(): void {
    this.commonLib.openTableExportDialog(this.exportData);
  }

  addCustomItem(group: any) {
    let customItem: any = (group.get('customItemList') as FormArray);
    customItem.push(new FormGroup({ field: new FormControl, fieldName: new FormControl, inputVal: new FormControl }));
  }

  removecustomItem(group: any, index: number) {
    (group.get('customItemList') as FormArray).removeAt(index)
  }

  submitWorkOrder(){
    if(this.deviceData.length > 0){
      this.loading.show();
      const startTime = new Date(this.firststepFormGroup.value.startTime).getTime();
      var deviceData:any = [];
      var deviceObj = {};
      _.chain(this.deviceData)
      .groupBy(filterData=>String(filterData.serialNumber).split('-')[0])
      .map((val,key)=>({ serialNumber:key, data:val}))
      .forEach((groupData,index)=>{
        deviceObj = {
          serialNumber: groupData.serialNumber,
          cabinet: groupData.data[0].cabinet,
          model: groupData.data[0].model,
          position: Number(groupData.data[0].position),
          size: Number(groupData.data[0].size),
          node: Number(groupData.data[0].node),
          profile: _.map(groupData.data,(data,index)=>{ return { node:index+1,value:_.find(this.profileData, profileData=>{ if(data.profile == profileData.name){ return profileData.id}}).id }}),
        }
        deviceData.push(deviceObj);
      })
      .value();
      var createOrdeData = {
        orderNo: this.firststepFormGroup.value.ordernumber,
        factoryId: this.firststepFormGroup.value.edgegateway,
        description: this.firststepFormGroup.value.description,
        devices:deviceData,
        startTime: startTime
      };
      if(!this.isCreated){
        this.isCreated = true;
        this.workorderAPI.createWorkOrder(createOrdeData).subscribe((resp:any)=>{
          this.loading.hide();
        });
      }
      else{
        this.isCreated = true;
        this.workorderAPI.updateWorkOrder(createOrdeData).subscribe((resp:any)=>{
          this.loading.hide();
        });
      }
    }
  }

  discoverDevice(){
    this.isDiscovering = true;
    setTimeout(() => {
      this.isDiscovering = false;
      this.connectionUpdatetime = new Date();
      this.updateChartVal();
    }, 2000);

    this.discoverInterval = interval(10000).pipe(this.destroy$()).subscribe(()=>{
      this.isupdating = true;
      this.updateChartVal();
    });
  }

  previewRackview(){
    this.previewRackData = [];
    var deviceData:any = [];
    var deviceObj = {};

    _.chain(this.deviceData)
    .groupBy(filterData=>String(filterData.serialNumber).split('-')[0])
    .map((val,key)=>({ serialNumber:key, data:val}))
    .forEach((groupData,index)=>{
      deviceObj = {
        serialNumber: groupData.serialNumber,
        cabinet: groupData.data[0].cabinet,
        model: groupData.data[0].model,
        position: Number(groupData.data[0].position),
        size: Number(groupData.data[0].size),
        node: Number(groupData.data[0].node),
        profile: _.map(groupData.data,(data,index)=>{ return { node:index+1,value:data.profile }})
      }
      deviceData.push(deviceObj);
    })
    .value();
    this.previewRackData = _.chain(deviceData)
    .clone()
    .value();
  }

  updateChartVal(){
    this.connectionUpdatetime = new Date();
    this.isupdating = false;

    this.deviceAPI.getDeviceStatus(this.firststepFormGroup.value.ordernumber)
    .subscribe((resp:any)=>{
    this.isDiscovered = true;
    var deviceData:any = [];
    var deviceObj = {};
    _.chain(this.deviceData)
    .groupBy(filterData=>String(filterData.serialNumber).split('-')[0])
    .map((val,key)=>({ serialNumber:key, data:val}))
    .forEach((groupData,index)=>{
      deviceObj = {
        serialNumber: groupData.serialNumber,
        cabinet: groupData.data[0].cabinet,
        model: groupData.data[0].model,
        position: Number(groupData.data[0].position),
        size: Number(groupData.data[0].size),
        node: Number(groupData.data[0].node),
        profile: _.map(groupData.data,(data,index)=>{ return { node:index+1,value:data.profile }}),
      }
      deviceData.push(deviceObj);
    })
    .value();

    this.previewRackData = _.chain(deviceData)
     .each(ele=>{
    _.each(resp.cabinets,cabinetData=>{
        _.each(cabinetData.devices, cabinetDeviceData=>{
          if(ele.serialNumber == cabinetDeviceData.serialNumber){
            ele.discovered = this.isDiscovered;
            ele.status = cabinetDeviceData.status;
            ele.orderStatus = []
            ele.locatorLight = []
            for(var i = 0; i < cabinetDeviceData.status.length; i++){
              ele.orderStatus.push({node:i+1, value:'Created'});
              ele.locatorLight.push({node:i+1, value:false});
            }
          }
        });
      });
    })
    .clone()
    .each(devicedata=>{
      if(devicedata.connected){
        clearInterval(this.discoverInterval);
      }
    })
    .value();

    var deviceConnected =  resp.totalConnected;
    var deviceDisConnected =  resp.totalDisConnected;
    var deviceError = resp.totalError;

    this.connectedAll = resp.totalConnected + resp.totalDisConnected +resp.totalError;
    this.connectedResp = resp.totalConnected;

    var deviceCabinet = _.map(resp.cabinets, obj => { return obj.name }).sort();
    var cabinetConnected = _.chain(resp.cabinets).sortBy('name').map( obj => {return obj.connected}).value();
    var cabinetDisConnected = _.chain(resp.cabinets).sortBy('name').map( obj => {return obj.disconnected}).value();
    var cabinetError = _.chain(resp.cabinets).sortBy('name').map( obj => {return obj.error}).value();

    if (this.chartId) {
      this.connectionBarChart.setOption({
        series:{
          data: [
            { value:deviceConnected, itemStyle: { color: 'rgb(79, 185, 254)' } },
            { value:deviceDisConnected, itemStyle: { color: 'rgb(79, 185, 254)' } },
            { value:deviceError, itemStyle: { color: 'rgb(79, 185, 254)' } }],
            itemStyle : {
              normal: { label : { show: true,color:this.chartsLabelColor,fontSize:'14px' } }}
        }
      });

      this.connectionPieChart.setOption({
        series: [{
          label: {
            formatter: () => {
              return Math.round(this.connectedResp / this.connectedAll * 100) + '%\n\n' + 'Current Rates';
            },
          },
          data: [
            { value: this.connectedResp, name: 'Done', itemStyle: { color: 'rgb(79, 185, 254)', borderRadius: '10%' } },
            { value: this.connectedAll == 0 ? 1 : this.connectedAll - this.connectedResp, name: 'All', itemStyle: { color: 'rgb(230, 231, 238)' } }
          ]
        }]
      });

        const labelOption = {
        show: true,
        position: 'insideBottom',
        distance: 15,
        align: 'left',
        verticalAlign: 'middle',
        rotate: 90,
        // formatter: '{c}  {name|{a}}',
        formatter: '{c}',
        fontSize: 12,
        rich: {
          name: {}
        }
      };

      this.deviceChart.setOption({
        xAxis: [
          {
            type: 'category',
            axisTick: { show: false },
            data: deviceCabinet
          }
        ],
        series: [
          {
            name: 'Connected',
            type: 'bar',
            barGap: 0,
            label: labelOption,
            emphasis: {
              focus: 'series'
            },
            data: cabinetConnected,
            color:'#0070cc'
          },
          {
            name: 'Disconnected',
            type: 'bar',
            label: labelOption,
            emphasis: {
              focus: 'series'
            },
            data: cabinetDisConnected,
            color:'#ffc107'
          },
          {
            name: 'Error',
            type: 'bar',
            label: labelOption,
            emphasis: {
              focus: 'series'
            },
            data: cabinetError,
            color:'#f14141'
          },
        ]
      })

    }
    });
  }

  getRackNode(nodeData:any){
    if(this.stepperEditable){
      this.openRackNodeDialog(nodeData);
    }
  }

  runTask(){
    var runTaskData = {
      orderNo:this.firststepFormGroup.value.ordernumber
    };
    this.workorderAPI.runWorkOrder(runTaskData).subscribe({
      next:()=>{},
      complete:()=>{
        this.router.navigate(['/Overview']);
      },
      error:err=>{}
    });
  }

  async exportFile(): Promise<void>  {
    this.exportData.exportContent = new Array();
    this.exportData.exportContent.push(
      {
        dataType: 'table',
        data: this.tableData,
        position: 0
      },
    );
    this.commonLib.openTableExportDialog(this.exportData);
  }

  resetWorkOrder(){
    this.workorderAPI.deleteWorkOrder(this.firststepFormGroup.value.ordernumber).subscribe(()=>{
      this.stageData = [];
      this.deviceData = [];
      this.tableInfoData = this.deviceData;
      this.isCreated = false;
      this.stepper.reset();
    });
  }

  dynamicNodeFiled(node:any){
    let nodeProfileForm: any = (this.nodeProfileForm.get('itemDef') as FormArray);
    let nodeProfile = [];
      for(var i = 1; i <= node; i++){
        nodeProfile.push(new FormGroup(
          { field: new FormControl('node'+ i + 'Profile'),
          fieldName: new FormControl(this.translate.instant('i18n_Node')+ i + this.translate.instant('i18n_Profile')),
          selectVal: new FormControl('',Validators.required)
          }
          ));
      }
    nodeProfileForm.controls = nodeProfile;
    this.nodeProfileForm.value.itemDef = nodeProfile;
  }

  profileCellRender(data:any, row:any){
    const div = document.createElement('div');
    div.style.display = 'flex';
    const chip = document.createElement('buttton');
    chip.style.lineHeight = '22px';
    chip.style.borderRadius = '15px';
    chip.style.padding = '0 10px';
    chip.style.margin = '0 5px 0 0';
    chip.style.background = '#595959';
    chip.innerHTML = data.profile;
    div.appendChild(chip);
    return div;
  }

  expandTableList(){
    this.tableListExpand = !this.tableListExpand;
    const deviceTable = document.getElementById('deviceTable');
    const tasksetDiv = document.getElementById('tasksetDiv');
    const matFirstStep = document.querySelector('mat-stepper > div:nth-child(1) > mat-step-header');
    const matSecondStep = document.querySelector('mat-stepper > div:nth-child(2) > mat-step-header');
    const matFinalStep = document.querySelector('mat-stepper > div:nth-child(3) > mat-step-header');
    const tableContent = document.querySelector('#deviceTable > app-data-table > div > div.table-outline > cdk-virtual-scroll-viewport');
    const deviceStepButton = document.getElementById('deviceStepButton');
    deviceTable?.setAttribute('class','deviceTableExpand');
    tasksetDiv?.setAttribute('style','opacity:0.1;');
    matFirstStep?.setAttribute('style','pointer-events: none !important;opacity:0.1;');
    matSecondStep?.setAttribute('style','pointer-events: none !important;opacity:0.1;');
    matFinalStep?.setAttribute('style','pointer-events: none !important;opacity:0.1;');
    tableContent?.setAttribute('style','height: calc(85vh - 300px);');
    deviceStepButton?.setAttribute('style','display:none;');
  }

  collapseTableList(){
    this.tableListExpand = !this.tableListExpand;
    const deviceTable = document.getElementById('deviceTable');
    const tasksetDiv = document.getElementById('tasksetDiv');
    const matFirstStep = document.querySelector('mat-stepper > div:nth-child(1) > mat-step-header');
    const matSecondStep = document.querySelector('mat-stepper > div:nth-child(2) > mat-step-header');
    const matFinalStep = document.querySelector('mat-stepper > div:nth-child(3) > mat-step-header');
    const tableContent = document.querySelector('#deviceTable > app-data-table > div > div.table-outline > cdk-virtual-scroll-viewport');
    const deviceStepButton = document.getElementById('deviceStepButton');
    deviceTable?.setAttribute('class','deviceTableCollapse');
    tasksetDiv?.setAttribute('style','opacity:1;');
    matFirstStep?.setAttribute('style','opacity:1;');
    matSecondStep?.setAttribute('style','opacity:1;');
    matFinalStep?.setAttribute('style','opacity:1;');
    tableContent?.setAttribute('style','height: calc(60vh - 320px);');
    deviceStepButton?.setAttribute('style','display:block;');
  }

  expandTaskset(){
    this.tasksetExpand = !this.tasksetExpand;
    const tasksetDiv = document.getElementById('tasksetDiv');
    const deviceTable = document.getElementById('deviceTable');
    const profileDiv = document.getElementById('profileDiv');
    const tasksetContent = document.querySelector('#profileDiv > app-teststage > mat-card > mat-card-content');
    const matFirstStep = document.querySelector('mat-stepper > div:nth-child(1) > mat-step-header');
    const matSecondStep = document.querySelector('mat-stepper > div:nth-child(2) > mat-step-header');
    const matFinalStep = document.querySelector('mat-stepper > div:nth-child(3) > mat-step-header');
    const teststage = document.getElementById('teststage');
    const deviceTitle = document.getElementById('deviceTitle');
    const deviceStepButton = document.getElementById('deviceStepButton');
    tasksetDiv?.setAttribute('class','tasksetInfoExpand');
    deviceTable?.setAttribute('style','opacity:0.2;');
    profileDiv?.setAttribute('class','profileExpand');
    teststage?.setAttribute('style','background:none');
    tasksetContent?.setAttribute('style','height:80vh;');
    matFirstStep?.setAttribute('style','pointer-events: none !important;opacity:0.1;');
    matSecondStep?.setAttribute('style','pointer-events: none !important;opacity:0.1;');
    matFinalStep?.setAttribute('style','pointer-events: none !important;opacity:0.1;');
    deviceTitle?.setAttribute('style','opacity:0.1;');
    deviceStepButton?.setAttribute('style','display:none;');
  }

  collapseTaskset(){
    this.tasksetExpand = !this.tasksetExpand;
    const tasksetDiv = document.getElementById('tasksetDiv');
    const deviceTable = document.getElementById('deviceTable');
    const profileDiv = document.getElementById('profileDiv');
    const tasksetContent = document.querySelector('#profileDiv > app-teststage > mat-card > mat-card-content');
    const matFirstStep = document.querySelector('mat-stepper > div:nth-child(1) > mat-step-header');
    const matSecondStep = document.querySelector('mat-stepper > div:nth-child(2) > mat-step-header');
    const matFinalStep = document.querySelector('mat-stepper > div:nth-child(3) > mat-step-header');
    const deviceTitle = document.getElementById('deviceTitle');
    const deviceStepButton = document.getElementById('deviceStepButton');
    tasksetDiv?.setAttribute('class','tasksetInfoCollapse');
    deviceTable?.setAttribute('style','opacity:1;');
    profileDiv?.setAttribute('class','profileCollapse');
    tasksetContent?.setAttribute('style','height:55vh;overflow-y: auto;');
    matFirstStep?.setAttribute('style','opacity:1;');
    matSecondStep?.setAttribute('style','opacity:1;');
    matFinalStep?.setAttribute('style','opacity:1;');
    deviceTitle?.setAttribute('style','opacity:1;');
    deviceStepButton?.setAttribute('style','display:block;');
  }

}
