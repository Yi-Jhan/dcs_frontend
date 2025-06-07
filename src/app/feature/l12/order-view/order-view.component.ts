import { Component, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as echarts from 'echarts';
import _ from 'lodash';
import { FormControl, FormGroup } from '@angular/forms';
import dayjs from 'dayjs';
import { TranslateService } from '@ngx-translate/core';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
import { CommonLibService, onDestroyed } from '../../../shared/common-lib';
import { SharedModule, workOrderAPI } from '../../../shared';
import { IEvent, IExportConfig } from '../../../core/model';
import { EventService, StateService } from '../../../shared/service';
import { CardEvent, ChipsInputEvent, ExportEvent, SearchBarEvent, TableEvent, Theme } from '../../../core/enum';
import { DataTableComponent, RackviewComponent, SearchBarComponent, StatusCardComponent } from '../../../shared/component';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-order-view',
  standalone: true,
  imports:[
    CommonModule,
    SharedModule,
    StatusCardComponent,
    SearchBarComponent,
    DataTableComponent,
    RackviewComponent
  ],
  templateUrl: './order-view.component.html',
  styleUrls: ['./order-view.component.scss']
})
export class OrderViewComponent implements OnInit {
  destroy$ = onDestroyed();
  orderviewDetailsListData: Array<any> = new Array<any>();
  orderviewStatus: Array<any> = new Array<any>();
  orderviewStatusSum: any = '';
  orderviewStatusDoneSum: any = '';
  completionRate: number = 0;
  enableCompleteIcon: boolean = false;
  cabinetData: Array<any> = new Array<any>();
  // tableInfo: any;
  columnsDef: Array<any>;
  groupByColumns: Array<string>;
  columns: Array<any>;
  isLoadingResults = true;
  filters = new Array<string>();
  cabinetFilter = '';
  statusFilter = '';
  racknodeFilter = '';
  filterListData: Array<any> = new Array<any>();
  chartId: any;
  completeChart: any;
  completeChartOption: any;
  durationChart: any;
  durationChartOption: any;
  durationSum: any;
  chartsLabelColor: any;
  statusCreatedVal: any;
  statusProcessingVal: any;
  statusPassVal: any;
  statusFailVal: any;
  totalDuration: any;

  daterange = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  startDate: any;
  endDate: any;

  exportData = {} as IExportConfig;
  tableData:any;
  doubleclick:boolean = false;
  dbclickTime = 0;
  rackviewData:any = [];
  theme = this.stateService.theme;
  mode = this.theme();
  lang$ = toObservable(this.stateService.language);

  tableID = 'OrderViewListData';
  workorderAPI = workOrderAPI();

  constructor(
    private router: Router,
    private eventService: EventService,
    private stateService: StateService,
    private commonLib: CommonLibService,
    private translate: TranslateService,
    private route: ActivatedRoute) {
    this.columnsDef = [
      { field: 'serialNumber', headerName: 'i18n_SerialNumber', width: '150px', cellRender: this.snCellRender },
      { field: 'status', headerName: 'i18n_Connected', width: '150px', cellRender:this.connectedRender},
      { field: 'model', headerName: 'i18n_Model', width: '120px' },
      { field: 'progress', headerName: 'i18n_Progress', width: '100px', cellRender: this.progressCellRender },
      { field: 'macAddress', headerName: 'i18n_MacAddress', width: '100px', visible: false },
      { field: 'ipAddress', headerName: 'i18n_IPAddress', width: '100px' },
      { field: 'description', headerName: 'i18n_Description', width: '100px', visible: false },
      { field: 'duration', headerName: 'i18n_Duration', width: '100px' },
      { field: 'processorSet', headerName: 'i18n_CPU', width: '300px', cellRender: this.cpuCellRender },
      { field: 'memorySet', headerName: 'i18n_Memory', width: '150px', cellRender: this.memoryCellRender },
      { field: 'diskSet', headerName: 'i18n_Storage', width: '400px', cellRender: this.diskCellRender },
      { field: 'gpuSet', headerName: 'i18n_Addon', width: '150px', cellRender: this.gpuCellRender },
      { field: 'createdAt', headerName: 'i18n_CreatedDate', width: '150px' },
      { field: 'updatedAt', headerName: 'i18n_UpdatedDateTime', width: '150px' },
      { field: 'location', headerName: 'i18n_Location', width: '100px', visible: false },
      { field: 'cabinet', headerName: 'i18n_Cabinet', width: '100px', visible: false },
      { field: 'position', headerName: 'i18n_Position', width: '100px', visible: false },
      { field: 'size', headerName: 'i18n_Size', width: '100px', visible: false },
      { field: 'orderStatus', headerName: 'i18n_OrderStatus', width: '100px', visible: false },
    ];

    this.groupByColumns = ['orderStatus'];

    this.columns = _.map(this.columnsDef, item => {
      return { field: item.field, name: item.headerName, checked: _.includes(this.groupByColumns, item.field) };
    });

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
    this.getOrderViewDetailsData();
    this.initEvent();
    this.resize();
    this.getLang();
  }

