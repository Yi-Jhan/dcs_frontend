import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CardEvent, TableEvent } from 'src/app/enum';
import { SharedModule } from 'src/app/module/shared/shared.module';
import { CookieService, EventService } from 'src/app/service';

import { LocationCardComponent } from './location-card.component';

describe('LocationCardComponent', () => {
  let component: LocationCardComponent;
  let fixture: ComponentFixture<LocationCardComponent>;
  let eventService: EventService;
  let cookieService: CookieService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslateModule.forRoot()
      ],
      providers: [
        EventService,
        CookieService
      ],
      declarations: [ LocationCardComponent ]
    })
    .compileComponents();

    eventService = TestBed.inject(EventService);
    cookieService = TestBed.inject(CookieService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Function', () => {
    it('onChartEvent', () => {
      const spy = spyOn(eventService, 'handleEvent');
      component.onChartEvent({name: 'TPE'});

      expect(component.locationSelection.selected).toEqual(['TPE']);
      expect(spy).toHaveBeenCalledWith({
        id: 'locationCard',
        eventName: CardEvent.ChangeCardFilter,
        data: ['TPE']
      });
    });
  });

  describe('Event', () => {
    it('TableEvent.UpdateTableData', () => {
      const spy = spyOn(component, 'setChartOptions');
      eventService.handleEvent({id: 'orderlistTable', eventName: TableEvent.UpdateTableData, data: []});

      expect(spy).toHaveBeenCalled();
    });

    it('CardEvent.ChangeCardFilter', () => {
      const spy = spyOn(component.locationSelection, 'deselect');
      eventService.handleEvent({id: 'overview', eventName: CardEvent.ChangeCardFilter, data: 'TPE'});

      expect(spy).toHaveBeenCalledWith('TPE');
    });
  });
});
