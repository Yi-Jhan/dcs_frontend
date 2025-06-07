import { Component, OnInit } from '@angular/core';
import _ from 'lodash';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import isBetween from 'dayjs/plugin/isBetween';
import { SharedModule, onDestroyed, openTableExportDialogFn, overviewAPI, workOrderAPI } from '../../../shared';
import { IDialogButton, IExportConfig } from '../../../core/model';
import { DialogService, EventService } from '../../../shared/service';
import { CardEvent, ChipsInputEvent, DialogEvent, ExportEvent, SearchBarEvent, TableEvent } from '../../../core/enum';
import { CommonModule } from '@angular/common';
import { DataTableComponent, DurationCardComponent, LocationCardComponent, SearchBarComponent, StatusCardComponent } from '../../../shared/component';
import { TranslateService } from '@ngx-translate/core';
import { Group } from '../../../shared/component/data-table/data-table.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    StatusCardComponent,
    LocationCardComponent,
    DurationCardComponent,
    SearchBarComponent,
    DataTableComponent
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],

})
export class OverviewComponent implements OnInit {
  destroy$ = onDestroyed();
  openTableExportDialog = openTableExportDialogFn();
  workorderAPI = workOrderAPI();
  overviewAPI =  overviewAPI();

  // tableInfo: any;
  tableID = 'orderlistTable';
  columnsDef: Array<any>;
  groupByColumns: Array<string>;
  isLoadingResults;
  filters: Array<string>;
  statusFilter: string;
  statusFilterClass: string;
  startDate: any;
  endDate: any;
  edgeGatewayFilter: Array<string>;
  orderFilter: Array<string>;
  exportData: IExportConfig;
  exportTableData: any;

  filterData: Array<any>;
  listData = new Array();
  deleteOrderNo:any;
  deleteConfirmID = 'DeleteConfirm';

  constructor(
    private eventService: EventService,
    private router: Router,
    private dialogService: DialogService,
    private translate: TranslateService,
  ) {
    dayjs.extend(isBetween);

    this.isLoadingResults = false;
    this.filters = new Array<string>();
    this.statusFilter = '';
    this.statusFilterClass = '';
    this.edgeGatewayFilter = new Array<string>();
    this.orderFilter = new Array<string>();
    this.exportData = {} as IExportConfig;

    this.filterData = new Array<any>();

    this.columnsDef = [
      //{ field: 'Status', headerName: 'Status', width: '100px', cellRender: this.statusCellRender },
      { field: 'delete', headerName: '', width: '26px', cellRender: this.deleteCellRender, cellEvent: 'click' },
      { field: 'orderNo', headerName: 'i18n_OrderNo', width: '100px' , cellRender: this.orderCellRender },
      { field: 'progress', headerName: 'i18n_Progress', width: '100px', cellRender: this.progressCellRender },
      { field: 'durationMinute', headerName: 'i18n_Duration', width: '150px', cellRender: this.durationCellRender },
      { field: 'location', headerName: 'i18n_Location', width: '100px', visible: false },
      { field: 'edgeGateway', headerName: 'i18n_EdgeGateway', width: '100px' },
      { field: 'amount', headerName: 'i18n_Amount', width: '100px' },
      { field: 'description', headerName: 'i18n_Description', width: '150px' },
      { field: 'createdAt', headerName: 'i18n_CreatedDate', width: '180px', visible: false, cellRender: this.createTimeCellRender },
      { field: 'updatedAt', headerName: 'i18n_UpdatedDateTime', width: '180px', visible: false, cellRender: this.updateTimeCellRender }
    ];

    this.groupByColumns = ['edgeGateway'];
  }

  ngOnInit(): void {
    this.initEvent();
    this.getOverViewList();
  }

