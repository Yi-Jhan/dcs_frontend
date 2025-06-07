export interface IBreadcrumbItem {
  key: string;
  name: string;
  icon: string;
  path: string;
  terminalOnly?: boolean; // 如果該項不是最後一個則刪除
  afterBaseOnly?: boolean; // 清空目前的麵包屑，該項始終保持在第一個
  pathParamList?: Array<any>;
  queryParams?: any;
  fragment?: string;
}

export interface IPathParams {
  path: string;
  pathParamList?: Array<any>;
  queryParams?: any;
  fragment?: string;
}
