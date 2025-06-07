import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CardEvent } from 'src/app/enum';
import { EventService } from 'src/app/service';
import { SharedModule } from '../../shared.module';

import { StatusCardComponent } from './status-card.component';

describe('StatusCardComponent', () => {
  let component: StatusCardComponent;
  let fixture: ComponentFixture<StatusCardComponent>;
  let eventService: EventService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslateModule.forRoot()
      ],
      providers: [
        EventService
      ],
      declarations: [ StatusCardComponent ]
    })
    .compileComponents();

    eventService = TestBed.inject(EventService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Function', () => {
    it('onClickStatusButton: should set "statusSelection" to "All"', () => {
      component.statusSelection = 'Created';
      component.onClickStatusButton({key:'Created', value: 5});
      expect(component.statusSelection).toEqual('All');
    });

    it('onClickStatusButton: should set "statusSelection" to key of button', () => {
      component.onClickStatusButton({key:'Created', value: 5});
      expect(component.statusSelection).toEqual('Created');
    });

    it('calPercent: should return percent string', () => {
      const result = component.calPercent(5, 10);
      expect(result).toEqual('50%');
    });
  });

  describe('Event', () => {
    it('CardEvent.ChangeCardFilter: should set "statusSelection"', () => {
      eventService.handleEvent({id: 'overview', eventName: CardEvent.ChangeCardFilter});
      expect(component.statusSelection).toEqual('All');
    });
  });
});
