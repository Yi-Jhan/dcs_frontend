import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import * as _ from 'lodash';
import { DialogEvent } from 'src/app/enum';
import { IExportConfig } from 'src/app/interface';
import { CommonLibService, EventService } from 'src/app/service';
import { SharedModule } from '../../../SharedModule';

import { TableExportComponent } from './table-export.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
const dialogData = {
  screenName: 'Overview',
  pageOrientation: 'landscape',
  exportContent: [{
    dataType: 'table',
    data: {
      columns: [
        {field:'name', headerName: 'name', visible: true},
        {field:'skill', headerName: 'skill', visible: false},
      ],
      data: [
        {id: 0, name: 'Naruto', skill: 'Rasengan'},
        {id: 1, name: 'Sasuke', skill: 'Chidori'},
        {id: 2, name: 'Minato', skill: 'Rasengan,Chidori'}
      ]
    },
    position: 0
  }]
} as IExportConfig;

describe('TableExportComponent', () => {
  let component: TableExportComponent;
  let fixture: ComponentFixture<TableExportComponent>;
  let eventService: EventService;
  let commonLib: CommonLibService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [TableExportComponent],
    imports: [RouterTestingModule,
        BrowserAnimationsModule,
        SharedModule,
        TranslateModule.forRoot()],
    providers: [
        { provide: Router, useValue: routerSpy },
        EventService,
        CommonLibService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    eventService = TestBed.inject(EventService);
    commonLib = TestBed.inject(CommonLibService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableExportComponent);
    component = fixture.componentInstance;
    component.dataFromMatDialog = _.cloneDeep(dialogData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Function', () => {
    it('exportCSV: has not file name', () => {
      const spy = spyOn(commonLib, 'exportCSV');
      component.exportCSV();
      expect(spy).toHaveBeenCalled();
    });

    it('exportCSV: has file name', () => {
      const spy = spyOn(commonLib, 'exportCSV');
      component.exportForm.patchValue({fileName: 'Naruto'});
      component.exportCSV();
      expect(spy).toHaveBeenCalled();
    });

    it('checkComma', () => {
      const result = component.checkComma('123,456');
      expect(result).toEqual('"123,456"');
    });

    it('exportPDF', () => {
      const spy = spyOn(commonLib, 'exportPDF');
      component.exportPDF(false);
      expect(spy).toHaveBeenCalled();
    });

    it('exportPDF', () => {
      const spy = spyOn(commonLib, 'exportPDF');
      component.exportForm.patchValue({fileName: 'Naruto'});
      component.exportPDF(false);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Event', () => {
    it('DialogEvent.ButtonClicked: should call "exportCSV"', () => {
      const spy = spyOn(component, 'exportCSV');
      eventService.handleEvent({
        id: 'ExportDialog',
        eventName:DialogEvent.ButtonClicked,
        data: { id: 'export', desc: 'Common.Button.Export', type: 'general', icon: 'fa-solid fa-download' }
      });

      expect(spy).toHaveBeenCalled();
    });

    it('DialogEvent.ButtonClicked: should call "exportPDF" with false', () => {
      component.exportForm.patchValue({fileType: 'pdf'});
      const spy = spyOn(component, 'exportPDF');
      eventService.handleEvent({
        id: 'ExportDialog',
        eventName:DialogEvent.ButtonClicked,
        data: { id: 'export', desc: 'Common.Button.Export', type: 'general', icon: 'fa-solid fa-download' }
      });

      expect(spy).toHaveBeenCalledWith(false);
    });

    it('DialogEvent.ButtonClicked: should call "exportPDF" with false', () => {
      component.exportForm.patchValue({fileType: 'pdf'});
      const spy = spyOn(component, 'exportPDF');
      eventService.handleEvent({
        id: 'ExportDialog',
        eventName:DialogEvent.ButtonClicked,
        data: { id: 'view', desc: 'Common.Button.View', type: 'general', icon: 'fa-solid fa-eye' }
      });

      expect(spy).toHaveBeenCalledWith(true);
    });

    it('exportForm valueChanges: should call "updateDialogButtons"', () => {
      const spy = spyOn(component, 'updateDialogButtons');
      component.exportForm.patchValue({fileType: 'csv'});
      expect(spy).toHaveBeenCalled();
    });
  });
});