  getLang(){
    this.lang$.subscribe(()=>{
      setTimeout(() => {
        this.initChart();
      }, 100);
    });
  }

  updateListData(){
    this.orderviewDetailsListData = _.filter(this.orderviewDetailsListData, item => {
      if(this.cabinetFilter && !(item.cabinet === this.cabinetFilter)) {
        return false;
      }
      if(this.statusFilter && !(item.orderStatus === this.statusFilter)) {
        return false;
      }
      if(this.startDate && this.endDate) {
        const date = new Date(`${item.createdAt.split('T')[0]}`);
        if(!(date >= this.startDate && date <= this.endDate)) {
          return false;
        }
      }
      if(this.racknodeFilter && !(item.position === this.racknodeFilter)) {
        return false;
      }
      return true;
    });
  }

  getOrderViewDetailsData() {
      this.route.params.subscribe((params:any)=>{
        this.workorderAPI.getWorkOrderData(params.order).subscribe((resp:any) => {
            var o = 0;
            var deviceObj = {};
            _.forEach(resp.workOrder.deviceInfoList,orderData=>{
              for(var i = 0; i < orderData.node;i++){
                deviceObj = {
                  serialNumber:orderData.serialNumber + '-node'+(i+1),
                  orderStatus: !_.isUndefined(orderData.orderStatus[i]) ? orderData.orderStatus[i].value : '',
                  status: !_.isUndefined(orderData.status[i]) ? orderData.status[i].value : '',
                  messageLight: !_.isUndefined(orderData.messageLight[i]) ? orderData.messageLight[i].value : '',
                  locatorLight: !_.isUndefined(orderData.locatorLight[i]) ? orderData.locatorLight[i].value : '',
                  processorSet: !_.isUndefined(orderData.processorSet[i]) ? orderData.processorSet[i].value : '',
                  memorySet: !_.isUndefined(orderData.memorySet[i]) ? orderData.memorySet[i].value : '',
                  baseboardSet: !_.isUndefined(orderData.baseboardSet[i]) ? orderData.baseboardSet[i].value : '',
                  biosSet: !_.isUndefined(orderData.biosSet[i]) ? orderData.biosSet[i].value : '',
                  bmcSet: !_.isUndefined(orderData.bmcSet[i]) ? orderData.bmcSet[i].value : '',
                  diskSet: !_.isUndefined(orderData.diskSet[i]) ? orderData.diskSet[i].value : '',
                  ethernetSet: !_.isUndefined(orderData.ethernetSet[i]) ? orderData.ethernetSet[i].value : '',
                  gpuSet: !_.isUndefined(orderData.gpuSet[i]) ? orderData.gpuSet[i].value : '',
                  createdAt: !_.isUndefined(orderData.createdAt) ? orderData.createdAt.split('T')[0] + ' ' + orderData.createdAt.split('T')[1].split('.')[0] : ' ',
                  updatedAt: !_.isUndefined(orderData.updatedAt) ? orderData.updatedAt.split('T')[0] + ' ' + orderData.updatedAt.split('T')[1].split('.')[0] : ' ',
                  discovered:true
                }
                this.orderviewDetailsListData.push(deviceObj);
                _.assign(this.orderviewDetailsListData[o],
                  _.omit(orderData,
                    _.keys(deviceObj)));
                o++;
              }
            });

            this.orderviewDetailsListData = _.clone(this.orderviewDetailsListData);
            this.isLoadingResults = false;
        });
      });
  }

  removeCabinetFilter() {
    this.cabinetFilter = '';
    this.updateOrderViewData();
  }

  removeStatusFilter() {
    this.statusFilter = '';
    this.updateOrderViewData();
  }

  removeRacknodeFilter() {
    this.racknodeFilter = '';
    this.updateOrderViewData();
  }

