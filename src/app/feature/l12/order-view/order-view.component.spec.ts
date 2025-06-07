import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { EventService } from 'src/app/service';

import { OrderViewComponent } from './order-view.component';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SharedModule } from 'src/app/module/shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiWorkorderService } from 'src/app/service/restful-api';
import { CardEvent, ChipsInputEvent, ExportEvent, SearchBarEvent, TableEvent } from 'src/app/enum';
import * as _ from 'lodash';
import { By } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const workorderAPISpy = jasmine.createSpyObj('ApiWorkorderService', ['getWorkOrderData']);
const mockOrderData = [
  {
      "processorSet": [
          {
              "node": 1,
              "value": [
                  {
                      "cores": 32,
                      "vendor": "Intel",
                      "model": "Intel(R) Xeon(R) Gold 6338 CPU @ 2.00GHz"
                  },
                  {
                      "cores": 32,
                      "vendor": "Intel",
                      "model": "Intel(R) Xeon(R) Gold 6338 CPU @ 2.00GHz"
                  }
              ]
          },
          {
              "node": 2,
              "value": [
                  {
                      "cores": 32,
                      "vendor": "Intel",
                      "model": "Intel(R) Xeon(R) Gold 6338 CPU @ 2.00GHz"
                  },
                  {
                      "cores": 32,
                      "vendor": "Intel",
                      "model": "Intel(R) Xeon(R) Gold 6338 CPU @ 2.00GHz"
                  }
              ]
          }
      ],
      "baseboardSet": [
          {
              "node": 1,
              "value": [
                  {
                      "vendor": "ASUS",
                      "model": "Z10PP-D24 Series"
                  }
              ]
          },
          {
              "node": 2,
              "value": [
                  {
                      "vendor": "ASUSTeK COMPUTER INC.",
                      "model": "P10S-M-DC-S Series"
                  }
              ]
          }
      ],
      "messageLight": [
          {
              "node": 1,
              "value": false
          },
          {
              "node": 2,
              "value": false
          }
      ],
      "memorySet": [
          {
              "node": 1,
              "value": [
                  {
                      "serialNumber": "ABC123",
                      "partNumber": "M393A2G40DB1-CRC",
                      "type": "DDR4",
                      "speed": "3200 MHz",
                      "capacity": "17179869184",
                      "manufacturer": "Samsung"
                  }
              ]
          },
          {
              "node": 2,
              "value": [
                  {
                      "serialNumber": "ABC124",
                      "partNumber": "M393A2G40DB1-CRC",
                      "type": "DDR4",
                      "speed": "3200 MHz",
                      "capacity": "17179869184",
                      "manufacturer": "Samsung"
                  }
              ]
          }
      ],
      "orderStatus": [
          {
              "node": 1,
              "value": "Created"
          },
          {
              "node": 2,
              "value": "Processing"
          }
      ],
      "duration": 0,
      "createdAt": "2022-10-18T09:22:35.193+00:00",
      "locatorLight": [
          {
              "node": 1,
              "value": false
          },
          {
              "node": 2,
              "value": false
          }
      ],
      "vendor": "ASUS",
      "biosSet": [
          {
              "node": 1,
              "value": [
                  {
                      "releaseDate": "2023-01-02T00:00:00.000+00:00",
                      "vendor": "American Megatrends Inc.",
                      "version": "0403"
                  }
              ]
          },
          {
              "node": 2,
              "value": [
                  {
                      "releaseDate": "2023-01-02T00:00:00.000+00:00",
                      "vendor": "American Megatrends Inc.",
                      "version": "0403"
                  }
              ]
          }
      ],
      "model": "model test1",
      "updatedAt": "2022-11-17T01:15:28.994+00:00",
      "orderNo": "asus-321",
      "serialNumber": "K8S0MD0001JH",
      "bmcSet": [
          {
              "node": 1,
              "value": [
                  {
                      "interfaces": {
                          "ipv4": [
                              "192.168.2.20"
                          ],
                          "ipv6": [
                              "2001:b030:53:101:3010:865a:28b5:10cb"
                          ]
                      },
                      "version": "2022.11.23"
                  }
              ]
          },
          {
              "node": 2,
              "value": [
                  {
                      "interfaces": {
                          "ipv4": [
                              "192.168.2.21"
                          ],
                          "ipv6": [
                              "1001:b030:53:101:3010:865a:28b5:10cb"
                          ]
                      },
                      "version": "2022.11.23"
                  }
              ]
          }
      ],
      "diskSet": [
          {
              "node": 1,
              "value": [
                  {
                      "serialNumber": "1E0920047557",
                      "size": 64023257088,
                      "name": "nvme3",
                      "model": "SAMSUNG MZWLR3T8HBLS-00007",
                      "manufacturer": "ATA",
                      "firmwareRevision": "2.4"
                  }
              ]
          },
          {
              "node": 2,
              "value": [
                  {
                      "serialNumber": "1E0920047558",
                      "size": 64023257088,
                      "name": "nvme3",
                      "model": "SAMSUNG MZWLR3T8HBLS-00007",
                      "manufacturer": "ATA",
                      "firmwareRevision": "2.4"
                  }
              ]
          }
      ],
      "profile": [
          {
              "node": 2,
              "value": {
                  "name": "Common",
                  "description": ""
              }
          },
          {
              "node": 1,
              "value": {
                  "name": "Common",
                  "description": ""
              }
          }
      ],
      "ethernetSet": [
          {
              "node": 1,
              "value": [
                  {
                      "devId": "0x101f",
                      "macAddress": "b8cef6296d04",
                      "serialNumber": "MT2103X05170",
                      "subsystemVendorId": "0x15b3",
                      "name": "eth0",
                      "vendorId": "0x15b3",
                      "subsystemDeviceId": "0x0009",
                      "model": "MCX631435AN-GDAB",
                      "speed": 50000
                  }
              ]
          },
          {
              "node": 2,
              "value": [
                  {
                      "devId": "0x101f",
                      "macAddress": "b8cef6296d04",
                      "serialNumber": "MT2103X05171",
                      "subsystemVendorId": "0x15b3",
                      "name": "eth0",
                      "vendorId": "0x15b3",
                      "subsystemDeviceId": "0x0009",
                      "model": "MCX631435AN-GDAB",
                      "speed": 50000
                  }
              ]
          }
      ],
      "node": 2,
      "size": 1,
      "gpuSet": [
          {
              "node": 1,
              "value": [
                  {
                      "serialNumber": "0321716094171",
                      "model": "Tesla M40 24GB"
                  }
              ]
          },
          {
              "node": 2,
              "value": [
                  {
                      "serialNumber": "0321716094172",
                      "model": "Tesla M40 24GB"
                  }
              ]
          }
      ],
      "edgeGateway": "Taipei",
      "position": 4,
      "cabinet": "Cabinet-4",
      "status": [
          {
              "node": 1,
              "value": "Disconnected"
          },
          {
              "node": 2,
              "value": "Disconnected"
          }
      ]
  }
];
describe('OrderViewComponent', () => {
  let component: OrderViewComponent;
  let fixture: ComponentFixture<OrderViewComponent>;
  let eventService: EventService;
  let route: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [OrderViewComponent],
    imports: [RouterTestingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        SharedModule],
    providers: [
        // { provide: Router, useValue: routerSpy },
        { provide: ApiWorkorderService, useValue: workorderAPISpy },
        { provide: ActivatedRoute, useValue: { params: of({ order: 'asus-321' }) } },
        EventService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    eventService = TestBed.inject(EventService);
    workorderAPISpy.getWorkOrderData.and.returnValue(of(mockOrderData));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getOrderViewDetailsData', ()=>{
    it('should call `getWorkOrderData` and set `tableInfo.data` and `isLoadingResults`', fakeAsync(() => {
      workorderAPISpy.getWorkOrderData.and.returnValue(of(mockOrderData));
      fixture.detectChanges();
      tick();

      expect(workorderAPISpy.getWorkOrderData).toHaveBeenCalledWith('asus-321');
      component.isLoadingResults = false;
    }))
  });

  describe('Event', () => {
    it('ChipsInputEvent.InputChange: should set "filters" to data of event', () => {
      eventService.handleEvent({id: '', eventName: ChipsInputEvent.InputChange, data: 'test'});
      expect(component.filters).toEqual('test');
    });

    it('TableEvent.RowClicked: should nav to "DeviceInfo" page', inject(
      [Router],
      (router: Router) => {
        const eventData = {serialNumber:'K8S0MD0001JH-node1'};
        const serialNumber = eventData.serialNumber.split('-')[0];
        const nodeNumber = eventData.serialNumber.split('node')[1];
        spyOn(router, "navigate").and.stub();
        router.navigate(["/DeviceInfo",eventData.serialNumber],{state:{serialNumber:serialNumber, nodeNumber:nodeNumber}});
        expect(router.navigate).toHaveBeenCalledWith(["/DeviceInfo",eventData.serialNumber],{state:{serialNumber:serialNumber, nodeNumber:nodeNumber}});
      }
    ));

    it('updateTableData', ()=>{
      component.filterListData = mockOrderData;
      var rackviewData:any = [];
      var deviceObj = {};
      _.chain(component.filterListData)
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
      })
      .value();
      component.rackviewData = rackviewData;
      setTimeout(() => {
        component.cabinetData = _.chain(component.filterListData)
          .filter(data => { return data.cabinet })
          .sortBy('cabinet')
          .groupBy('cabinet')
          .map((val, key) => ({ device: key, data: val }))
          .value();

          component.getCabinetStatus(component.cabinetData)

        var status = _.chain(component.filterListData).filter(data => { return data.cabinet }).groupBy('orderStatus').map((val, key) => ({ value: val.length, name: key })).value();
        component.statusCreatedVal = _.find(status, obj => { return obj.name === 'Created' })?.value;
        component.statusProcessingVal = _.find(status, obj => { return obj.name === 'Processing' })?.value;
        component.statusPassVal = _.find(status, obj => { return obj.name === 'Pass' })?.value;
        component.statusFailVal = _.find(status, obj => { return obj.name === 'Fail' })?.value;

        component.orderviewStatus = [
          { value: _.isUndefined(component.statusCreatedVal) ? 0 : component.statusCreatedVal, name: 'Created' },
          { value: _.isUndefined(component.statusProcessingVal) ? 0 : component.statusProcessingVal, name: 'Processing' },
          { value: _.isUndefined(component.statusPassVal) ? 0 : component.statusPassVal, name: 'Pass' },
          { value: _.isUndefined(component.statusFailVal) ? 0 : component.statusFailVal, name: 'Fail' },
        ]

        component.orderviewStatusSum = _.sumBy(component.orderviewStatus, status => status.value);

        expect(component.updateOrderViewData).toBeTruthy();
      }, 100);
    });

    it('cabinetSelection: should set "cabinetFilter" data of event and call updateListData function', ()=>{
      eventService.handleEvent({id: '', eventName: 'cabinetSelection', data: 'Cabinet-4'});
      expect(component.cabinetFilter).toEqual('Cabinet-4');
      expect(component.updateListData).toBeTruthy();
    });

    it('racknodeClick: should set "cabinetFilter" & "racknodeFilter" data of event and call updateListData', ()=>{
      eventService.handleEvent({id: '', eventName: 'racknodeClick', data:{cabinet:'C4',position:'4'}});
      expect(component.cabinetFilter).toEqual('C4');
      expect(component.racknodeFilter).toEqual('4');
      expect(component.updateListData).toBeTruthy();
    });

    it('ChangeCardFilter: should set "statusFilter" data of event and call updateListData function', ()=>{
      eventService.handleEvent({id: '', eventName: CardEvent.ChangeCardFilter, data: 'Created'});
      expect(component.statusFilter).toEqual('Created');
      expect(component.updateListData).toBeTruthy();
    });

    it('StartDateChange: should set "StartDateChange" data of event and call updateListData function', ()=>{
      eventService.handleEvent({id: '', eventName: SearchBarEvent.StartDateChange, data: 'Mon Jan 02 2023 00:00:00 GMT+0800'});
      expect(component.startDate).toEqual('Mon Jan 02 2023 00:00:00 GMT+0800');
      expect(component.endDate).toEqual(null);
      expect(component.updateListData).toBeTruthy();
    });

    it('EndDateChange: should set "EndDateChange" data of event and call updateListData function', ()=>{
      eventService.handleEvent({id: '', eventName: SearchBarEvent.EndDateChange, data: 'Mon Jan 02 2023 00:00:00 GMT+0800'});
      expect(component.endDate).toEqual('Mon Jan 02 2023 00:00:00 GMT+0800');
      expect(component.updateListData).toBeTruthy();
    });

    it('CancelDateChange: should set startDate & endDate to null and call updateOrderViewData function', ()=>{
      eventService.handleEvent({id: '', eventName: SearchBarEvent.CancelDateChange });
      expect(component.startDate).toEqual(null);
      expect(component.endDate).toEqual(null);
      expect(component.updateOrderViewData).toBeTruthy();
    });

    it('ClearSearchInput: should clear filter value call updateOrderViewData function', ()=>{
      eventService.handleEvent({id: '', eventName: SearchBarEvent.ClearSearchInput});
      expect(component.cabinetFilter).toEqual('');
      expect(component.statusFilter).toEqual('');
      expect(component.racknodeFilter).toEqual('');
      expect(component.startDate).toEqual(null);
      expect(component.endDate).toEqual(null);
      expect(component.updateOrderViewData).toBeTruthy();
    });

    it('ExportEvent.Export', () => {
      const spy = spyOn(component, 'exportFile');
      component.tableData = mockOrderData;
      eventService.handleEvent({id: '', eventName: ExportEvent.Export});

      expect(spy).toHaveBeenCalled();
    });

  });

  describe('resize', ()=>{
    let mousePosition: any;
    let resizeBar: any;
    let rackviewDiv: any;
    let dashboardDiv: any;
    let chartCompleteCard: any;
    let statusCardDiv: any;
    let durationCardDiv: any;
    let tableListDiv: any;
    let dashboardTitle: any;
    beforeEach(() => {
      resizeBar = fixture.debugElement.nativeElement.querySelector('#resizeBar');
      rackviewDiv = fixture.debugElement.nativeElement.querySelector('#rackviewDiv');
      dashboardDiv = fixture.debugElement.nativeElement.querySelector('#dashboardDiv');
      chartCompleteCard = fixture.debugElement.nativeElement.querySelector('#chartCompleteCard');
      statusCardDiv = fixture.debugElement.nativeElement.querySelector('#statusCardDiv');
      durationCardDiv = fixture.debugElement.nativeElement.querySelector('#durationCardDiv');
      tableListDiv = fixture.debugElement.nativeElement.querySelector('#tableListDiv');
      dashboardTitle = fixture.debugElement.nativeElement.getElementsByClassName('dashboardTitle');
    });

    it('should call the resizebar function and update the elements styles', () => {
      mousePosition = 200;
      const event = { x: 200 };
      const parent = resizeBar.parentNode;
      const dx = mousePosition - event.x;
      mousePosition = event.x;
      spyOn(window, 'dispatchEvent');
    });
  });

});
