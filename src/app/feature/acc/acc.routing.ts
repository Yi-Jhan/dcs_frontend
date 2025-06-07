import { Routes } from '@angular/router';
import { authGuard, privilegeResolver } from '../../core/helper';

export const accRoutes: Routes = [
  { path: '', redirectTo: '/SystemOverview', pathMatch: 'full' },
  {
    path: 'SystemOverview',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../acc/system-overview/system-overview.component').then(c => c.SystemOverviewComponent),
    data: {
      stateName: 'SystemOverview',
      breadcrumb: { name: 'System Overview', icon: 'fa-solid fa-house', afterBaseOnly: true },
    }
  },
  {
    path: 'DeviceInfo',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../acc/device-info/device-info.component').then(c => c.DeviceInfoComponent),
    data: {
      stateName: 'DeviceInfo',
      breadcrumb: { name: 'Device Information', icon: 'fa-solid fa-laptop' },
    }
  },
  {
    path: 'Options',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../acc/options/options.component').then(c => c.OptionsComponent),
    data: {
      stateName: 'Options',
      breadcrumb: { name: 'Options', icon: 'fa-solid fa-gear', afterBaseOnly: true },
    }
  },
  {
    path: 'License',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../acc/license/license.component').then(c => c.LicenseComponent),
    data: {
      stateName: 'License',
      breadcrumb: { name: 'License', icon: 'fa-solid fa-key', afterBaseOnly: true },
    }
  },
];
