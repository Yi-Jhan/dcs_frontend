import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IBreadcrumbItem, IPathParams } from '../../../core/model';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  breadcrumbKey = 'breadcrumb';
  stateNameKey = 'stateName';

  refreshBreadcrumbs(breadcrumbList: Array<IBreadcrumbItem>, route: ActivatedRoute, pathParams: IPathParams = { path: '', pathParamList: []}): void {
    // Recursively find the child route with breadcrumbItem object.
    let child: ActivatedRoute;
    if (route.firstChild) {
        child = route.firstChild;
    }
    else {
        return;
    }

    // If the route doesn't have specified breadcrumbItem, add possible parent url, and recursive to its child.
    if (!child.snapshot.data.hasOwnProperty(this.breadcrumbKey)) {
      // Take URL parts from parents.
      pathParams = this.getPathAndParams(child, pathParams);
      // Recursive call.
      this.refreshBreadcrumbs(breadcrumbList, child, pathParams);
      return;
    }

    if (breadcrumbList.length > 0) {
      if (child.snapshot.data[this.breadcrumbKey].afterBaseOnly) {
        // Reset breadcrumbs.
        breadcrumbList.length = 0;
      }
      else {
        // Find breadcrumb key and index.
        const bcKey: string = child.snapshot.data[this.stateNameKey];
        const bcIndex: number = this.getBreadcrumbPositionByKey(breadcrumbList, bcKey);

        if (bcIndex >= 0) {
          // Remove the breadcrumb trailing items.
          // Also remove the same item if already exists to handling hierarchical issue for URL segment parameter.
          breadcrumbList.splice(bcIndex);
        }

        // Remove existing breadcrumb of route for terminalOnly which should not be displayed, and
        // no navigation action on breadcrumb for the terminalOnly route.
        if (breadcrumbList.length > 0 && breadcrumbList[breadcrumbList.length - 1].terminalOnly) {
          breadcrumbList.length = breadcrumbList.length - 1;
        }
      }
    }

    // Add URL parts for this route with breadcrumb item.
    pathParams = this.getPathAndParams(child, pathParams);
    // Set breadcrumb item object.
    const routeData = child.snapshot.data[this.breadcrumbKey];
    const breadcrumbItem: IBreadcrumbItem = {
      key: child.snapshot.data[this.stateNameKey],
      name: routeData.name,
      icon: routeData.icon,
      path: pathParams.path,
      terminalOnly: routeData.terminalOnly || false,
      afterBaseOnly: routeData.afterBaseOnly || false,
      pathParamList: pathParams.pathParamList,
      queryParams: pathParams.queryParams,
      fragment: pathParams.fragment
    };

    // Add item to breadcrumb list.
    breadcrumbList.push(breadcrumbItem);
    // Recursive call.
    this.refreshBreadcrumbs(breadcrumbList, child, pathParams);
    return;
  }

  getPathAndParams(route: ActivatedRoute, pathParams: IPathParams): IPathParams {
    let thisPath = '';

    // Url param '/:id' is a segment.path.
    const snapshot = route.snapshot;
    thisPath = snapshot.url.map(segment => segment.path).join('/');
    if (thisPath !== '') {
      // Process matrix params.
      // Format of pathParamList: ['path', {param data}, 'path', {param data}].
      const matrixParams: any = snapshot.url.map(segment => segment.parameters);
      if (matrixParams.length > 0 && Object.getOwnPropertyNames(matrixParams[0]).length > 0) {
        pathParams.pathParamList!.push(thisPath);
        const params: any = {};
        for (const item of matrixParams) {
          for (const prop of Object.keys(item)) {
            params[prop] = item[prop];
          }
        }
        pathParams.pathParamList!.push(params);
      }

      // Get query params if any - always for the last segment.
      if (snapshot.queryParamMap.keys.length > 0) {
        pathParams.queryParams = {};
        for (const key of snapshot.queryParamMap.keys) {
          pathParams.queryParams[key] = snapshot.queryParamMap.get(key);
        }
      }

      // Get fragment if any - always for the last segment.
      if (snapshot.fragment) {
        route.fragment.subscribe(value => {
          if(value) { pathParams.fragment = value; }
        });
      }

      pathParams.path += `/${thisPath}`;
    }
    return pathParams;
  }

  getBreadcrumbPositionByKey(breadcrumbList: Array<IBreadcrumbItem>, key: string): number {
    let rtnIndex = -1;
    _.forEachRight(breadcrumbList, (item, index) => {
      if (item.key === key) {
        rtnIndex = index;
        return false;
      }
      return;
    });

    return rtnIndex;
  }
}
