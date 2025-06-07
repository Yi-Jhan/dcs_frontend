import { Service } from "../app/core/enum";
import { l12Routes } from "../app/feature/l12/l12.routing";

export const environment = {
  service: Service.L12,
  routes: l12Routes,
  title:'L12 Management Center',
  rootURL: '/dcs-backend/api'
};
