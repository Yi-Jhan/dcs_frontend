import { Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule, authAPI, roleAPI } from '../../../shared';
import { DialogService, SpinnerOverlayService, StateService } from '../../../shared/service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @ViewChild('mfaDialog') mfaDialog!: TemplateRef<any>;
  @ViewChild('messageDialog') messageDialog!: TemplateRef<any>;

  authAPI = authAPI();
  roleAPI = roleAPI();

  router = inject(Router);
  formBuilder = inject(FormBuilder);
  stateService = inject(StateService);
  dialogService = inject(DialogService);
  loading = inject(SpinnerOverlayService);

  sideMenuStatus = this.stateService.sideMenuStatus;
  submitted = false;
  token: any;

  loginForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  errorMsg = [
    'i18n_UsernameRequiredMsg',
    'i18n_PasswordRequiredMsg'
  ]

  passwordMask = true;

  constructor() {}

  onSubmit(): void {
    this.submitted = true;
    if(!this.loginForm.value.username || !this.loginForm.value.password) {
      return;
    }
    else {
      this.loading.show();
      this.authAPI.login(this.loginForm.value.username, this.loginForm.value.password).subscribe({
        next: auth => {
          this.token = auth.token;
          if(auth.using2FA) {
            this.stateService.authData.set({ username: this.loginForm.value.username, token: this.token });
            this.openMFADialog();
            this.loading.hide();

          }
          else {
            // this.callUserInfo();
            this.stateService.authData.set({ username: this.loginForm.value.username, token: this.token });
            this.router.navigateByUrl('/');
            this.sideMenuStatus.set(true);
            this.loading.hide();
          }
        },
        error: err => {}
      });
    }

  }

  callUserInfo(): void {
    this.authAPI.getUserInfo(this.token).pipe(
      switchMap(info => {
        this.stateService.authData.set({ username: info['username'], token: this.token });
        return this.roleAPI.getAllPrivilege();
      }),
    ).subscribe(privilege => {
      this.stateService.viewPrivilege.set(privilege);
      // this.cookieService.loginStatus = true;
      this.router.navigateByUrl('/');
    });
  }

  openMFADialog(): void {
    const dialogInfo: any = {
      title: 'i18n_twoStepVerification',
      matConfig: { id: '__2FA_Dialog', disableClose: true },
      buttons: [
        { id: 'Cancel', desc: 'Cancel', type: 'cancel' },
        { id: 'Submit', desc: 'Submit', type: 'general', disable: true}
      ]
    };
    this.dialogService.open(this.mfaDialog, dialogInfo);
  }

}
