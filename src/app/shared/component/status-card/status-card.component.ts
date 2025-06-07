import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, input } from '@angular/core';
import _ from 'lodash';
import { SharedModule, onDestroyed } from '../../../shared';
import { EventService } from '../../../shared/service';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts'
import { MatTooltip } from '@angular/material/tooltip';
import { CardEvent, TableEvent } from '../../../core/enum';

// const overviewList = [
//   {
//     orderNo: 'asus-111',
//     description: 'desc test',
//     orderStatus: 'Created',
//     progress: 0,
//     address: 'Beitou District, Taipei',
//     location: 'TPE',
//     edgeGateway: 'Taipei',
//     duration: '0d:3h:30m',
//     durationMinute: 210,
//     startTime: '2022-10-31T11:14:10.389+00:00',
//     createdAt: '2022-10-17T02:42:49.164+00:00',
//     updatedAt: '2022-10-17T02:42:49.164+00:00'
//   }
// ]

@Component({
  selector: 'app-status-card',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    NgxEchartsDirective,
    MatTooltip
  ],
  templateUrl: './status-card.component.html',
  styleUrls: ['./status-card.component.scss'],
  providers: [
    provideEcharts(),
  ]
})
export class StatusCardComponent implements OnInit {

  destroy$ = onDestroyed();
  id = input('statusCard');

  eventService = inject(EventService);

  statusSelection = 'All';
  displayedCount = 0;
  statusButtons = [
    { key: 'Created', name: 'Created', value: 1, cssClass: 'status-bg-init', icon: 'fa-solid fa-plus', iconAct: 'fa-solid fa-plus fa-flip', style: '--fa-animation-duration: 3s;' },
    { key: 'Processing', name: 'Processing', value: 2, cssClass: 'status-bg-default', icon: 'fa-solid fa-rotate', iconAct: 'fa-solid fa-rotate fa-spin' },
    { key: 'Pass', name: 'Pass', value: 3, cssClass: 'status-bg-success', icon: 'fa-solid fa-check', iconAct: 'fa-solid fa-check', style: 'animation: glowing 1.5s ease-in-out infinite alternate;' },
    { key: 'Fail', name: 'Fail', value: 4, cssClass: 'status-bg-danger', icon: 'fa-solid fa-xmark', iconAct: 'fa-solid fa-xmark fa-beat-fade' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.initEvent();
  }

  initEvent(): void {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      switch(event.eventName) {
        case TableEvent.UpdateTableData:
          this.clearStatusCount();
          this.findSelectedAndCalCount(event.data);
          break;

        case CardEvent.ChangeCardFilter:
          if(event.id === 'overview' && !event.data) {
            this.statusSelection = 'All';
          }
      }
    });
  }

  onClickStatusButton(button: any) {
    if(button.value> 0){
      const name = _.find(this.statusButtons, { key: button.key })!.name;
      if(this.statusSelection === name) {
        this.statusSelection = 'All';
        this.eventService.emit({
          id: this.id(),
          eventName: CardEvent.ChangeCardFilter,
          data: ''
        });
      }
      else if(this.statusSelection === 'All') {
        this.statusSelection = name;
        this.eventService.emit({
          id: this.id(),
          eventName: CardEvent.ChangeCardFilter,
          data: button.key
        });
      }
    }
  }

  calPercent(value : number, total: number) : string {
    let result: string = "";
    result = (Math.round((value *100/ total) * Math.pow(10, 2)) / Math.pow(10, 2)).toString() + "%";
    return result;
  }

  clearStatusCount() {
    this.displayedCount = 0;
    _.each(this.statusButtons, button => {
      button.value = 0;
    })
  }

  findSelectedAndCalCount(data: Array<any>): void {
    _
      .chain(data)
      .filter(item => item.orderStatus)
      .each(item => {
        this.displayedCount++;
        const index = _.findIndex(this.statusButtons, button => {
          return button.key === item.orderStatus;
        });

        if(index >= 0) {
          this.statusButtons[index].value++;
        }
      })
      // .map('status')
      // .uniq()
      .value();
  }
}
