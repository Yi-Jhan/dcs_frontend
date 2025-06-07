import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {


  private stateService = inject(StateService);

  constructor() { }

  logout(): void {
    this.stateService.authData.set(null);
    this.stateService.sideMenuStatus.set(false);
  }
}
