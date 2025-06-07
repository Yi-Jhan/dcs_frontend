import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AccountService, DialogService, SpinnerOverlayService, StateService } from '../../shared/service';
import { DialogButtonType, DialogStatus } from '../enum';

export const baseInterceptor: HttpInterceptorFn = ( req, next ) => {
  const stateService = inject(StateService);
  const authData = stateService.authData();

  if (authData && authData.token) {
    let utcOffset = new Date().getTimezoneOffset();
    const UserViewUtcOffset = (utcOffset < 0 ? '+' : '-') + Math.abs(utcOffset / 60);
    const cloned = req.clone({
      headers: req.headers
        .set('Authorization', 'Bearer ' + authData.token)
        .set('Tenant-ID', '1d94bc9b-106f-403c-96d4-6cd14b8b5394')
        .set('UTC-Offset', UserViewUtcOffset)
    });

    return next(cloned);
  }
  else {
    const cloned = req.clone({
      headers: req.headers
        .set('Tenant-ID', '1d94bc9b-106f-403c-96d4-6cd14b8b5394')
    });

    return next(cloned);
  }
};

export const errorInterceptor: HttpInterceptorFn = ( req, next ) => {
  const dialogService = inject(DialogService);
  const loading = inject(SpinnerOverlayService);
  const stateService = inject(StateService);
  const accountService = inject(AccountService);

  return next(req).pipe(
    catchError(err => {
      loading.hide();
      const errorMsg = err.statusText || err.message;

      switch(err.status) {
        case 401:
          if(stateService.loginStatus()) {
            accountService.logout();
          }
          else {
            openMessageDialog(dialogService, '__unauthorizedDialog', errorMsg)
          }
          break;

        default:
          openMessageDialog(dialogService, '__errorRespDialog', errorMsg)
          break;
      }

      return throwError(() => err)
    })
  );
};

const openMessageDialog = (dialog: DialogService, id: string, message: string) => {
  dialog.open(
    message,
    {
      title: 'i18n_Message',
      matConfig: { id, disableClose: true },
      buttons: [{ id: 'close', desc: 'i18n_Close', type: DialogButtonType.Close }],
      status: DialogStatus.Danger
    }
  );
}
