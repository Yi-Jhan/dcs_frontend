import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject } from "@angular/core"
import { BaseURL, AccountAPI, AuthAPI, DeviceAPI, ObjectAPI, OverviewAPI, ProfileAPI, RoleAPI, ToolAPI, WorkOrderAPI } from "../core/enum";

export const accountAPI = () => {
  const http = inject(HttpClient);

  return {

    getAccount: () => {
      return http.get<any>(`${BaseURL}${AccountAPI.Account}`);
    },

    createAccount: (data: any) => {
      return http.post<any>(`${BaseURL}${AccountAPI.Account}`, data);
    },

    updateAccount: (id: any, data: any) => {
      return http.put<any>(`${BaseURL}${AccountAPI.Account}/${id}`, data);
    },

    deleteAccount: (id: any) => {
      return http.delete<any>(`${BaseURL}${AccountAPI.Account}/${id}`);
    }

  };
}

export const authAPI = () =>  {
  const http = inject(HttpClient);

  return {

    login: (username: string, password: string) => {
      return http.post<any>(`${BaseURL}${AuthAPI.Auth}`, { username, password });
    },

    getUserInfo: (token: string) => {
      return http.post<any>(`${BaseURL}${AuthAPI.Parse}`, { token });
    },

    enableMFA: (username: string, enable2FA: string) => {
      return http.post<any>(`${BaseURL}${AuthAPI.Enable2FA}`, { username, enable2FA });
    },

    verify: (code: string, username: string) => {
      return http.post<any>(`${BaseURL}${AuthAPI.Verify}`, { code, username });
    },

    signinverify: (code: string, username: string) => {
      return http.post<any>(`${BaseURL}${AuthAPI.Signinverify}`, { code ,username });
    }

  };
}

export const deviceAPI = () => {
  const http = inject(HttpClient);

  return {

    getDeviceInfo: (sn: string, node: number) => {
      return http.post<any>(`${BaseURL}${DeviceAPI.Device}`, { serialNumber: sn, nodeNumber: node });
    },

    getDeviceProfile: (sn: string, node: string) => {
      let queryParams = new HttpParams();
      queryParams = queryParams.append("serialNumber", sn).append("node", node);
      return http.get<any>(`${BaseURL}${DeviceAPI.Profile}`, { params: queryParams });
    },

    getDeviceStatus: (orderNo:any) => {
      return http.get<any>(`${BaseURL}${DeviceAPI.Status}?orderNo=${orderNo}`);
    }

  };
}

export const objectAPI = () => {
  const http = inject(HttpClient);

  return {

    createObject: (uploadfile: any, uploadfield: any) => {
      const formData = new FormData();
      formData.append('uploadfile', uploadfile);
      formData.append('folder', uploadfield);
      const headers = new HttpHeaders({ 'enctype': 'multipart/form-data' });
      return http.post<any>(`${BaseURL}${ObjectAPI.PutObject}`, formData, { headers: headers, reportProgress: true, observe: 'events' });
    },

    deleteObject: (folder: any, uploadfield: any) => {
      var body = { folder, objectName: uploadfield };
      return http.delete<any>(`${BaseURL}${ObjectAPI.Object}`, { body });
    },

    getObject: (folder: any, object: any) => {
      var body = { folder, objectName: object };
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', }), responseType: 'text' as 'json' };
      return http.post<any>(`${BaseURL}${ObjectAPI.GetObject}`, body, httpOptions);
    }

  };
}

export const overviewAPI = () => {
  const http = inject(HttpClient);

  return {

    getOverviewList: () => {
      return http.get<any>(`${BaseURL}${OverviewAPI.Overview}`);
    }

  };
}

export const profileAPI = () => {
  const http = inject(HttpClient);

  return {

    getProfile: (id?: any) => {
      var profileid = (id === undefined) ? '' : `/${id}`;
      return http.get<any>(`${BaseURL}${ProfileAPI.profile}${profileid}`);
    },

    createProfile: (profile: any) => {
      return http.post<any>(`${BaseURL}${ProfileAPI.profile}`, profile);
    },

    deleteProfile: (id: any) => {
      return http.delete<any>(`${BaseURL}${ProfileAPI.profile}/${id}`);
    },

    updateProfile: (profile: any) => {
      return http.put<any>(`${BaseURL}${ProfileAPI.profile}`, profile);
    }

  };
}

export const roleAPI = () => {
  const http = inject(HttpClient);

  return {

    getRoleList: () => {
      return http.get<any>(`${BaseURL}${RoleAPI.Role}`);
    },

    createRole: (info: any) => {
      return http.post<any>(`${BaseURL}${RoleAPI.Role}`, info);
    },

    deleteRole: (roleID: string) => {
      return http.delete<any>(`${BaseURL}${RoleAPI.Role}/${roleID}`);
    },

    updateRole: (roleID: string, info: any) => {
      return http.put<any>(`${BaseURL}${RoleAPI.Role}/${roleID}`, info);
    },

    getRoleTemplate: (roleID: string) => {
      return http.get<any>(`${BaseURL}${RoleAPI.Role}/${roleID}`);
    },

    getPrivilegeByStateName: (stateName: string) => {
      return http.post<any>(`${BaseURL}${RoleAPI.ViewPrivilege}`, { stateName });
    },

    getAllPrivilege: () => {
      return http.get<any>(`${BaseURL}${RoleAPI.ViewAllPrivilege}`);
    }

  };
}

export const toolAPI = () => {
  const http = inject(HttpClient);

  return {

    getTool: (id?: any) => {
      var toolid = (id === undefined) ? '' : `/${id}`;
      return http.get<any>(`${BaseURL}${ToolAPI.Tool}${toolid}`);
    },

    createTool: (tool: any) => {
      return http.post<any>(`${BaseURL}${ToolAPI.Tool}`, tool);
    },

    updateTool: (id: any, tool: any) => {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', }), responseType: 'text' as 'json' };
      return http.put<any>(`${BaseURL}${ToolAPI.Tool}/${id}`, tool, httpOptions);
    },

    deleteTool: (id: any) => {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', }), responseType: 'text' as 'json' };
      return http.delete<any>(`${BaseURL}${ToolAPI.Tool}/${id}`, httpOptions);
    }

  };
}

export const workOrderAPI = () => {
  const http = inject(HttpClient);

  return {

    getFactories: () => {
      return http.get<any>(`${BaseURL}${WorkOrderAPI.Factories}`);
    },

    getWorkOrderData: (orderNo: any) => {
      return http.get<any>(`${BaseURL}${WorkOrderAPI.WorkOrder}/${orderNo}`);
    },

    createWorkOrder: (orderData: any) => {
      return http.post<any>(`${BaseURL}${WorkOrderAPI.WorkOrder}`, orderData);
    },

    updateWorkOrder: (orderData: any) => {
      return http.put<any>(`${BaseURL}${WorkOrderAPI.WorkOrder}`, orderData);
    },

    runWorkOrder: (orderNo: any) => {
      return http.post<any>(`${BaseURL}${WorkOrderAPI.Run}`, orderNo);
    },

    deleteWorkOrder: (orderNo: any) => {
      return http.delete<any>(`${BaseURL}${WorkOrderAPI.WorkOrder}`, { body: { orderNo } });
    }

  };
}
