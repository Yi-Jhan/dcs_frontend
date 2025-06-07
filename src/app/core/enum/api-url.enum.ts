import { environment } from "../../../environments/environment";

export const RootURL = '/dcs-backend/api';
export const BaseURL = '/dcs-backend/api';

export enum AuthAPI {
  Auth = '/auth',
  Enable2FA = '/enable2FA',
  Verify = '/verify',
  Parse = '/parse',
  Signinverify = '/signinverify'
}

export enum AccountAPI {
  Account = '/account',
  Info = ''
}

export enum WorkOrderAPI {
  Factories = '/work-order/factories',
  WorkOrder = '/work-order',
  Run = '/work-order/run'
}

export enum ToolAPI {
  Tool = '/tool'
}

export enum ObjectAPI{
  Object = '/object',
  ListObjects = '/object/listObjects',
  PutObject = '/object/putObject',
  GetObject = '/object/getObject'
}

export enum ProfileAPI{
  profile = '/profile'
}

export enum RoleAPI {
  Role = '/role',
  ViewPrivilege = '/role/viewPrivilege',
  ViewAllPrivilege = '/role/viewAllPrivilege'
}

export enum OverviewAPI {
  Overview = '/overview',
}

export enum DeviceAPI {
  Device = '/device',
  Profile = '/profile/device',
  Status = '/device/status'
  // List = '/device/list',
}
