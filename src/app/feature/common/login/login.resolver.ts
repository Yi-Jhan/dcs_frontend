import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { StateService } from '../../../shared/service';
import { environment } from '../../../../environments/environment';
import { Service } from '../../../core/enum';

export const loginResolver: ResolveFn<boolean> = (route, state) => {
  const isLogin = inject(StateService).loginStatus;
  const router = inject(Router);

  if(isLogin()) {
    let path = '';
    switch(environment.service) {
      case Service.ACC:
        path = '/SystemOverview';
        break;

      case Service.L12:
        path = '/Overview';
        break;
    }

    router.navigateByUrl(path);
    return true;
  }
  else {
    return false;
  }
};
