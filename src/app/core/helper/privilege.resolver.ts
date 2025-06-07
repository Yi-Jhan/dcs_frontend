import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { EventService, SpinnerOverlayService, StateService } from '../../shared/service';
import { firstValueFrom } from 'rxjs';
import { ExportEvent } from '../enum';

export const privilegeResolver: ResolveFn<any> = async (route, state) => {
  return {test: '123'};

  // const stateService = inject(StateService);
  // const loading = inject(SpinnerOverlayService);
  // const roleAPI = inject(ApiRoleService);
  // const eventService = inject(EventService);
  // const router = inject(Router);

  // if(stateService.loginStatus()) {
  //   loading.show();
  //   const privilege = await firstValueFrom(roleAPI.getPrivilegeByStateName(route.data['stateName']));
  //   loading.hide();

  //   eventService.emit({
  //     id: '',
  //     eventName: ExportEvent.ExportPrivilege,
  //     data: privilege.privilegeDefine['ExportReport'] === true
  //   });

  //   return privilege;
  // }
  // else {
  //   eventService.emit({ id: '', eventName: ExportEvent.ExportPrivilege, data: false });
  //   return router.createUrlTree(['/Login']);
  // }
};
