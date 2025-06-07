import { Routes } from '@angular/router';
import { authGuard, privilegeResolver } from '../../core/helper';
import { ErrorComponent, NoPrivilegeComponent } from '../common';

export const l12Routes: Routes = [
  { path: '', redirectTo: 'Overview', pathMatch: 'full' },
  {
    path: 'Overview',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/overview/overview.component').then(c => c.OverviewComponent),
    data: {
      stateName: 'Overview',
      breadcrumb: { name: 'System Overview', icon: 'fas fa-home', afterBaseOnly: true},
    }
  },
  {
    path: 'OrderView/:order',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/order-view/order-view.component').then(c => c.OrderViewComponent),
    data: {
      stateName: 'OrderView',
      breadcrumb: { name: 'Order View', icon: 'fas fa-home', afterBaseOnly: true},
    }
  },
  {
    path: 'DeviceInfo/:sn',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/device-info/device-info.component').then(c => c.DeviceInfoComponent),
    data: {
      stateName: 'DeviceInfo',
      breadcrumb: { name: 'Device Infomation', icon: 'fas fa-home', afterBaseOnly: true},
    }
  },
  {
    path: 'Deploymgm',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/deploy-mgmt/deploymgm/deploymgm.component').then(c => c.DeploymgmComponent),
    data: {
      stateName: 'Deploymgm',
      breadcrumb: { name: 'Deploy Management', icon: 'fas fa-home', afterBaseOnly: true},
    }
  },
  {
    path: 'AddWorkOrder',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/deploy-mgmt/addworkorder/addworkorder.component').then(c => c.AddworkorderComponent),
    data: {
      stateName: 'AddWorkOrder',
      breadcrumb: { name: 'Add Work Order', icon: 'fas fa-home', afterBaseOnly: true},
    }
  },
  {
    path: 'ToolPool',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/deploy-mgmt/toolpool/toolpool.component').then(c => c.ToolpoolComponent),
    data: {
      stateName: 'ToolPool',
      breadcrumb: { name: 'Tool Pool', icon: 'fas fa-home', afterBaseOnly: true},
    }
  },
  {
    path: 'ProcessProfile',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/deploy-mgmt/processprofile/processprofile.component').then(c => c.Processprofile),
    data: {
      stateName: 'ProcessProfile',
      breadcrumb: { name: 'Process Profile', icon: 'fas fa-home', afterBaseOnly: true},
    }
  },
  {
    path: 'ProcessProfileConfig',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/deploy-mgmt/processprofileconfig/processprofileconfig.component').then(c => c.ProcessprofileconfigComponent),
    data: {
      stateName: 'ProcessProfile',
      breadcrumb: { name: 'Process Profile Config', icon: 'fas fa-home', afterBaseOnly: true},
    }
  },
  {
    path: 'Options',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/options/options/options.component').then(c => c.OptionsComponent),
    data: {
      stateName: 'Options',
      breadcrumb: { name: 'Options ', icon: 'fas fa-cog fa-fw', afterBaseOnly: true},
    }
  },
  {
    path: 'NetworkConfig',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/options/network-config/network-config.component').then(c => c.NetworkConfigComponent),
    data: {
      stateName: 'NetworkConfig',
      breadcrumb: { name: 'Network Config', icon: 'fas fa-cog fa-fw', afterBaseOnly: true},
    }
  },
  {
    path: 'Privilege',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/priv-mgmt/privilege/privilege.component').then(c => c.PrivilegeComponent),
    data: {
      stateName: 'Privilege',
      breadcrumb: { name: 'Privilege ', icon: 'fa-solid fa-user-gear', afterBaseOnly: true},
    }
  },
  {
    path: 'AccountMgm',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/priv-mgmt/account-mgm/account-mgm.component').then(c => c.AccountMgmComponent),
    data: {
      stateName: 'AccountMgm',
      breadcrumb: { name: 'Account Mgmagement ', icon: 'fa-solid fa-user-gear', afterBaseOnly: true},
    }
  },
  {
    path: 'RolePrivMgm',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/priv-mgmt/role-priv-mgm/role-priv-mgm.component').then(c => c.RolePrivMgmComponent),
    data: {
      stateName: 'RolePrivMgm',
      breadcrumb: { name: 'Role Privilege Mgmagement', icon: 'fa-solid fa-user-gear', afterBaseOnly: true},
    }
  },
  {
    path: 'RolePrivConfig',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/priv-mgmt/role-priv-config/role-priv-config.component').then(c => c.RolePrivConfigComponent),
    data: {
      stateName: 'RolePrivMgm',
      breadcrumb: { name: 'Role Privilege Config', icon: 'fa-solid fa-user-gear', afterBaseOnly: true},
    }
  },
  {
    path: 'RolePrivConfig/:roleID',
    canMatch: [authGuard],
    resolve: [privilegeResolver],
    loadComponent: () => import('../l12/priv-mgmt/rule-editor/rule-editor.component').then(c => c.RuleEditorComponent),
    data: {
      stateName: 'RolePrivMgm',
      breadcrumb: { name: 'Role Privilege Config', icon: 'fa-solid fa-user-gear', afterBaseOnly: true},
    }
  },
  {
    path: 'NoPrivilege', component: NoPrivilegeComponent,
    data: { breadcrumbItem: { key: 'NoPrivilege', labelName: 'No Privilege', icon: 'fa-solid fa-file-circle-xmark', terminalOnly: true } },
    resolve: { privilege: privilegeResolver }
  },
  // {
  //   path: '**', component: ErrorComponent,
  //   data: { breadcrumbItem: { key: 'PageNotFound', labelName: 'Page Not Found', icon: 'fa-solid fa-file-circle-xmark', terminalOnly: true } },
  //   resolve: { privilege: privilegeResolver }
  // }
]
