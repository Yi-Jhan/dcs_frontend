import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import _ from 'lodash';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { SharedModule, onDestroyed, roleAPI } from '../../../../shared';
import { DataTableComponent, SearchBarComponent } from '../../../../shared/component';
import { DialogService, EventService, SpinnerOverlayService } from '../../../../shared/service';
import { ChipsInputEvent, DialogEvent, TableEvent } from '../../../../core/enum';

@Component({
  selector: 'app-role-priv-mgm',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SearchBarComponent,
    DataTableComponent
  ],
  templateUrl: './role-priv-mgm.component.html',
  styleUrls: ['./role-priv-mgm.component.scss']
})
export class RolePrivMgmComponent implements OnInit {
  destroy$ = onDestroyed();
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;
  columnsDef: Array<any>;
  tableID = 'privilegeMgmTable';
  data = new  Array();
  filters = new Array<string>();
  deleteID: any;
  isLoadingResults = false;

  roleAPI = roleAPI()

  constructor(
    private eventService: EventService,
    private router: Router,
    private dialogService: DialogService,
    private translate: TranslateService,
    private loading: SpinnerOverlayService
  ) {

    this.columnsDef = [
      { field: 'delete', headerName: '', width: '26px', cellRender: this.deleteCellRender, cellEvent: 'click' },
      { field: 'name', headerName: 'i18n_RoleName' },
      { field: 'appliedCount', headerName: 'i18n_AppliedCount' },
      { field: 'description', headerName: 'i18n_Description' }
    ];
  }

  ngOnInit(): void {
    this.initEvent();
    this.getRoleList();
  }

  initEvent(): void {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      switch(event.eventName) {
        case ChipsInputEvent.InputChange:
          this.filters = _.clone(event.data);
          break;

        case TableEvent.RowClicked:
          const param = event.data ? event.data.id : null;
          if(param) {
            this.router.navigate(['RolePrivConfig', param]);
          }
          else {
            this.dialogService.open('no id');
          }
          break;

        case TableEvent.CellEvent:
          this.openConfirmDialog(event.data)
          break;

        case DialogEvent.ButtonClicked:
          if(event.id === 'confirmDeleteDialog' && event.data.id === 'delete') {
            this.deleteRole();
          }
          break;
      }
    });
  }

  getRoleList(): void {
    this.isLoadingResults = true;
    this.roleAPI.getRoleList()
      .subscribe({
        next: (resp: any)  => {
          this.data = _.filter(resp, item => item.id > 2);
        },
        // error: (err: any) => console.log(err),
        complete: () => {
          this.loading.hide();
          this.isLoadingResults = false;
        }
      });
  }

  openConfirmDialog(roleInfo: any): void {
    this.deleteID = roleInfo.id;
    const dialogInfo: any = {
      title: `${this.translate.instant('i18n_DeleteRole')} - ${roleInfo.name}`,
      matConfig: { id: 'confirmDeleteDialog', data: roleInfo.appliedCount, autoFocus: false, width: '350px' },
      buttons: [
        { id: 'cancel', type: 'cancel' },
        { id: 'delete', desc: 'i18n_Delete', type: 'general' }
      ],
      status: 'danger'
    };

    this.dialogService.open(this.confirmDialog, dialogInfo);
  }

  deleteCellRender(data: any, rowData: any): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.classList.add('cellBtn', 'warn');
    const i = document.createElement('i');
    i.classList.add('fa-solid', 'fa-trash-can');
    btn.append(i);
    return btn;
  }

  createNewRole(): void {
    this.router.navigate(['RolePrivConfig']);
  }

  deleteRole() {
    this.loading.show();
    this.roleAPI.deleteRole(this.deleteID).subscribe({
      next: () => {
        this.dialogService.close('confirmDeleteDialog');
        this.getRoleList();
      }
    });
  }
}
