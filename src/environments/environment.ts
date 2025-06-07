import { Service } from "../app/core/enum";
import { accRoutes } from "../app/feature/acc/acc.routing";
import { l12Routes } from "../app/feature/l12/l12.routing";

export const environment = {
  service: Service.ACC,
  routes: [
    ...accRoutes,
    ...l12Routes
  ],
  title:'ASUS Control Center',
  rootURL: '/dcs-backend/api'
};