  removeDateRangeFilter(): void {
    this.endDate = null;
    this.startDate = null;
    this.eventService.emit({id: 'orderview', eventName: SearchBarEvent.RemoveDateRange});
    this.updateOrderViewData();
  }

  getDateString(d: Date): string {
    return (d instanceof Date) ? dayjs(d).format('MM/DD') : '';
  }

  updateOrderViewData() {
    this.orderviewDetailsListData = _.filter(this.orderviewDetailsListData, item => {
      let hasCabinet = true;
      let hasStatus = true;
      let hasRacknode = true;
      if (this.cabinetFilter) {
        hasCabinet = item.cabinet === this.cabinetFilter;
      }
      if (this.statusFilter) {
        hasStatus = item.status === this.statusFilter;
      }
      if (this.racknodeFilter) {
        hasRacknode = item.position === this.racknodeFilter;
      }
      return hasCabinet && hasStatus && hasRacknode;
    })
  }

  filtereventHandler(eventName: string, data: any): void {
    const e: IEvent = { id: 'orderviewFilter', eventName, data };
    this.eventService.emit(e);
  }

  cabinetAll() {
    this.filters = [];
    this.cabinetFilter = '';
    this.statusFilter = '';
    this.racknodeFilter = '';
    this.daterange.reset();
    this.startDate = '';
    this.endDate = '';
    this.updateListData();
  }

  clickCabinet(data: any) {
    this.filtereventHandler('cabinetSelection', data);
  }

  clickRackNode(racknode: any) {
    this.filtereventHandler('racknodeClick', racknode);
  }

  getCabinetStatus(cabinetData: any) {
    this.cabinetData = cabinetData;
    this.cabinetData = _.forEach(this.cabinetData, (element: any) => {
      var failStatus = _.some(element.data, (ele: any) => {
        return (ele.orderStatus === 'Fail');
      })
      var passStatus = _.some(element.data, (ele: any) => {
        return (ele.orderStatus === 'Pass');
      })
      var processingStatus = _.some(element.data, (ele: any) => {
        return (ele.orderStatus === 'Processing');
      })
      var createdStatus = _.some(element.data, (ele: any) => {
        return (ele.orderStatus === 'Created');
      })
      if (failStatus) {
        element['orderStatus'] = 'Fail';
      }
      else if (!failStatus && passStatus) {
        element['orderStatus'] = 'Pass';
      }
      else if (!failStatus && !passStatus && processingStatus) {
        element['orderStatus'] = 'Processing';
      }
      else if (!failStatus && !passStatus && !processingStatus && createdStatus) {
        element['orderStatus'] = 'Created';
      }
    });
  }

  snCellRender(data: any) {
    const div = document.createElement('div');
    const i = document.createElement('i');

    let status = "";
    switch (data.orderStatus) {
      case 'Created':
        status = "status-font-init";
        break;

      case 'Processing':
        status = "status-font-default";
        break;

      case 'Pass':
        status = "status-font-success";
        break;

      case 'Fail':
        status = "status-font-danger";
        break;
    }
    if(status){
      i.classList.add("fas", "fa-circle", status);
      div.innerHTML = '&nbsp;&nbsp;' + data.serialNumber;
      div.prepend(i);
    }
    else{
      div.innerHTML = data.serialNumber;
    }
    return div;
  }

  progressCellRender(data: any) {
    let statusClass = "progress-bar-info progress-bar-animated";
    const progress = document.createElement('div');
    progress.className = 'progress';
    const progressbar = document.createElement('div');
    progressbar.className = 'progress-bar progress-bar-striped ' + statusClass;
    progressbar.setAttribute('role', 'progressbar');
    progressbar.style.width = `${data.progress}%`;
    progressbar.setAttribute('aria-valuenow', `${data.progress}`);
    progressbar.setAttribute('aria-valuemin', '0');
    progressbar.setAttribute('aria-valuemax', '100');
    const value = document.createElement('span');
    value.innerHTML = data.progress + '%&nbsp;'
    progressbar.appendChild(value);
    progress.appendChild(progressbar);
    return progress;
  }

  cpuCellRender(data: any) {
    const div = document.createElement('div');
    if(data.processorSet.length > 0){
      var cpu = _.chain(data.processorSet)
      .groupBy('model')
      .map((val, key) => ({ model: key, count: val.length }))
      .value();
      if(cpu.length > 1){
        for(let i = 0; i < cpu.length;i++){
          div.innerHTML += cpu[i].model + '&nbsp *' + cpu[i].count;
        }
      }
      else{
        div.innerHTML += cpu[0].model;
      }
    }
    return div;
  }