  initEvent(): void {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      switch(event.eventName) {
        case ChipsInputEvent.InputChange:
          this.filters = _.clone(event.data);
          break;

        case TableEvent.RowClicked:
          if(event.data.counter > 0) {
            let param: string= event.data ? event.data.orderNo : null;
            if(param !== null) {
              this.router.navigate(['OrderView', param]);
            }
            else {
              this.dialogService.open('no order No');
            }
          }
          else {
            this.router.navigate(['AddWorkOrder'], {state: event.data['orderNo']});
          }
          break;

        case TableEvent.UpdateTableData:
          this.filterData = _.filter(event.data, item => {
            return !(item instanceof(Group));
          });
          break;

        case CardEvent.ChangeCardFilter:
          switch(event.id) {
            case 'statusCard':
              this.statusFilter = event.data;
              break;

            case 'locationCard':
              this.edgeGatewayFilter = event.data;
              break;

            case 'durationCard':
              this.orderFilter = event.data;
              break;
          }
          this.updateListData();
          break;

        case TableEvent.ColumnVisible:
          this.exportTableData = event.data;
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
          this.updateListData();
          break;

        case ExportEvent.Export:
          this.exportFile();
          break;

        case TableEvent.CellEvent:
          this.deleteOrderNo = event.data.orderNo;
          this.openDeleteWorkOrderDialog(this.deleteConfirmID, this.translate.instant('i18n_ConfirmDelete'));
          break;

        case DialogEvent.ButtonClicked:
          switch(event.id) {
            case this.deleteConfirmID:
              this.deleteOrderNoFun(this.deleteOrderNo);
              this.dialogService.closeAll();
              break;
          }
          break;
      }
    });
  }

  getOverViewList(): void {
    this.isLoadingResults = true;
    this.overviewAPI.getOverviewList()
      .subscribe({
        next: (resp) => {
          _.each(resp, item => {
            item.durationMinute = this.getSecond(item.duration);
          });

          this.listData = resp;
        },
        error: (err: any) => this.isLoadingResults = false,
        complete: () => this.isLoadingResults = false
      });
  }

  //#region table Render
  deleteCellRender(data:any){
    const btn = document.createElement('button');
    btn.classList.add('cellBtn', 'danger');
    const i = document.createElement('i');
    i.classList.add('fa-solid', 'fa-trash-can');
    btn.append(i);
    return btn;
  }

  orderCellRender(data: any) {
    const div = document.createElement('div');
    const i = document.createElement('i');

    let status = "";
    switch(data.orderStatus) {
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
    i.classList.add("fas", "fa-circle", status);
    div.innerHTML = '&nbsp;&nbsp;' + data.orderNo;
    div.prepend(i);
    return div;
  }

  progressCellRender(data: any): HTMLElement {
    let statusClass = "progress-bar-info";
    // switch(row.Status){
    //   case 'Created':
    //     statusClass = "progress-bar-init";
    //     break;

    //   case 'Processing':
    //     statusClass = "progress-bar-info";
    //     break;

    //   case 'Pass':
    //     statusClass = "progress-bar-success";
    //     break;

    //   case 'Fail':
    //     statusClass = "progress-bar-danger";
    //     break;
    // }
    const progress = document.createElement('div');
    progress.className = 'progress';
    const progressbar = document.createElement('div');
    progressbar.className = 'progress-bar progress-bar-striped '+ statusClass;
    progressbar.setAttribute('role', 'progressbar');
    progressbar.style.width = `${data.progress}%`;
    progressbar.setAttribute('aria-valuenow', `${data.progress}`);
    progressbar.setAttribute('aria-valuemin', '0');
    progressbar.setAttribute('aria-valuemax', '100');
    //progressbar.style.backgroundColor = backgroundColor;
    //progressbar.innerHTML = data + '%&nbsp;'
    const value = document.createElement('span');
    value.innerHTML = data.progress + '%&nbsp;'
    progressbar.appendChild(value);
    progress.appendChild(progressbar);
    return progress;
  }

  durationCellRender(data: any): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = data.duration;
    return div;
  }

  createTimeCellRender(data: any): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss');
    return div;
  }

  updateTimeCellRender(data: any): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss');
    return div;
  }
  //#endregion

  removeFilter(filterType: string, item?: string): void {
    switch(filterType) {
      case 'status':
        this.statusFilter = '';
        this.eventService.emit({id: 'overview', eventName: CardEvent.ChangeCardFilter});
        break;

      case 'edgeGateway':
        _.remove(this.edgeGatewayFilter, edgeGateway => { return edgeGateway === item; });
        this.eventService.emit({id: 'overview', eventName: CardEvent.ChangeCardFilter, data: item});
        break;

      case 'order':
        _.remove(this.orderFilter, order => { return order === item; });
        this.eventService.emit({id: 'overview', eventName: CardEvent.ChangeCardFilter, data: item});
        break;

      case 'createdDate':
        this.endDate = null;
        this.startDate = null;
        this.eventService.emit({id: 'overview', eventName: SearchBarEvent.RemoveDateRange});
        break;
    }

    this.updateListData();
  }

  updateListData() {
    this.listData = _.filter(this.listData, item => {
      let locationInclude = true,
          orderInclude = true,
          statusInclude = true,
          dateInclude = true;

      if(this.edgeGatewayFilter.length > 0) {
        locationInclude = _.includes(this.edgeGatewayFilter, item.edgeGateway);
      }
      if(this.orderFilter.length > 0) {
        orderInclude = _.includes(this.orderFilter, item.orderNo);
      }
      if(this.statusFilter) {
        statusInclude = item.orderStatus === this.statusFilter;
      }
      if(this.startDate && this.endDate) {
        dateInclude = dayjs(item.createdAt).isBetween(this.startDate, this.endDate, 'day', '[]');
      }
      return locationInclude && orderInclude && statusInclude && dateInclude;
    });
  }

  getSecond(duration: string): number {
    const strArr = duration.split(':');
    return  86400 * parseInt(strArr[0]) +
            3600 * parseInt(strArr[1]) +
            60 * parseInt(strArr[2]) +
            parseInt(strArr[3]);
  }

  openDeleteWorkOrderDialog(id: string, msg: string, button?: Array<IDialogButton>){
    const dialogInfo: any = {
      title: 'RolePrivConfig.Dialog.Confirm',
      matConfig: { id, autoFocus: false, disableClose: true, width: '350px' },
      buttons: button ? button
                      : [
                          { id: 'cancel', desc: 'i18n_Cancel', type: 'cancel' },
                          { id: 'ok', desc: 'i18n_OK', type: 'general' }
                        ],
      status: 'danger'
    }

    this.dialogService.open(msg, dialogInfo);
  }

  deleteOrderNoFun(orderNo:any){
    this.workorderAPI.deleteWorkOrder(orderNo).subscribe(()=>{
      window.location.reload();
    });
  }

  getDateString(d: any): string {
    return (d instanceof Date) ? dayjs(d).format('MM/DD') : '';
  }

  async exportFile(): Promise<void> {
    this.exportData.exportContent = new Array();
    this.exportData.exportContent.push({
      dataType: 'table',
      data: this.exportTableData,
      position: 1
    });

    const statusCard = document.getElementById('statusCard');
    const locationCard = document.getElementById('locationCard');
    const durationCard = document.getElementById('durationCard');

    const images = new Array<any>();

    if(this.filterData.length > 0) {
      await Promise.all([
        this.getHtmlCanvas(statusCard),
        this.getHtmlCanvas(locationCard),
        this.getHtmlCanvas(durationCard)
      ]).then(elements => {
        _.each(elements, element => {
          if(element) {
            images.push(element.toDataURL());
          }
        });
      });
    }
    this.exportData.exportContent.push({
      dataType: 'image',
      data: images,
      title: '',
      position: 0,
      imageFit: 260
    });

    this.exportData.screenName = 'Overview'
    this.exportData.pageOrientation = 'landscape';
    this.openTableExportDialog(this.exportData);
  }

  getHtmlCanvas(element: HTMLElement | null): Promise<HTMLCanvasElement|null>  {
    if(element) {
      return html2canvas(
        element,
        {
          scrollX: -window.scrollX,
          scrollY: -window.scrollY,
          windowWidth: document.documentElement.offsetWidth,
          windowHeight: document.documentElement.offsetHeight
        }
      );
    }
    else {
      return Promise.resolve(null);
    }
  }

  getStatusClass(): string {
    switch(this.statusFilter) {
      case 'Created':
        return 'status-bg-init';

      case 'Processing':
        return 'status-bg-default';

      case 'Pass':
        return 'status-bg-success';

      case 'Fail':
        return 'status-bg-danger';

      default:
        return '';
    };
  }
}
