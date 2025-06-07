import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import _ from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule, accountAPI, authAPI, onDestroyed, roleAPI } from '../../../../shared';
import { DataTableComponent, SearchBarComponent } from '../../../../shared/component';
import { DialogService, EventService, StateService } from '../../../../shared/service';
import { ChipsInputEvent, TableEvent } from '../../../../core/enum';

@Component({
  selector: 'app-account-mgm',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    SearchBarComponent,
    DataTableComponent
  ],
  templateUrl: './account-mgm.component.html',
  styleUrls: ['./account-mgm.component.scss']
})
export class AccountMgmComponent implements OnInit {
  destroy$ = onDestroyed();
  @ViewChild('createAccountDialog') createAccountDialog!: TemplateRef<any>;
  @ViewChild('updateAccountDialog') updateAccountDialog!: TemplateRef<any>;
  @ViewChild('mfaDialog') mfaDialog!: TemplateRef<any>;
  createAccountForm: FormGroup = new FormGroup({});
  updateAccountForm: FormGroup = new FormGroup({});
  // tableInfo: any;
  columnsDef: Array<any>;
  groupByColumns: Array<string>;
  isLoadingResults: any;
  filters: Array<string>;
  roleOpt: Array<any> = [];
  roleIdControl: any;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;

  code: string = '';
  qrcode: string = '';
  loginUser: string = '';
  authData: any = window.localStorage.getItem('authData');
  verifyTimeLeft: number = 60;
  verifyTimeinterval: any;
  invalidCode: boolean = false;
  username: string = '';
  usingMFA: boolean = false;
  verifyMFA: boolean = false;

  tableID = 'accountTable';
  accountList = new Array();

  authAPI = authAPI();
  roleAPI  = roleAPI();
  accountAPI = accountAPI();

  constructor(
    private formBuilder: FormBuilder,
    private eventService: EventService,
    private dialogService: DialogService,
    private stateService: StateService,
  ) {

    this.columnsDef = [
      { field: 'username', headerName: 'i18n_Username', width: '100px'},
      { field: 'email', headerName: 'i18n_Email', width: '100px' },
      { field: 'active', headerName: 'i18n_Active', width: '100px', cellRender: this.activeCellRender },
      { field: 'usingMFA', headerName: 'i18n_MFA', width: '100px', cellRender: this.mfaCellRender }, //assign account data.usingMFA to table
      { field: 'verifyMFADate', headerName: 'i18n_VerifyDate', width: '100px' },
      { field: 'roleName', headerName: 'i18n_RoleName', width: '100px', visible:false}
    ];
    this.groupByColumns = ['roleName'],
    this.isLoadingResults = false;
    this.filters = [];
   }

  ngOnInit(): void {
    this.initEvent();
    this.getUser();
  }

  toggleMFA(checked:boolean) {
    this.usingMFA = checked;
    if (checked) this.openMFAdialog();
    else this.verifyMFA = false;
    this.MFA();
    // console.log('toggleMFA: ', checked);
    // console.log('this.usingMFA: ', this.usingMFA);
    // console.log('this.verifyMFA: ', this.verifyMFA);
  }

  openMFAdialog() {
    this.verifyTimeLeft = 60;
    clearInterval(this.verifyTimeinterval);
    const dialogInfo: any = {
      title: 'i18n_MFA',
      matConfig: { id: 'mfaDialog', data: 'test', disableClose:true },
      buttons: [{id: 'cancel', desc: 'i18n_Cancel', type: 'cancel'}, {id: 'submit', desc: 'i18n_Submit', type: 'general' }]
    };
    this.dialogService.open(this.mfaDialog, dialogInfo);

    this.verifyTimer();
  }

  MFA() {
    this.authAPI.enableMFA(this.username, String(this.usingMFA)).subscribe(resp => {
      this.qrcode = resp.qrCodeImage;
    });
  }

  verifyTimer() {
    this.verifyTimeinterval = setInterval(() => {
      if (this.verifyTimeLeft > 0) {
        this.verifyTimeLeft--;
      }
    }, 1000)
  }

  verifyCode() {
    this.authAPI.verify(this.code, this.username).subscribe(
      {
        next: (resp:any) => {
          if (resp.success) {
            this.verifyMFA = resp.success;
            this.openVerifyDialog();
          }
          else {
            this.verifyMFA = !resp.success;
            this.invalidCode = true;
          }
        },
        complete: () => {},
        error: () => {
          this.invalidCode = true;
        }
      }
    );
  }