  memoryCellRender(data: any) {
    const div = document.createElement('div');
    if(data.memorySet.length > 0){
      for(let i = 0; i < data.memorySet.length;i++){
        div.innerHTML += (((data.memorySet[i].capacity/1024)/1024)/1024) + '&nbsp;GB';
      }
    }
    return div;
  }

  diskCellRender(data: any) {
    const div = document.createElement('div');
    var initData = data;
    var diskData = data;
    if(diskData.diskSet.length > 0){
      var disk = _.chain(initData.diskSet)
      .groupBy('model')
      .map((val, key) => ({ model: key, count: val.length }))
      .value();

    if(disk.length > 1){
      for(let i = 0; i < disk.length;i++){
        div.innerHTML += disk[i].model + `&nbsp;(${Math.floor((((initData.diskSet[i].size/1024)/1024)/1024))}&nbsp;GB)&nbsp;;`;
      }
    }
    else{
      div.innerHTML += disk[0].model + `&nbsp;(${Math.floor((((initData.diskSet[0].size/1024)/1024)/1024))}&nbsp;GB)`;
    }

  }
    return div;
  }

  gpuCellRender(data: any) {
    const div = document.createElement('div');
    if(data.gpuSet.length > 0){
      var gpu = _.chain(data.gpuSet)
      .groupBy('model')
      .map((val, key) => ({ model: key, count: val.length }))
      .value();
      for(let i = 0; i < gpu.length;i++){
        div.innerHTML += gpu[i].model + ':&nbsp;' + gpu[i].count + '&nbsp;&nbsp;';
      }
    }
    return div;
  }

  connectedRender(data:any){
    const div = document.createElement('div');
    const i = document.createElement('i');
    let connected = "";
    let state = "";

    switch (data.status) {
      case "Connected":
        connected = "status-font-success";
        state = "Connected";
        break;

      case "Disconnected":
        connected = "status-font-danger";
        state = "Disconnected";
        break;
    }

    if(connected){
      i.classList.add("fas", "fa-circle", connected);
      div.innerHTML = '&nbsp;&nbsp;' + state;
      div.prepend(i);
    }
    else{
      div.innerHTML = data.status;
    }
    return div;
  }

