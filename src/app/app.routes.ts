import { Routes } from '@angular/router';
import { privilegeResolver } from './core/helper';
import { loginResolver } from './feature/common/login/login.resolver';
import { environment } from '../environments/environment';

export const routes: Routes = [
  ...environment.routes,
  { path: 'Login', resolve: { isLogin: loginResolver, privilege: privilegeResolver }, loadComponent: () => import('./feature/common/login/login.component').then(c => c.LoginComponent) },
  {
    path: 'NoPrivilege',
    loadComponent: () => import('./feature/common/no-privilege/no-privilege.component').then(c => c.NoPrivilegeComponent),
    data: {
      stateName: 'NoPrivilege',
      breadcrumb: { name: 'No Privilege', icon: 'fa-solid fa-file-circle-xmark', terminalOnly: true },
    }
  },
  {
    path: 'Demo',
    // canMatch: [authGuard],
    resolve: { privilege: privilegeResolver },
    loadComponent: () => import('./feature/common/demo/demo.component').then(c => c.DemoComponent),
    data: {
      stateName: 'Demo',
      breadcrumb: { name: 'Demo', icon: 'fa-solid fa-ghost', afterBaseOnly: true },
    }
  },
  {
    path: '**',
    loadComponent: () => import('./feature/common/error/error.component').then(c => c.ErrorComponent),
    data: {
      stateName: 'PageNotFound',
      breadcrumb: { name: 'Page Not Found', icon: 'fa-solid fa-file-circle-xmark', afterBaseOnly: true, terminalOnly: true },
    }
  }
];