  openVerifyDialog() {
    const dialogInfo: any = {
      title: 'i18n_Verification',
      matConfig: { id: 'verifyDialog', data: '', disableClose:true },
      buttons: [{id: 'ok', desc: 'i18n_OK', type: 'general'}]
    };
    this.dialogService.open('i18n_VerificationSuccessfully', dialogInfo);
  }

  activeCellRender(data:any): HTMLElement {
    const container = document.createElement('div');
    container.style.display = 'flex';
    const chip = document.createElement('div');
    chip.style.lineHeight = '22px';
    chip.style.borderRadius = '15px';
    chip.style.padding = '0 10px';
    chip.style.margin = '0 5px 0 0';
    if (data) {
      data = 'Enable';
      // data = this.translate.instant('AccountMgm.Table.Enable');
      chip.style.background = '#129f53';
    } else {
      data = 'Disable';
      chip.style.background = '#595959';
    }
    chip.innerHTML = data;
    container.appendChild(chip);
    return container;
  }

  mfaCellRender(data:any): HTMLElement {
    const container = document.createElement('div');
    container.style.display = 'flex';
    const chip = document.createElement('div');
    chip.style.lineHeight = '22px';
    chip.style.borderRadius = '15px';
    chip.style.padding = '0 10px';
    chip.style.margin = '0 5px 0 0';
    if (data) {
      data = 'Enable';
      chip.style.background = '#129f53';
    } else {
      data = 'Disable';
      chip.style.background = '#595959';
    }
    chip.innerHTML = data;
    container.appendChild(chip);
    return container;
  }

  getUser() {
    const token = this.stateService.authData().token;
    this.authAPI.getUserInfo(token).subscribe(
      {
        next: (resp:any) => {
          this.loginUser = resp.username;
          this.getAccount();
        },
        complete: () => {},
        error: () => {}
      }
    );
  }

  getRole() {
    this.roleAPI.getRoleList().subscribe(
      {
        next: (resp:any) => {
          // console.log('getRoleList: ', resp);
          this.roleOpt = resp;
        },
        complete: () => {},
        error: () => {}
      }
    );
  }

  getAccount() {
    this.accountAPI.getAccount().subscribe(
      {
        next: (resp:any) => {
          this.accountList = resp;
        },
        complete: () => {},
        error: () => {}
      }
    );
  }

  createAccount() {
    // console.log('createAccount: ', this.createAccountForm.value);
    this.accountAPI.createAccount(this.createAccountForm.value).subscribe(
      {
        next: () => {
          this.dialogService.closeAll();
          this.getAccount();
        },
        complete: () => {},
        error: () => {}
      }
    );
  }

  updateAccount() {
    // console.log('updateAccount: ', this.updateAccountForm.value);
    this.accountAPI.updateAccount(this.updateAccountForm.value.id, this.updateAccountForm.value).subscribe(
      {
        next: () => {
          this.dialogService.closeAll();
          this.getAccount();
        },
        complete: () => {},
        error: () => {}
      }
    );
  }

  deleteAccount() {
    // console.log('deleteAccount id: ', this.updateAccountForm.value.id);
    this.accountAPI.deleteAccount(this.updateAccountForm.value.id).subscribe(
      {
        next: () => {
          this.dialogService.closeAll();
          this.getAccount();
        },
        complete: () => {},
        error: () => {}
      }
    );
  }

  isControlHasError(formName:string, controlName: string, validationType: string): boolean {
    if (formName == 'createAccountForm') var control = this.createAccountForm.controls[controlName];
    else var control = this.updateAccountForm.controls[controlName];

    if (!control) return false;
    const result = control.hasError(validationType) && (control.dirty || control.touched);
    return result;
  }

