import { Injectable, inject } from "@angular/core";
import { CanDeactivate, CanDeactivateFn } from "@angular/router";
import { Observable } from "rxjs";
import { StateService } from "../../shared/service";


// export interface CanComponentDeactivate {
//   canDeactivate: () => Observable<boolean> | boolean;
// }

export const CanDeactivateGuard: CanDeactivateFn<any> = (component: any) => {
  let stateService = inject(StateService);
  if(stateService.loginStatus) {
      return component.canDeactivate ? component.canDeactivate() : true;
    }
    return true;
};


// @Injectable({
//   providedIn: 'root'
// })
// export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
//   isLogin$: Observable<boolean> = this.stateService.loginStatus;

//   constructor(private stateService: StateService) {}

//   canDeactivate(component: CanComponentDeactivate): boolean | Observable<boolean> {
//     if(this.stateService.loginStatus) {
//       return component.canDeactivate ? component.canDeactivate() : true;
//     }

//     return true;
//   }
// }
