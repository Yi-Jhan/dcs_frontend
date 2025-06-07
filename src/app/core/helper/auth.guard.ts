import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { EventService, SpinnerOverlayService, StateService } from '../../shared/service';
import { firstValueFrom } from 'rxjs';
import { ExportEvent } from '../enum';

export const authGuard: CanMatchFn = async (route, state) => {

  const router = inject(Router);
  const loginStatus = inject(StateService).loginStatus;

  return loginStatus() ? true : router.createUrlTree(['/Login']);

  // const router = inject(Router);
  // const loading = inject(SpinnerOverlayService);
  // const stateService = inject(StateService);
  // const loginStatus = stateService.loginStatus();
  // const viewPrivilege = stateService.viewPrivilege();
  // const eventService = inject(EventService);

  // if(loginStatus) {
  //   if(!viewPrivilege) {
  //     loading.show();
  //     stateService.viewPrivilege.set(
  //       await firstValueFrom(inject(ApiRoleService).getAllPrivilege()));
  //     loading.hide();
  //   }

  //   const stateName = route.data ? route.data['stateName']: '';
  //   const hasPrivilege = checkPrivilege(eventService, stateService, stateName);
  //   if(!hasPrivilege) {
  //     console.log('state name: "' + stateName + '" has no privilege.');
  //     return router.createUrlTree(['/NoPrivilege']);
  //   }
  //   else {
  //     return true;
  //   }
  // }
  // else {
  //   return router.createUrlTree(['/Login']);
  // }
};

const checkPrivilege = (eventService: EventService, stateService: StateService, stateName: string) => {
  if(stateName) {
    switch(stateName) {
      case 'Deploymgm':
      case 'Options':
      case 'Privilege':
        eventService.emit({ id: '', eventName: ExportEvent.ExportPrivilege, data: false });
        return true;

      default:
        return stateService.viewPrivilege().privilegeDefine[stateName] === true;
    }
  }

  return false;
}
