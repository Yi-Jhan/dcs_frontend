import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationExtras, NavigationStart, Router } from '@angular/router';
import { BreadcrumbService } from './breadcrumb.service';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared.module';
import { onDestroyed } from '../../common-lib';
import { IBreadcrumbItem } from '../../../core/model';
import { EventService, StateService } from '../../service';
import { BreadcrumbEvent } from '../../../core/enum';
import _ from 'lodash';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit{
  destroy$ = onDestroyed();
  navState: any = {};
  breadcrumbList = new Array<IBreadcrumbItem>();
  breadcrumbHistoryList = new Array<any>();

  constructor(
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private activatedRoute: ActivatedRoute,
    private eventService: EventService,
    private statusService: StateService
  ) {}

  ngOnInit(): void {
    this.initEvent();
  }

  initEvent(): void {
    // For handle browser back/forward/history scenarios.
    this.router.events
      .pipe(filter(value => value instanceof NavigationStart), this.destroy$())
      .subscribe((value: any) => {
        this.navState = {
          id: value.id,
          navigationTrigger: value.navigationTrigger,
          restoredState: value.restoredState
        };
      });

    this.router.events
      .pipe(filter(value => value instanceof NavigationEnd), this.destroy$())
      .subscribe((value: any) => {
        // Restore history list after browser refresh.
        const breadcrumbHistoryCached = sessionStorage.getItem('breadcrumbHistoryList');
        if (this.breadcrumbHistoryList.length < 1 && breadcrumbHistoryCached) {
          this.breadcrumbHistoryList = JSON.parse(breadcrumbHistoryCached);
        }

        // Browser back/forward/history.
        if (this.navState.navigationTrigger === 'popstate' && this.navState.restoredState !== null) {
          this.findHistoryBreadcrumb(value.urlAfterRedirects);
        }
        // Imperetive action.
        else {
          const rootRoute: ActivatedRoute = this.activatedRoute.root;

          // Check and get cached breadcrumbList. / Get cached breadcrumbList when browser refresh.
          const breadcrumbCached = sessionStorage.getItem('breadcrumbList');
          if (this.breadcrumbList.length < 1 && breadcrumbCached) {
            this.breadcrumbList = JSON.parse(breadcrumbCached);
          }

          // Any primary route side-menu action will reset breadcrumbs.
          if (this.statusService.menuAction()) {
            this.statusService.menuAction.set(false);
            this.breadcrumbList.length = 0;
          }

          // Refresh breadcrumb items.
          this.breadcrumbService.refreshBreadcrumbs(this.breadcrumbList, rootRoute);
        }

        // Save breadcrumbList to session object after every breadcrumb update for browser refreshing action.
        sessionStorage.setItem('breadcrumbList', JSON.stringify(this.breadcrumbList));

        // Save history item for browser back/forward.
        this.updateBreadcrumbHistory(value.urlAfterRedirects);

        // Save to sessionStorage for browser refresh.
        sessionStorage.setItem('breadcrumbHistoryList', JSON.stringify(this.breadcrumbHistoryList));
      });

    this.eventService.event.pipe(this.destroy$()).subscribe((event: any) => {
      //Update breadcrumb label with data sent from event service.
      //Event Data format: {key: 'string', labelName: 'string'}
        if(event.eventName === BreadcrumbEvent.LabelOverwrite) {
          const len = this.breadcrumbList.length;
          for (let i = len - 1; i >= 0; i--) {
            if (this.breadcrumbList[i].key == event.data['key']) {
                this.breadcrumbList[i].name = event.data['name'];
                break;
            }
          }
        }
      });
  }

  findHistoryBreadcrumb(urlAfterRedirects: string) {
    const len = this.breadcrumbHistoryList.length;
    for (let idx = len - 1; idx >= 0; idx--) {
      let item = this.breadcrumbHistoryList[idx];
      if (item.id == this.navState.restoredState.navigationId && item.url == urlAfterRedirects) {
        this.breadcrumbList = item.breadcrumbList;
        break;
      }
    }
  }

  updateBreadcrumbHistory(urlAfterRedirects: string) {
    const bcHistoryItem = {
      id: this.navState.id,
      url: urlAfterRedirects,
      breadcrumbList: _.cloneDeep(this.breadcrumbList)
    };
    this.breadcrumbHistoryList.push(bcHistoryItem);
  }

  openPageWithBreadcrumb(index: number): void {
    // Check and get queryParams and fragment.
    const breadcrumbItem = this.breadcrumbList[index];
    let navigationExtras: NavigationExtras = {};
    if (breadcrumbItem.queryParams) {
      navigationExtras.queryParams = breadcrumbItem.queryParams
    }

    if (breadcrumbItem.fragment) {
      navigationExtras.fragment = breadcrumbItem.fragment;
    }

    // check and get matrix params.
    const hasKey = Object.keys(navigationExtras).length > 1;
    const bcPathParamList = breadcrumbItem.pathParamList;
    if (bcPathParamList && bcPathParamList.length > 0) {
      // Ignore the pathParamList and do general path if object contains 'ignoreParam'.
      // if (bcPathParamList.find(x => x.ignoreParam)) {
      //   this.router.navigate([breadcrumbItem.path], hasKey ? navigationExtras : undefined);
      // }
      // else {
        this.router.navigate(bcPathParamList, hasKey ? navigationExtras : undefined);
      // }
    }
    // Do general path.
    else {
      this.router.navigate([breadcrumbItem.path], hasKey ? navigationExtras : undefined );
    }
  }
}