  openCreateAccountDialog() {
    this.getRole();
    this.createAccountForm = this.formBuilder.group(
      {
      username: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required, Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])(?=.*[^A-Za-z0-9]).{8,}$')])],
      confirmPassword: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      roleId: ['', Validators.compose([Validators.required])],
      active: true,
      // roleId: 1
      },
      {
        validator: ConfirmPasswordValidator.MatchPassword,
      }
      );
    const createAccount: any = {
      title: 'i18n_CreateAccount',
      matConfig: { id: 'createAccountDialog', data:'', width:'500px', disableClose:true },
      status: 'primary',
      buttons: [{id: 'cancel', desc: 'i18n_Cancel', type: 'cancel' }, {id: 'create', disable:true, desc: 'i18n_Create', type: 'general'}]
    };
    this.dialogService.open(this.createAccountDialog, createAccount);
    this.createAccountForm.valueChanges.subscribe(val => {
      if (this.createAccountForm.valid) {
        this.dialogService.updateButtonStatus('createAccountDialog', 'create', true);
      }
    });
  }

  openUpdateAccountDialog(data:any) {
    this.getRole();
    this.verifyMFA = false;
    // this.roleIdControl = new FormControl(String(data.roleId));
    this.updateAccountForm = this.formBuilder.group(
      {
        id: data.id,
        username: [data.username, Validators.compose([Validators.required])],
        password: ['', Validators.compose([Validators.required, Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])(?=.*[^A-Za-z0-9]).{8,}$')])],
        confirmPassword: ['', Validators.compose([Validators.required])],
        email: [data.email, Validators.compose([Validators.required, Validators.email])],
        active: data.active,
        roleId: [data.roleId.toString(), Validators.compose([Validators.required])],
        usingMFA: data.usingMFA //binding usingMFA (formControlName = usingMFA) when row click from service.
      },
      {
        validator: ConfirmPasswordValidator.MatchPassword,
      }
    );
    this.username = data.username;
    const updateAccount: any = {
      title: 'i18n_UpdateAccount',
      matConfig: { id: 'updateAccountDialog', data: '', width:'500px', disableClose:true , autoFocus:false },
      status: 'warning',
      buttons: [{id: 'cancel', desc: 'i18n_Cancel', type: 'cancel'}, {id: 'delete', desc: 'i18n_Delete', type: 'general', color: 'danger'}, { id: 'update', disable:true, desc: 'i18n_Update', type: 'general' }]
    };
    this.dialogService.open(this.updateAccountDialog, updateAccount);
    this.updateAccountForm.valueChanges.subscribe(val => {
      if (this.updateAccountForm.valid) {
        this.dialogService.updateButtonStatus('updateAccountDialog', 'update', true);
      }
    });
  }

  openDeleteAccountDialog() {
    const deleteAccount: any = {
      title: 'i18n_DeleteAccount',
      matConfig: { id: 'deleteAccountDialog', data: '', disableClose:true },
      status: 'danger',
      buttons: [{id: 'cancel', desc: 'i18n_Cancel', type: 'cancel'}, {id: 'confDelete', desc: 'i18n_Delete', type: 'general'}]
    };
    this.dialogService.open('i18n_DeleteAccountMsg', deleteAccount);
  }

  initEvent(): void {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      switch (event.eventName) {
        case ChipsInputEvent.InputChange:
          this.filters = _.clone(event.data);
          break;
        case TableEvent.RowClicked:
          console.log('RowClicked: ', event.data);
          this.openUpdateAccountDialog(event.data);
          break;
        case "cancelDialog":
        case "closeDialog":
          if (event.id === 'mfaDialog') {
            if (this.verifyMFA) this.usingMFA = true;
            else this.usingMFA = false;
            // console.log("mfaDialog = cancelDialog || closeDialog" );
            // console.log('this.usingMFA: ', this.usingMFA);
            // console.log('this.verifyMFA: ', this.verifyMFA);
            this.code = '';
            this.invalidCode = false;
          }
          break;
        case "dialogButtonClicked":
          switch (event.id) {
            case 'createAccountDialog':
              if (event.data.id === 'create') this.createAccount();
              break;
            case 'updateAccountDialog':
              if (event.data.id === 'delete') this.openDeleteAccountDialog();
              if (event.data.id === 'update') this.updateAccount();
              break;
            case 'deleteAccountDialog':
              if (event.data.id === 'confDelete') this.deleteAccount();
              break;
            case 'mfaDialog':
              if (event.data.id === 'submit') {
                this.verifyCode();
                this.code = '';
                this.invalidCode = false;
              }
              break;
            case 'verifyDialog':
              if (event.data.id === 'ok') {
                this.code = '';
                this.invalidCode = false;
                this.dialogService.close('mfaDialog');
                this.dialogService.close('verifyDialog');
              }
              break;
          }
          break;
      }
    });
  }
}

export class ConfirmPasswordValidator {
  static MatchPassword(control: any) {
    const password:any = control.get('password').value;
    const confirmPassword = control.get('confirmPassword').value;
    if (password !== confirmPassword) control.get('confirmPassword').setErrors({ ConfirmPassword: true });
    return null;
  }
}
