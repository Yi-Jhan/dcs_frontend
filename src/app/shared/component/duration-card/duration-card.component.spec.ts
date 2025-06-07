import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import * as _ from 'lodash';
import { CardEvent, TableEvent } from 'src/app/enum';
import { SharedModule } from 'src/app/module/shared/shared.module';
import { CookieService, EventService } from 'src/app/service';

import { DurationCardComponent } from './duration-card.component';

const mockData = [
  {
    orderNo: "asus-321",
    description: "desc test1",
    status: "Created",
    progress: 0.0,
    address: "Beitou District, Taipei",
    location: "TPE",
    edgeGateway: "Taipei",
    duration: "0d:3h:30m",
    startTime: "2022-10-31T06:10:37.000+00:00",
    createdAt: "2022-10-18T09:22:35.183+00:00",
    updatedAt: "2022-11-17T01:08:33.485+00:00"
  },
  {
    orderNo: "asus-555",
    description: "test",
    status: "Created",
    progress: 0.0,
    address: "Beitou District, Taipei",
    location: "TPE",
    edgeGateway: "Taipei",
    duration: "0d:3h:30m",
    startTime: "2022-11-17T09:00:00.000+00:00",
    createdAt: "2022-11-17T08:03:27.511+00:00",
    updatedAt: "2022-11-17T08:03:27.511+00:00"
  }
];

describe('DurationCardComponent', () => {
  let component: DurationCardComponent;
  let fixture: ComponentFixture<DurationCardComponent>;
  let eventService: EventService;
  let cookieService: CookieService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        SharedModule,
      ],
      declarations: [ DurationCardComponent ]
    })
    .compileComponents();

    eventService = TestBed.inject(EventService);
    cookieService = TestBed.inject(CookieService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DurationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Function', () => {
    it('onChartEvent', () => {
      const spy = spyOn(eventService, 'handleEvent');
      component.onChartEvent({name: 'test'});

      expect(component.orderSelection.selected).toEqual(['test']);
      expect(spy).toHaveBeenCalledWith({
        id: 'durationCard',
        eventName: CardEvent.ChangeCardFilter,
        data: ['test']
      });
    });

    it('sort: sortDirection is desc', () => {
      const spy = spyOn(component, 'setChartData');
      component.sort();

      expect(spy).toHaveBeenCalled();
    });

    it('sort: sortDirection is asc', () => {
      const spy = spyOn(component, 'setChartData');
      component.sortDirection = 'asc';
      component.sort();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Event', () => {
    it('TableEvent.UpdateTableData', () => {
      const spy = spyOn(component, 'setChartData');
      eventService.handleEvent({id: 'durationCard', eventName: TableEvent.UpdateTableData, data: []});

      expect(spy).toHaveBeenCalled();
    });

    it('CardEvent.ChangeCardFilter', () => {
      const spy = spyOn(component.orderSelection, 'deselect');
      eventService.handleEvent({id: 'overview', eventName: CardEvent.ChangeCardFilter, data: 'test'});

      expect(spy).toHaveBeenCalledWith('test');
    });
  });
});