  initEvent(): void {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      // console.log('event',event)
      switch (event.eventName) {
        case ChipsInputEvent.InputChange:
          this.filters = _.clone(event.data);
          break;

        case TableEvent.RowClicked:
          let param: string = event.data ? event.data.serialNumber : null;
          const serialNumber = event.data.serialNumber.split('-')[0];
          const nodeNumber = event.data.serialNumber.split('node')[1];
          if (param) this.router.navigate(['DeviceInfo', param],{state:{serialNumber:serialNumber, nodeNumber:nodeNumber}});
          this.router.navigate(['/DeviceInfo', param],{state:{serialNumber:serialNumber, nodeNumber:nodeNumber}});
          break;

        case 'updateTableData':
          this.filterListData = event.data;
          var rackviewData:any = [];
          var deviceObj = {};
          _.chain(this.filterListData)
          .filter(data => { return data.cabinet })
          .groupBy(filterData=>String(filterData.serialNumber).split('-')[0])
          .map((val,key)=>({ serialNumber:key, data:val}))
          .forEach(groupData=>{
            deviceObj = {
              serialNumber: groupData.serialNumber,
              status:_.map(groupData.data,(data,index)=>{ return {node:index+1,value:data.status}}),
              messageLight:_.map(groupData.data,(data,index)=>{ return {node:index+1,value:data.messageLight}}),
              locatorLight:_.map(groupData.data,(data,index)=>{ return {node:index+1,value:data.locatorLight}}),
              orderStatus:_.map(groupData.data,(data,index)=>{ return {node:index+1,value:data.orderStatus}}),
              processorSet:_.map(groupData.data,(data,index)=>{ return {node:index+1,value:data.processorSet}}),
              memorySet:_.map(groupData.data,(data,index)=>{ return {node:index+1,value:data.memorySet}}),
              baseboardSet:_.map(groupData.data,(data,index)=>{ return {node:index+1,value:data.baseboardSet}}),
              biosSet:_.map(groupData.data,(data,index)=>{ return {node:index+1,value:data.biosSet}}),
              bmcSet:_.map(groupData.data,(data,index)=>{ return {node:index+1,value:data.bmcSet}}),
              diskSet:_.map(groupData.data,(data,index)=>{ return {node:index+1,value:data.diskSet}}),
              ethernetSet:_.map(groupData.data,(data,index)=>{ return {node:index+1,value:data.ethernetSet}}),
              gpuSet:_.map(groupData.data,(data,index)=>{ return {node:index+1,value:data.gpuSet}}),
            }
            rackviewData.push(deviceObj);
            _.assign(rackviewData[rackviewData.length - 1], _.omit(groupData.data[0], _.keys(deviceObj)));
            // for(var i = 0; i < groupData.data.length; i++){
            //  _.assign(rackviewData[index],
            //   _.omit(groupData.data[i],
            //     _.keys(deviceObj)));
            // }
          })
          .value();
          this.rackviewData = rackviewData;
          setTimeout(() => {
            this.cabinetData = _.chain(this.filterListData)
              .filter(data => { return data.cabinet })
              .sortBy('cabinet')
              .groupBy('cabinet')
              .map((val, key) => ({ device: key, data: val }))
              .value();

            this.getCabinetStatus(this.cabinetData)

            var status = _.chain(this.filterListData).filter(data => { return data.cabinet }).groupBy('orderStatus').map((val, key) => ({ value: val.length, name: key })).value();
            this.statusCreatedVal = _.find(status, obj => { return obj.name === 'Created' })?.value;
            this.statusProcessingVal = _.find(status, obj => { return obj.name === 'Processing' })?.value;
            this.statusPassVal = _.find(status, obj => { return obj.name === 'Pass' })?.value;
            this.statusFailVal = _.find(status, obj => { return obj.name === 'Fail' })?.value;

            this.orderviewStatus = [
              { value: _.isUndefined(this.statusCreatedVal) ? 0 : this.statusCreatedVal, name: 'Created' },
              { value: _.isUndefined(this.statusProcessingVal) ? 0 : this.statusProcessingVal, name: 'Processing' },
              { value: _.isUndefined(this.statusPassVal) ? 0 : this.statusPassVal, name: 'Pass' },
              { value: _.isUndefined(this.statusFailVal) ? 0 : this.statusFailVal, name: 'Fail' },
            ]

            this.orderviewStatusSum = _.sumBy(this.orderviewStatus, status => status.value);

            this.updateChartVal();
          }, 100);
          break;

        case 'cabinetSelection':
          this.cabinetFilter = event.data;
          this.updateListData();
          break;

        case 'racknodeClick':
          this.cabinetFilter = event.data.cabinet;
          this.racknodeFilter = event.data.position;
          this.updateListData();
          break;

        case CardEvent.ChangeCardFilter:
          case 'statusCard':
            this.statusFilter = event.data;
            this.updateListData();
            break;

          case SearchBarEvent.StartDateChange:
            this.startDate = event.data;
            this.endDate = null;
            break;

          case SearchBarEvent.EndDateChange:
            this.endDate = event.data;
            this.updateListData();
            break;

          case SearchBarEvent.CancelDateChange:
            this.startDate = null;
            this.endDate = null;
            this.updateOrderViewData();
            break;

            case SearchBarEvent.ClearSearchInput:
              this.cabinetFilter = '';
              this.statusFilter = '';
              this.racknodeFilter = '';
              this.endDate = null;
              this.startDate = null;
              this.updateOrderViewData();
              break;

            case ExportEvent.Export:
              this.exportFile();
              break;
      }
    });
  }

  initChart() {
    this.completeChartOption = {
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
          // center: ['50%', '40%']
        }
      ]
    };

    this.durationChartOption = {
      grid: {
        left: '10%',
        right: '0%',
        bottom: '15%',
        width: "auto",
        height: "auto",
        containLabel: true
      },
      xAxis: {
        type: 'category',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        splitNumber: 3,
        splitLine: {
          show: false,
        },
        axisLabel: {
          formatter: '{value} h'
        },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          showSymbol: false,
          areaStyle: {
            color: 'rgb(141, 214, 514)',
            opacity: 0.1
          },
          itemStyle: {
            normal: {
              lineStyle: {
                color: 'rgb(141, 214, 514)',
                width: 4
              }
            }
          }
        }
      ]
    };

    var echartsName: any = ['Complete', 'Duration'];
    for (let e = 0; e < echartsName.length; e++) {
      this.chartId = document.getElementById('chart' + echartsName[e]);
      if (this.chartId) {
        switch (echartsName[e]) {
          case 'Complete':
            let completeChart = echarts.getInstanceByDom(this.chartId);
            if( completeChart == null){
              this.completeChart = echarts.init(this.chartId);
            }
            this.completeChart.setOption(this.completeChartOption);
            this.completeChart.setOption({
              series: [{
                label: {
                  formatter: () => {
                    return this.completionRate + '%\n\n' + this.translate.instant('i18n_CurrentCompletionRates');
                  },
                },
                data: [
                  { value: this.orderviewStatusDoneSum, name: 'Done', itemStyle: { color: 'rgb(0, 198, 137)', borderRadius: '10%' } },
                  { value: this.orderviewStatusSum - this.orderviewStatusDoneSum, name: 'All', itemStyle: { color: 'rgb(230, 231, 238)' } }
                ]
              }]
            });
            this.enableCompleteIcon = true;
            break;

          case 'Duration':
            let durationChart = echarts.getInstanceByDom(this.chartId);
            if( durationChart == null){
              this.durationChart = echarts.init(this.chartId);
            }
            break;
        }

      }
    }
  }

  updateChartVal() {
    var passVal: any = _.find(this.orderviewStatus, obj => { return obj.name === 'Pass' });
    var failVal: any = _.find(this.orderviewStatus, obj => { return obj.name === 'Fail' });
    this.orderviewStatusSum = _.sumBy(this.orderviewStatus, status => status.value);
    this.orderviewStatusDoneSum = passVal.value + failVal.value;
    this.completionRate = Math.round((passVal?.value + failVal?.value) / this.orderviewStatusSum * 100);
    var durationData = _.chain(this.filterListData)
      .filter(data => { return data.cabinet })
      .groupBy('duration')
      .map((val, key) => ({ total: val.length, time: key }))
      .value();

    var duration = _.forEach(durationData, (element: any) => {
      element['duration'] = element.total * this.secondsToHms(element.time)
    });

    this.durationSum = _.sumBy(duration, 'duration');

    if (this.chartId) {
      this.completeChart.setOption({
        series: [{
          label: {
            formatter: () => {
              return _.isNaN(this.completionRate) ? 0 + '%\n\n' + this.translate.instant('i18n_CurrentCompletionRates') : this.completionRate + '%\n\n' + this.translate.instant('i18n_CurrentCompletionRates');
            },
          },
          data: [
            { value: this.orderviewStatusDoneSum, name: 'Done', itemStyle: { color: 'rgb(0, 198, 137)', borderRadius: '10%' } },
            { value: this.orderviewStatusSum == 0 ? 1 : this.orderviewStatusSum - this.orderviewStatusDoneSum, name: 'All', itemStyle: { color: 'rgb(230, 231, 238)' } }
          ]
        }]
      });

      this.durationChart.setOption(this.durationChartOption);

      var createdTimeDuration: any = _.chain(this.filterListData)
        .filter(data => { return data.cabinet })
        .forEach(element => {
          element['createdTime'] = element.createdAt.toString().substring(0, 6);
          element['durationtoHrs'] = this.secondsToHms(element.duration);
        })
        .groupBy('createdTime')
        .map((val, key) => (
          { createdTime: key, duration: _.sumBy(val, 'durationtoHrs') }
        ))
        .value();
      var createdTime = _.map(createdTimeDuration, data => { return data.createdTime });
      var createdTimemin = _.min(createdTime);
      var minyear = _.isUndefined(createdTimemin) ? new Date().getFullYear() : createdTimemin.substring(0, 4);
      var minMon = _.isUndefined(createdTimemin) ? new Date().getMonth() + 2 : createdTimemin.substring(4, 6);

      var defaulttdate: any = new Date(minyear, minMon);
      defaulttdate.setMonth(defaulttdate.getMonth() - 1);
      defaulttdate = defaulttdate.toISOString();
      createdTimeDuration = _.chain(createdTimeDuration)
        .push({ 'createdTime': '', 'duration': 0 })
        .sortBy('createdTime')
        .value();
      this.totalDuration = _.sumBy(createdTimeDuration, 'duration');
      this.durationChart.setOption({
        xAxis: {
          data: _.map(createdTimeDuration, data => { return data.createdTime })
        },
        series: [
          {
            data: _.map(createdTimeDuration, data => { return data.duration })
          }
        ]
      });
    }
  }

  secondsToHms(time: any) {
    var find1 = _.values(time).some(b => b.includes("d"));
    var find2 = _.values(time).some(b => b.includes("h"));
    var d: any;
    var h: any;
    var m: any;
    if (find1) {
      d = _.isUndefined(time.split(':')[0]) ? 0 : _.toNumber(time.split(':')[0].split('d')[0] * 24);
      h = _.isUndefined(time.split(':')[1]) ? 0 : _.toNumber(time.split(':')[1].split('h')[0]);
      m = _.isUndefined(time.split(':')[2]) ? 0 : _.toNumber((time.split(':')[2].split('m')[0] / 60).toFixed(1));
      return d + h + m;
    }
    else if (find2) {
      h = _.isUndefined(time.split(':')[1]) ? 0 : _.toNumber(time.split(':')[0].split('h')[0]);
      m = _.isUndefined(time.split(':')[2]) ? 0 : _.toNumber((time.split(':')[1].split('m')[0] / 60).toFixed(1));
      return h + m;
    }
    else {
      return 0;
    }
  }

  resize() {
    var mousePosition: any;
    var resizeBar: any = document.getElementById("resizeBar");
    var rackviewDiv: any = document.getElementById('rackviewDiv');
    var dashboardDiv: any = document.getElementById('dashboardDiv');
    var chartCompleteCard:any = document.getElementById('chartCompleteCard');
    var statusCardDiv: any = document.getElementById('statusCardDiv');
    var durationCardDiv:any = document.getElementById('durationCardDiv');
    var tableListDiv: any = document.getElementById('tableListDiv');
    var dashboardTitle:any = document.getElementsByClassName('dashboardTitle');

    function resizebar(event: any) {
      var parent: any = resizeBar.parentNode;
      var dx = mousePosition - event.x;
      mousePosition = event.x;
      if (mousePosition > window.screen.width*0.135) {
        parent.style.width = (parseInt(getComputedStyle(parent, '').width) - dx) + "px";
        if (resizeBar && rackviewDiv && dashboardDiv &&  tableListDiv) {
          resizeBar.style.left = (mousePosition + 10) + 'px';
          rackviewDiv.style.left = mousePosition + 'px';
          dashboardDiv.setAttribute('style',`width:${mousePosition - 20 + 'px'};position:unset;`);
          chartCompleteCard.setAttribute('style',`position:unset;width:100%;right:unset;`);
          statusCardDiv.style.display = 'block';
          durationCardDiv.style.display = 'block';
          tableListDiv.setAttribute('style',`width:${mousePosition + 'px'};display:block;`);
          dashboardTitle =_.each(dashboardTitle,element=>{
            element.style.fontSize = '';
          });
          window.dispatchEvent(new Event('resize'));
          if(mousePosition < window.screen.width*0.7){
            durationCardDiv.style.display = 'none';
          }
          if(mousePosition < window.screen.width*0.5){
            statusCardDiv.style.display = 'none';
          }
          if(mousePosition < window.screen.width*0.3){
            dashboardDiv.setAttribute('style',`width:${window.screen.width*0.08+'px'};position:fixed;transform: translate(-10%,-10%) scale(0.8, 0.8);`);
            chartCompleteCard.setAttribute('style',`position:relative;width:110%;right:10%;margin-bottom:-25%;`);
            statusCardDiv.style.display = 'block';
            tableListDiv.style.display = 'none';
            dashboardTitle =_.each(dashboardTitle,element=>{
              element.style.fontSize = '18px';
            });
          }
        }
      }
    }

    resizeBar.addEventListener("pointerdown", function (event: any) {
      mousePosition = event.x;
      document.addEventListener("pointermove", resizebar, false);
      document.getElementById('orderviewDiv')?.classList.toggle('moving', true);
    }, false);

    document.addEventListener("pointerup", function () {
      document.removeEventListener("pointermove", resizebar, false);
      document.getElementById('orderviewDiv')?.classList.toggle('moving', false);
    }, false);
  }

  resizedoubleClick(){
    if(this.dbclickTime == 0){
      this.dbclickTime = new Date().getTime();
    }
    else{
      this.dbclickTime = 0;
      this.doubleclick = !this.doubleclick;
        if(this.doubleclick) {
          this.setSmaillScreen();
        }
        else{
          this.getOriginalScreen();
      }
    }
  }

  setSmaillScreen(){
    var resizeBar:any = document.getElementById("resizeBar");
    var rackviewDiv:any = document.getElementById('rackviewDiv');
    var dashboardDiv:any = document.getElementById('dashboardDiv');
    var chartCompleteCard:any = document.getElementById('chartCompleteCard');
    var durationCardDiv:any = document.getElementById('durationCardDiv');
    var tableListDiv:any = document.getElementById('tableListDiv');
    var dashboardTitle:any = document.getElementsByClassName('dashboardTitle');

    resizeBar.style.left = window.screen.width*0.145+'px';
    rackviewDiv.style.left = window.screen.width*0.14+'px';
    dashboardDiv.setAttribute('style',`width:${window.screen.width*0.08+'px'};position:fixed;transform: translate(-10%,-10%) scale(0.8, 0.8);`);
    chartCompleteCard.setAttribute('style',`position:relative;width:110%;right:10%;margin-bottom:-25%;`);
    durationCardDiv.style.display = 'none';
    tableListDiv.style.display = 'none';
    dashboardTitle =_.each(dashboardTitle,element=>{
      element.style.fontSize = '18px';
    });
  }

  getOriginalScreen(){
    var resizeBar:any = document.getElementById("resizeBar");
    var rackviewDiv:any = document.getElementById('rackviewDiv');
    var dashboardDiv:any = document.getElementById('dashboardDiv');
    var chartCompleteCard:any = document.getElementById('chartCompleteCard');
    var statusCardDiv:any = document.getElementById('statusCardDiv');
    var durationCardDiv:any = document.getElementById('durationCardDiv');
    var tableListDiv:any = document.getElementById('tableListDiv');
    var dashboardTitle:any = document.getElementsByClassName('dashboardTitle');

    resizeBar.style.left = '71.7vw';
    rackviewDiv.style.left = '71.2vw';
    dashboardDiv.setAttribute('style',`width:${window.screen.width*0.0368+'vw'};position:unset`);
    chartCompleteCard.setAttribute('style',`position:unset;width:100%;right:unset;`);
    statusCardDiv.style.display = 'block';
    durationCardDiv.style.display = 'block';
    tableListDiv.setAttribute('style',`width:${window.screen.width*0.0372+'vw'};display:block;`);
    dashboardTitle =_.each(dashboardTitle,element=>{
      element.style.fontSize = '';
    });
    window.dispatchEvent(new Event('resize'));
  }

  getHtmlCanvas(element: HTMLElement, width:any, height:any, scrollX?:any): Promise<HTMLCanvasElement> {
    return html2canvas(element, {
      scrollX: scrollX,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight
    });
  }

  async exportFile(): Promise<void>  {
    this.exportData.exportContent = new Array();
    const cabinetCard = document.getElementById('cabinetCard');
    const ratesCard = document.getElementById('ratesCard');
    const statusCard = document.getElementById('statusCardDiv');
    const durationCard = document.getElementById('durationCardDiv');
    const rackview = document.getElementById('rackview');

    const dashboardImages = new Array<any>();
    const rackImages = new Array<any>();

    this.exportData.screenName = 'Order View';
    this.exportData.pageOrientation = 'landscape';

      if(this.filterListData.length > 0 && cabinetCard && ratesCard && statusCard && durationCard && rackview){
        statusCard.style.flex = '1 0 5%';
        this.getOriginalScreen();
        await Promise.all([
          this.getHtmlCanvas(cabinetCard, 240, 380, 200),
          this.getHtmlCanvas(ratesCard, 320, 380),
          this.getHtmlCanvas(statusCard, 380, 380),
          this.getHtmlCanvas(durationCard, 320, 380)
        ]).then(elements => {
          _.each(elements, element => {
            statusCard.style.flex = '1 0 10%';
            dashboardImages.push(element.toDataURL());
          });
        });

        await Promise.all([
          this.getHtmlCanvas(rackview,1200,800)
        ]).then(elements => {
          _.each(elements, element => {
            rackImages.push(element.toDataURL());
          });
        });
     }

    this.exportData.exportContent.push(
      {
      dataType: 'image',
      data: dashboardImages,
      title: '',
      position: 0,
      imageFit: 200
     },
     {
      dataType: 'table',
      data: this.tableData,
      position: 1
    },
    {
    dataType: 'image',
    data: rackImages,
    title: 'Rack View',
    position: 2,
    imageFit: 1000
    },
    );

    this.commonLib.openTableExportDialog(this.exportData);
  }
}

