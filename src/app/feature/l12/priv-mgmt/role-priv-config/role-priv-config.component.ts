import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs'
import _ from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { RolePrivConfigService } from './role-priv-config.service';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { RuleEditorComponent } from '../rule-editor/rule-editor.component';
import { SharedModule, onDestroyed, roleAPI } from '../../../../shared';
import { DataTableComponent, SearchBarComponent } from '../../../../shared/component';
import { DialogService, EventService, SpinnerOverlayService } from '../../../../shared/service';
import { ChipsInputEvent, DialogEvent, TableEvent } from '../../../../core/enum';
import { IDialogButton } from '../../../../core/model';

@Component({
  selector: 'app-role-priv-config',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SearchBarComponent,
    DataTableComponent,
    MatRadioModule
  ],
  templateUrl: './role-priv-config.component.html',
  styleUrls: ['./role-priv-config.component.scss']
})
export class RolePrivConfigComponent implements OnInit, AfterViewInit {
  destroy$ = onDestroyed();
  @ViewChild('createDialog') createDialog!: TemplateRef<any>;

  // Component ID
  createRoleDialogID = 'CreateRoleDialog';
  ruleEditorDialogID = 'RuleEditorDialog';
  configSearchBarID = 'ConfigSearchBar';
  deleteConfirmID = 'DeleteConfirm';
  deactivateConfirmID = 'DeactivateConfirm';
  privilegeTableID = 'PrivilegeTable';
  ruleTableID = 'RuleTable';

  deleteItem: any;
  dirty = false;
  deactivateSubjuct$ = new Subject<boolean>();
  roleList = new Array<any>();

  // Table
  privColumnsDef: Array<any>;
  ruleColumnDef: Array<any>;
  privTableData = new Array();
  ruleTableData = new Array();
  groupByColumns: Array<string>;
  isLoadingTemplate = false;
  isLoadingRule = false;
  filters = new Array<string>();

  // Form
  infoForm: FormGroup;
  createForm: FormGroup;

  roleID: any;
  isSelectedOption = true;
  itemHidden: any;

