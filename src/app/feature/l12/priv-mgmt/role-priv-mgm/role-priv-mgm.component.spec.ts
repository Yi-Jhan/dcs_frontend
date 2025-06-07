import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ChipsInputEvent, DialogEvent, TableEvent } from 'src/app/enum';
import { SharedModule } from 'src/app/module/shared/shared.module';
import { DialogService, EventService } from 'src/app/service';
import { ApiRoleService } from 'src/app/service/restful-api';

import { RolePrivMgmComponent } from './role-priv-mgm.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
const roleApiSpy = jasmine.createSpyObj('ApiRoleService', ['getRoleList', 'deleteRole']);
const mockRoleList = [
  {
    id: "27",
    name: "Manager1",
    description: "Test Manager update test1",
    appliedCount: 0
  },
  {
    id: "40",
    name: "Manager2",
    description: "Test Manager update test2",
    appliedCount: 0
  }
];

describe('RolePrivMgmComponent', () => {
  let component: RolePrivMgmComponent;
  let fixture: ComponentFixture<RolePrivMgmComponent>;
  let eventService: EventService;
  let dialogService: DialogService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [RolePrivMgmComponent],
    imports: [RouterTestingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        SharedModule],
    providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ApiRoleService, useValue: roleApiSpy },
        DialogService,
        EventService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    eventService = TestBed.inject(EventService);
    dialogService = TestBed.inject(DialogService);
    roleApiSpy.getRoleList.and.returnValue(of(mockRoleList));
    roleApiSpy.deleteRole.and.returnValue(of(null));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RolePrivMgmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Function', () => {
    it('openConfirmDialog: should open dialog', () => {
      const eventData = {id: '40', name: 'Manager2', appliedCount: 0};
      const spy = spyOn(dialogService, 'open');
      component.openConfirmDialog(eventData);

      expect(spy).toHaveBeenCalled();
    });

    it('deleteCellRender: should return a button HTMLElement', () => {
      const result = component.deleteCellRender({}, []);

      const btn = document.createElement('button');
      btn.classList.add('cellBtn', 'warn');
      const i = document.createElement('i');
      i.classList.add('fa-solid', 'fa-trash-can');
      btn.append(i);

      expect(result).toEqual(btn);
    });

    it('createNewRole: should nav to "RolePrivConfig" page', () => {
      component.createNewRole();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['RolePrivConfig']);
    });

    it('deleteRole: should call "getRoleList"', () => {
      const spy = spyOn(component, 'getRoleList');
      component.deleteRole();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Event', () => {
    it('ChipsInputEvent.InputChange: should set "filters" to data of event', () => {
      eventService.handleEvent({id: '', eventName: ChipsInputEvent.InputChange, data: ['test']});
      expect(component.filters).toEqual(['test']);
    });

    it('TableEvent.RowClicked: should nav to "RolePrivConfig" page', () => {
      const eventData = { appliedCount: 1, description: 'Brook test', id: "64" };
      eventService.handleEvent({
        id: 'privilegeMgmTable',
        eventName: TableEvent.RowClicked,
        data: eventData
      });

      expect(routerSpy.navigate).toHaveBeenCalledWith(['RolePrivConfig', eventData.id]);
    });

    it('TableEvent.RowClicked: should open dialog if no id', () => {
      const spy = spyOn(dialogService, 'open');
      eventService.handleEvent({
        id: 'privilegeMgmTable',
        eventName: TableEvent.RowClicked,
        data: null
      });

      expect(spy).toHaveBeenCalled();
    });

    it('TableEvent.CellEvent: should call openConfirmDialog', () => {
      const spy = spyOn(component, 'openConfirmDialog');
      const eventData = {id: '40', name: 'Manager2', appliedCount: 0};
      eventService.handleEvent({id: '', eventName: TableEvent.CellEvent, data: eventData});
      expect(spy).toHaveBeenCalledOnceWith(eventData);
    });

    it('DialogEvent.ButtonClicked: should call deleteRole', () => {
      const spy = spyOn(component, 'deleteRole');
      eventService.handleEvent({
        id: 'confirmDeleteDialog',
        eventName: DialogEvent.ButtonClicked,
        data: { id: 'delete', desc: 'Common.Button.Delete', type: 'general' }
      });

      expect(spy).toHaveBeenCalled();
    });
  });
});
