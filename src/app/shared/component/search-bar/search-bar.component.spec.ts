import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { SearchBarEvent } from 'src/app/enum';
import { EventService } from 'src/app/service';
import { SharedModule } from '../../shared.module';

import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;
  let eventService: EventService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        TranslateModule.forRoot()
      ],
      providers: [ EventService ],
      declarations: [ SearchBarComponent ]
    })
    .compileComponents();

    eventService = TestBed.inject(EventService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Function', () => {
    it('formControls: should return controls of range', () => {
      const controls = component.formControls;
      expect(Object.keys(controls)).toContain('start');
      expect(Object.keys(controls)).toContain('end');
    });

    it('dateChange: should send event when type is "start"', () => {
      const spy = spyOn(eventService, 'handleEvent');
      const dateStr = '2022-02-02';
      component.dateChange('start', dateStr);

      expect(spy).toHaveBeenCalledWith({
        id: 'searchBar',
        eventName: SearchBarEvent.StartDateChange,
        data: new Date(dateStr)
      });
    });

    it('dateChange: should send event when type is "end"', () => {
      const spy = spyOn(eventService, 'handleEvent');
      const dateStr = '2022-02-02';
      component.dateChange('end', dateStr);

      expect(spy).toHaveBeenCalledWith({
        id: 'searchBar',
        eventName: SearchBarEvent.EndDateChange,
        data: new Date(dateStr)
      });
    });

    it('dateChange: should set false to "cancelDateChange" when "cancelDateChange" is true', () => {
      component.cancelDateChange = true;
      component.dateChange('end', '');

      expect(component.cancelDateChange).toBeFalsy();
    });

    it('closeDatePicker: should clear start value of range form', () => {
      const spy = spyOn(eventService, 'handleEvent');
      component.range.patchValue({
        start: '2022-02-02',
        end: null
      });
      fixture.detectChanges();
      component.closeDatePicker();

      expect(component.range.value.start).toBeNull();
    });

    it('clearSerchInput: should send event', () => {
      const spy = spyOn(eventService, 'handleEvent');
      component.clearSerchInput();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Event', () => {
    it('SearchBarEvent.RemoveDateRange: should clear controls value of range', () => {
      eventService.handleEvent({id: '', eventName: SearchBarEvent.RemoveDateRange});
      expect(component.range.value.start).toBeNull();
      expect(component.range.value.end).toBeNull();
    });
  });
});