  roleAPI = roleAPI();

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private router: Router,
    private loading: SpinnerOverlayService,
    private translate: TranslateService,
    private rolePrivConfigService: RolePrivConfigService
  ) {

    this.privColumnsDef = [
      { field: 'item', headerName: 'i18n_Item', needTranslate: true },
      { field: 'grouping', headerName: 'i18n_Grouping', visible: false },
      { field: 'category', headerName: 'i18n_Category', visible: false }
    ];
    this.groupByColumns = ['grouping', 'category'];

    this.ruleColumnDef = [
      { field: 'delete', headerName: '', width: '26px', cellRender: this.rolePrivConfigService.deleteCellRender, cellEvent: 'click' },
      { field: 'fieldName', headerName: 'i18n_Fields', cellRender: this.rolePrivConfigService.fieldNameCellRender },
      // { field: 'operator', headerName: 'RolePrivConfig.Table.Operator' },
      { field: 'keyword', headerName: 'i18n_Content', cellRender: this.rolePrivConfigService.keywordCellRender },
    ];

    this.infoForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['']
    });

    this.createForm = this.formBuilder.group({
      createType: 'new',
      role: null
    });
  }

  ngOnInit(): void {
    this.roleID = this.route.snapshot.params['roleID'];
    this.initEvent();

    if(this.roleID) {
      this.getRoleTemplate(this.roleID);
    }
  }

  ngAfterViewInit(): void {
    if(!this.roleID) {
      this.openCreateRoleDialog();
    }
  }

  initEvent(): void {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      switch(event.eventName) {
        case ChipsInputEvent.InputChange:
          if(event.id === this.configSearchBarID) {
            this.filters = _.clone(event.data);
          }
          break;

        //#region Table Event
        case TableEvent.RowSelectToggle:
          if(event.id === this.privilegeTableID) {
            this.dirty = true;
            this.rolePrivConfigService.checkRowSelected(this.privTableData, event.data);
          }
          break;

        case TableEvent.RowClicked:
          if(event.id === this.ruleTableID) {
            this.openRuleEditor(event.data);
          }
          break;

        case TableEvent.CellEvent:
          this.deleteItem = event.data;
          this.openConfrimDialog(this.deleteConfirmID, this.translate.instant('i18n_ConfirmDelete'));
          break;

        case TableEvent.MasterToggle:
          if(event.id === this.privilegeTableID) {
            _.each(this.privTableData, item => {
              item.active = event.data;
            });
          }
          break;
        //#endregion

        //#region Dialog Event
        case DialogEvent.CancelDialog:
        case DialogEvent.CloseDialog:
          if(event.id === this.createRoleDialogID) {
            this.router.navigate(['RolePrivMgm']);
          }
          break;

        case DialogEvent.ButtonClicked:
          switch(event.id) {
            case this.createRoleDialogID:
              if(event.data.id === 'ok') {
                const id = this.createForm.value.createType === 'new' ? '0' : this.createForm.value.role;
                this.dirty = true;
                this.getRoleTemplate(id, true);
                this.dialogService.closeAll();
              }
              break;

            case this.deleteConfirmID:
              this.dirty = true;
              this.deleteRule(this.deleteItem);
              this.dialogService.closeAll();
              break;

            case this.deactivateConfirmID:
              this.deactivateSubjuct$.next(event.data.id === 'ok');
              this.deactivateSubjuct$.complete();
              this.dialogService.close(this.deactivateConfirmID);
              break;
          }
          break;
        //#endregion

        case 'addRule':
          this.dirty = true;
          this.addRule(event.data);
          break;

        case 'updateRule':
          this.dirty = true;
          this.updateRule(event.data);
          break;
      }
    });

    this.infoForm.valueChanges.pipe(this.destroy$()).subscribe(changes => {
      this.dirty = true;
    });

    this.createForm.valueChanges.pipe(this.destroy$()).subscribe(changes => {
      if(changes['createType'] === 'existing') {
        this.dialogService.updateButtonStatus(this.createRoleDialogID, 'ok', changes['role'] !== null);
      }
      else {
        this.dialogService.updateButtonStatus(this.createRoleDialogID, 'ok', true);
      }
    });
  }

  getRoleTemplate(id: string, isCreate: boolean = false): void {
    // this.loading.show();
    this.isLoadingRule = true;
    this.isLoadingTemplate = true;
    this.roleAPI.getRoleTemplate(id).subscribe({
      next: (resp: any)  => {
        if(!isCreate) {
          this.infoForm.patchValue({name: resp.role.name, description: resp.role.description}, {emitEvent: false, onlySelf: true});
        }

        this.setPrivilegeInfo(_.sortBy(resp.privilegeDefine, item => item.id));
        this.setRuleInfo(resp.ruleList);
      },
      error: (err: any) => {
        this.isLoadingRule = false;
        this.isLoadingTemplate = false;
      },
      complete: () => {
        this.isLoadingRule = false;
        this.isLoadingTemplate = false;
      }
    });
  }

  setPrivilegeInfo(info: any): void {
    this.itemHidden = _.remove(info, (item:any) => item.grouping === 'i18n_Privilege');

    _.each(info, (item, index) => {
      item.rowSelected = item.active;
      item.rowID = index;
    });

    this.privTableData = info;
    this.isLoadingTemplate = false;
  }

  setRuleInfo(info: any): void {
    if(info) {
      this.ruleTableData = info;
      this.isLoadingRule = false;
    }
  }

  addRule(data: any): void {
    const isExist = _.some(this.ruleTableData, item => {
      return item.value === data.value;
    });

    if(!isExist) {
      this.ruleTableData.push(data);
      this.ruleTableData = _.clone(this.ruleTableData);
      this.dialogService.close(this.ruleEditorDialogID);
    }
    else {
      this.showMessage(this.translate.instant('i18n_FieldExist'));
    }
  }

  updateRule(data: any): void {
    const index = _.findIndex(this.ruleTableData, (item:any) => {
      return item.value === data.value;
    });

    if(index !== -1) {
      this.ruleTableData.splice(index, 1, data);
      this.ruleTableData = _.clone(this.ruleTableData);
      this.dialogService.close(this.ruleEditorDialogID);
    }
  }

  deleteRule(data: any): void {
    const index = _.findIndex(this.ruleTableData, (item:any) => {
      return item.value === data.value;
    });

    if(index !== -1) {
      this.ruleTableData.splice(index, 1);
      this.ruleTableData = _.clone(this.ruleTableData);
      this.dialogService.close(this.ruleEditorDialogID);
    }
  }

  onClickActionButton(action: string) {
    if(action === 'cancel') {
      this.router.navigate(['RolePrivMgm']);
    }
    else {
      this.loading.show();

      const config = this.rolePrivConfigService.getRoleConfigInfo(
        this.privTableData,
        this.ruleTableData,
        this.itemHidden,
        { name: this.infoForm.value.name, description: this.infoForm.value.description }
      );

      switch(action) {
        case 'create':
          this.createAction(config);
          break;
        case 'update':
          this.updateAction(config);
          break;
      }
    }
  }

  createAction(config: any): void {
    if(!this.infoForm.value.name) {
      this.showMessage(this.translate.instant('i18n_RoleRequired'));
      this.loading.hide();
    }
    else if(this.rolePrivConfigService.isRoleDuplicate(this.roleList, this.infoForm.value.name)) {
      this.showMessage(this.translate.instant('i18n_RoleDuplicate'));
      this.loading.hide();
    }
    else {
      this.roleAPI.createRole(config).subscribe({
        next: () => {
          this.dirty = false;
          this.router.navigate(['RolePrivMgm']);
        },
        error: err => {
          this.showMessage(this.translate.instant('i18n_CreateRoleFailed'));
        }
      });
    }
  }

  updateAction(config: any): void {
    this.roleAPI.updateRole(this.roleID, config).subscribe({
      next: () => {
        this.dirty = false;
        this.router.navigate(['RolePrivMgm']);
      },
      error: err => {
        this.showMessage(this.translate.instant('i18n_UpdateRoleFailed'));
      }
    });
  }

  canDeactivate(): boolean | Observable<boolean> {
    if(this.dirty) {
      this.openConfrimDialog(this.deactivateConfirmID, this.translate.instant('i18n_ConfirmToLeave'));

      return this.deactivateSubjuct$.asObservable();
    }

    return true;
  }

  //#region Open Dialog
  openCreateRoleDialog(): void {
    this.loading.show();
    this.roleAPI.getRoleList().subscribe({
      next: resp => {
        this.roleList = resp;
        const dialogInfo: any = {
          title: 'i18n_RoleInfo',
          matConfig: { id: this.createRoleDialogID, autoFocus: false, disableClose: true, width: '550px' },
          buttons: [
            { id: 'cancel', desc: 'i18n_Cancel', type: 'cancel' },
            { id: 'ok', desc: 'i18n_OK', type: 'general' }
          ]
        };

        this.dialogService.open(this.createDialog, dialogInfo);
      },
      error: () => this.loading.hide(),
      complete: () => this.loading.hide()
    });
  }

  openRuleEditor(ruleInfo: any = null): void {
    const dialogInfo: any = {
      title: 'i18n_RuleEditor',
      matConfig: {
        id: this.ruleEditorDialogID,
        data: (ruleInfo) ? {
                              fieldName: ruleInfo['fieldName'],
                              operator: ruleInfo['operator'],
                              keyword: ruleInfo['keyword'],
                              value: ruleInfo['value'],
                           }
                          : null,
        autoFocus: false,
        disableClose: true,
        width: '550px'
      },
      buttons: [{ id: 'cancel', type: 'cancel' }],
      status: (ruleInfo) ? 'warning': 'primary'
    };

    dialogInfo.buttons!.push({
      id: ruleInfo ? 'update' : 'save',
      desc: ruleInfo ? 'i18n_Update' : 'i18n_Save',
      type: 'general',
      disable: ruleInfo ? false : true
    });

    this.dialogService.open(RuleEditorComponent, dialogInfo);
  }

  showMessage(msg: string): void {
    const dialogInfo: any = {
      title: 'i18n_Message',
      matConfig: { id: 'PrivMessageDialog', autoFocus: false, disableClose: true, width: '300px' },
      buttons: [
        { id: 'ok', desc: 'i18n_OK', type: 'close' }
      ]
    };

    this.dialogService.open(msg, dialogInfo);
  }

  openConfrimDialog(id: string, msg: string, button?: Array<IDialogButton>): void {
    const dialogInfo: any = {
      title: 'i18n_Confirm',
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
  //#endregion
}
