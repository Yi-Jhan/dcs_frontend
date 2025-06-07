import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Theme } from '../../core/enum';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  translate = inject(TranslateService);
  router = inject(Router);

  authData            = signal(this.getDefaultAuthData());
  loginStatus         = computed(() => this.authData() ? true : false);
  language            = signal(localStorage.getItem('lang') ?? 'en-us');
  menuAction          = signal(false);
  viewPrivilege       = signal<any>(null);
  sideMenuStatus      = signal(this.loginStatus());
  currentService      = signal(environment.service);
  idleTimeSec         = signal(43200);
  theme               = signal(this.getDefaultTheme());

  constructor() {
    effect(() => {
      this.translate.use(this.language());

      if (this.authData()) {
        localStorage.setItem('authData', JSON.stringify(this.authData()));
      }
      else {
        localStorage.removeItem('authData');
      }

      if (!this.loginStatus()) {
        this.router.navigateByUrl('/Login');
      }
    });
  }

  private getDefaultAuthData() {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        return JSON.parse(authData);
      }
      catch (error) {
        return null;
      }
    }

    return null;
  }

  getDefaultTheme(): Theme {
    const theme = localStorage.getItem('theme');

    switch(theme) {
      case Theme.Light:
      case Theme.Dark:
        return theme;

      default:
        return Theme.Light;
    }
  }

}
