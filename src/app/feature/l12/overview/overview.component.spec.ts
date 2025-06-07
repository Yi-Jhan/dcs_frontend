import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { OverviewComponent } from './overview.component';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SharedModule } from 'src/app/module/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonLibService, DialogService, EventService } from 'src/app/service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiOverviewService } from 'src/app/service/restful-api';
import { CardEvent, ChipsInputEvent, ExportEvent, SearchBarEvent, TableEvent } from 'src/app/enum';
import { of } from 'rxjs';
import * as dayjs from 'dayjs';
import { By } from '@angular/platform-browser';
import { LocationCardComponent } from '../location-card/location-card.component';
import { DurationCardComponent } from '../duration-card/duration-card.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
const apiOverviewSpy = jasmine.createSpyObj('ApiOverviewService', ['getOverviewList']);
const overviewList = [
  {
    orderNo: 'asus-111',
    description: 'desc test',
    orderStatus: 'Created',
    progress: 0,
    address: 'Beitou District, Taipei',
    location: 'TPE',
    edgeGateway: 'Taipei',
    duration: '0d:3h:30m',
    durationMinute: 210,
    startTime: '2022-10-31T11:14:10.389+00:00',
    createdAt: '2022-10-17T02:42:49.164+00:00',
    updatedAt: '2022-10-17T02:42:49.164+00:00'
  },
  {
    orderNo: 'asus-112',
    description: 'desc test',
    orderStatus: 'Processing',
    progress: 10,
    address: 'Beitou District, Taipei',
    location: 'TPE',
    edgeGateway: 'Taipei',
    duration: '0d:3h:30m',
    durationMinute: 210,
    startTime: '2022-10-31T11:14:10.389+00:00',
    createdAt: '2022-10-17T02:42:49.164+00:00',
    updatedAt: '2022-10-17T02:42:49.164+00:00'
  },
  {
    orderNo: 'asus-113',
    description: 'desc test',
    orderStatus: 'Pass',
    progress: 30,
    address: 'Beitou District, Taipei',
    location: 'TPE',
    edgeGateway: 'Taipei',
    duration: '0d:3h:30m',
    durationMinute: 210,
    startTime: '2022-10-31T11:14:10.389+00:00',
    createdAt: '2022-10-17T02:42:49.164+00:00',
    updatedAt: '2022-10-17T02:42:49.164+00:00'
  },
  {
    orderNo: 'asus-114',
    description: 'desc test',
    orderStatus: 'Fail',
    progress: 50,
    address: 'Beitou District, Taipei',
    location: 'TPE',
    edgeGateway: 'Taipei',
    duration: '0d:3h:30m',
    durationMinute: 210,
    startTime: '2022-10-31T11:14:10.389+00:00',
    createdAt: '2022-10-17T02:42:49.164+00:00',
    updatedAt: '2022-10-17T02:42:49.164+00:00'
  }
]

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let eventService: EventService;
  let commonLib: CommonLibService;
  let dialogService: DialogService

  function getOrderNoCellRender(statClass: string, orderNo: string): HTMLDivElement {
    const div = document.createElement('div');
    const i = document.createElement('i');
    i.classList.add('fas', 'fa-circle', statClass);
    div.innerHTML = '&nbsp;&nbsp;' + orderNo;
    div.prepend(i);

    return div;
  }

  function getProgressCellRender(data: number): HTMLDivElement {
    const progress = document.createElement('div');
    progress.className = 'progress';
    const progressbar = document.createElement('div');
    progressbar.className = 'progress-bar progress-bar-striped progress-bar-info';
    progressbar.setAttribute('role', 'progressbar');
    progressbar.style.width = `${data}%`;
    progressbar.setAttribute('aria-valuenow', `${data}`);
    progressbar.setAttribute('aria-valuemin', '0');
    progressbar.setAttribute('aria-valuemax', '100');

    const value = document.createElement('span');
    value.innerHTML = data + '%&nbsp;'

    progressbar.appendChild(value);
    progress.appendChild(progressbar);
    return progress;
  }

  const fakeActivatedRoute = {
    snapshot: { data: {}  }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        OverviewComponent,
        LocationCardComponent,
        DurationCardComponent
    ],
    imports: [RouterTestingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        SharedModule],
    providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ApiOverviewService, useValue: apiOverviewSpy },
        EventService,
        CommonLibService,
        DialogService,
        { provide: ActivatedRoute, useValue: fakeActivatedRoute },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    eventService = TestBed.inject(EventService);
    commonLib = TestBed.inject(CommonLibService);
    dialogService = TestBed.inject(DialogService);
    apiOverviewSpy.getOverviewList.and.returnValue(of(overviewList));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Event', () => {
    it('ChipsInputEvent.InputChange', () => {
      eventService.handleEvent({id: '', eventName: ChipsInputEvent.InputChange, data: ['test']});

      expect(component.filters.length).toEqual(1);
      expect(component.filters[0]).toEqual('test');
    });

    // it('TableEvent.RowClicked: no OrderNo', () => {
    //   const spy = spyOn(dialogService, 'open');
    //   eventService.handleEvent({id: '', eventName: TableEvent.RowClicked});

    //   expect(spy).toHaveBeenCalled();
    // });

    // it('TableEvent.RowClicked', () => {
    //   eventService.handleEvent({id: '', eventName: TableEvent.RowClicked, data: {orderNo: '123'}});

    //   expect(routerSpy.navigate).toHaveBeenCalledWith(['OrderView', '123']);
    // });

    it('TableEvent.UpdateTableData', () => {
      eventService.handleEvent({id: '', eventName: TableEvent.UpdateTableData, data: overviewList});

      expect(component.filterData).toEqual(overviewList);
    });

    it('CardEvent.ChangeCardFilter: Status', () => {
      eventService.handleEvent({id: 'statusCard', eventName: CardEvent.ChangeCardFilter, data: 'Created'});

      expect(component.statusFilter).toEqual('Created');
    });

    it('CardEvent.ChangeCardFilter: Location', () => {
      eventService.handleEvent({id: 'locationCard', eventName: CardEvent.ChangeCardFilter, data: ['TPE']});

      expect(component.edgeGatewayFilter).toEqual(['TPE']);
    });

    it('CardEvent.ChangeCardFilter: Duration', () => {
      eventService.handleEvent({id: 'durationCard', eventName: CardEvent.ChangeCardFilter, data: ['123']});

      expect(component.orderFilter).toEqual(['123']);
    });

    it('SearchBarEvent.StartDateChange', () => {
      const date = new Date();
      eventService.handleEvent({id: '', eventName: SearchBarEvent.StartDateChange, data: date});

      expect(component.startDate).toEqual(date);
      expect(component.endDate).toEqual(null);
    });

    it('SearchBarEvent.EndDateChange', () => {
      const date = new Date();
      eventService.handleEvent({id: '', eventName: SearchBarEvent.EndDateChange, data: date});

      expect(component.endDate).toEqual(date);
    });

    it('SearchBarEvent.StartDateChange & EndDateChange', () => {
      const date = new Date();
      eventService.handleEvent({id: '', eventName: SearchBarEvent.StartDateChange, data: date});
      eventService.handleEvent({id: '', eventName: SearchBarEvent.EndDateChange, data: date});

      expect(component.startDate).toEqual(date);
      expect(component.endDate).toEqual(date);
    });

    it('SearchBarEvent.CancelDateChange', () => {
      eventService.handleEvent({id: '', eventName: SearchBarEvent.CancelDateChange});

      expect(component.startDate).toEqual(null);
      expect(component.endDate).toEqual(null);
    });

    it('ExportEvent.Export', () => {
      const spy = spyOn(component, 'exportFile');
      component.filterData = overviewList;
      eventService.handleEvent({id: '', eventName: ExportEvent.Export});

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Function', () => {
    //#region removeFilter
    it('removeFilter: should clear statusFilter', () => {
      const spy = spyOn(eventService, 'handleEvent');
      component.removeFilter('status');
      fixture.detectChanges();

      expect(component.statusFilter).toEqual('');
      expect(spy).toHaveBeenCalled();
    });

    it('removeFilter: should remove the specified edgeGateway', () => {
      const spy = spyOn(eventService, 'handleEvent');
      component.edgeGatewayFilter = ['TPE'];
      component.removeFilter('edgeGateway', 'TPE');

      fixture.detectChanges();
      expect(component.edgeGatewayFilter).toEqual([]);
      expect(spy).toHaveBeenCalled();
    });

    it('removeFilter: should remove the specified order', () => {
      const spy = spyOn(eventService, 'handleEvent');
      component.orderFilter = ['asus-114'];
      component.removeFilter('order', 'asus-114');
      fixture.detectChanges();

      expect(component.orderFilter).toEqual([]);;
      expect(spy).toHaveBeenCalled();
    });

    it('removeFilter: should clear "startDate" and "endDate"', () => {
      const spy = spyOn(eventService, 'handleEvent');
      component.removeFilter('createdDate');
      fixture.detectChanges();

      expect(component.startDate).toEqual(null);
      expect(component.endDate).toEqual(null);
      expect(spy).toHaveBeenCalled();
    });
    //#endregion

    //#region getDateString
    it('getDateString: should return a date when param is Date type', () => {
      const date = new Date();
      const result = component.getDateString(date);

      expect(result).toEqual(dayjs(date).format('MM/DD'));
    });

    it('getDateString: should return empty string when param is not Date type', () => {
      const result = component.getDateString('');
      expect(result).toEqual('');
    });
    //#endregion

    //#region getStatusClass
    it('getStatusClass: should return empty string', () => {
      component.statusFilter = '';
      const result = component.getStatusClass();
      fixture.detectChanges();

      expect(result).toEqual('');
    });

    it('getStatusClass: should return "status-bg-init" when statusFilter is "Created"', () => {
      component.statusFilter = 'Created';
      const result = component.getStatusClass();
      fixture.detectChanges();

      expect(result).toEqual('status-bg-init');
    });

    it('getStatusClass: should return "status-bg-default" when statusFilter is "Processing"', () => {
      component.statusFilter = 'Processing';
      const result = component.getStatusClass();
      fixture.detectChanges();

      expect(result).toEqual('status-bg-default');
    });

    it('getStatusClass: should return "status-bg-success" when statusFilter is "Pass"', () => {
      component.statusFilter = 'Pass';
      const result = component.getStatusClass();
      fixture.detectChanges();

      expect(result).toEqual('status-bg-success');
    });

    it('getStatusClass: should return "status-bg-danger" when statusFilter is "Fail"', () => {
      component.statusFilter = 'Fail';
      const result = component.getStatusClass();
      fixture.detectChanges();

      expect(result).toEqual('status-bg-danger');
    });
    //#endregion

    it('exportFile', fakeAsync(() => {
      component.filterData = [''];
      const canvas = document.createElement('canvas');
      const spy = spyOn(commonLib, 'openTableExportDialog');
      const spy2 = spyOn(component, 'getHtmlCanvas').and.returnValue(Promise.resolve(canvas));
      component.exportFile();
      fixture.detectChanges();
      tick();

      expect(component.exportData.screenName).toEqual('Overview');
      expect(component.exportData.pageOrientation).toEqual('landscape');
      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    }));

    //#region getHtmlCanvas
    it('getHtmlCanvas: should return a CANVAS element', (done) => {
      const html = fixture.nativeElement.querySelector('#statusCard');
      const result = component.getHtmlCanvas(html);
      fixture.detectChanges();

      result.then(item => {
        expect(item!.tagName).toEqual('CANVAS');
        done();
      });
    });

    it('getHtmlCanvas: should return null', fakeAsync(() => {
      let result: any;

      component.getHtmlCanvas(null).then(res => result = res);
      fixture.detectChanges();
      tick();

      expect(result).toEqual(null);
    }));
    //#endregion

    it('orderCellRender: should return a HTML element with "Created" style', () => {
      const result = component.orderCellRender(overviewList[0].orderNo, overviewList[0]);
      fixture.detectChanges();

      const render = getOrderNoCellRender('status-font-init', overviewList[0].orderNo);
      expect(result).toEqual(render);
    });

    it('orderCellRender: should return a HTML element with "Processing" style', () => {
      const result = component.orderCellRender(overviewList[1].orderNo, overviewList[1]);
      fixture.detectChanges();

      const render = getOrderNoCellRender('status-font-default', overviewList[1].orderNo);
      expect(result).toEqual(render);
    });

    it('orderCellRender: should return a HTML element with "Pass" style', () => {
      const result = component.orderCellRender(overviewList[2].orderNo, overviewList[2]);
      fixture.detectChanges();

      const render = getOrderNoCellRender('status-font-success', overviewList[2].orderNo);
      expect(result).toEqual(render);
    });

    it('orderCellRender: should return a HTML element with "Fail" style', () => {
      const result = component.orderCellRender(overviewList[3].orderNo, overviewList[3]);
      fixture.detectChanges();

      const render = getOrderNoCellRender('status-font-danger', overviewList[3].orderNo);
      expect(result).toEqual(render);
    });

    it('progressCellRender: should return a HTML element', () => {
      const result = component.progressCellRender(overviewList[0].progress, overviewList[0]);
      fixture.detectChanges();

      const render = getProgressCellRender(overviewList[0].progress);
      expect(result).toEqual(render);
    });

    it('durationCellRender: should return a HTML element', () => {
      const result = component.durationCellRender(overviewList[0].durationMinute, overviewList[0]);
      fixture.detectChanges();

      const div = document.createElement('div');
      div.innerHTML = overviewList[0].duration;

      expect(result).toEqual(div);
    });

    it('dateTimeCellRender: should return a HTML element', () => {
      const result = component.dateTimeCellRender(overviewList[0].createdAt, overviewList[0]);
      fixture.detectChanges();

      const div = document.createElement('div');
      div.innerHTML = dayjs(overviewList[0].createdAt).format('YYYY-MM-DD HH:mm:ss');

      expect(result).toEqual(div);
    });
  });
});
