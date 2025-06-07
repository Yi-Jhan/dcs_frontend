import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import _ from 'lodash';
import { onDestroyed } from '../../common-lib';
import { EventService, StateService } from '../../service';
import { CardEvent, TableEvent } from '../../../core/enum';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared.module';
import { NgxEchartsModule, provideEcharts } from 'ngx-echarts';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-location-card',
  standalone: true,
  imports:[
    CommonModule,
    SharedModule,
    NgxEchartsModule
  ],
  providers: [
    provideEcharts(),
  ],
  templateUrl: './location-card.component.html',
  styleUrls: ['./location-card.component.scss']
})
export class LocationCardComponent implements OnInit {
  destroy$ = onDestroyed();
  @Input() id = 'locationCard';

  locationData = new Array<any>();
  locations = new Array<string>();
  locationSelection = new SelectionModel<any>(false, []);
  created = new Array<any>();
  processing = new Array<any>();
  pass = new Array<any>();
  fail  = new Array<any>();
  initialOption: EChartsOption = {};
  option: EChartsOption = {};
  theme$ = toObservable(this.stateService.theme);

  constructor(
    private eventService: EventService,
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.initEvent();
  }

  initEvent(): void {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      switch(event.eventName) {
        case TableEvent.UpdateTableData:
          this.locations = _
            .chain(event.data)
            .filter(item => {
              return item.edgeGateway;
            })
            .uniqBy('edgeGateway')
            .map('edgeGateway')
            .value();
          this.locationData = event.data;
          this.setChartOptions();
          break;

        case CardEvent.ChangeCardFilter:
          if(event.id === 'overview') {
            this.locationSelection.deselect(event.data);
          }
      }
    });

    // this.stateService.themeMode$.pipe(this.destroy$()).subscribe(themeMode => {
    //     this.setChartOptions();
    // });
    this.theme$.pipe(this.destroy$()).subscribe(themeMode => {
        this.setChartOptions();
    });
  }

  setChartOptions(): void {
    this.created = new Array<any>();
    this.processing = new Array<any>();
    this.pass = new Array<any>();
    this.fail = new Array<any>();

    for (let i = 0; i < this.locations.length; i++) {
      this.created.push({
        value: 0,
        itemStyle: { color: this.stateService.theme() === 'theme-dark' ? '#6c757d' : '#ced4da' }
      });
      this.processing.push({
        value: 0,
        itemStyle: { color: this.stateService.theme() === 'theme-dark' ? '#0070cc' : '#5eb5f9' }
      });
      this.pass.push({
        value: 0,
        itemStyle: { color: this.stateService.theme() === 'theme-dark' ? '#1eb770' : '#3cc988' }
      });
      this.fail.push({
        value: 0,
        itemStyle: { color: this.stateService.theme() === 'theme-dark' ? '#f14141' : '#ff5555' }
      });
    }

    _.each(this.locations, (edgeGateway, index) => {
      _.each(this.locationData, item => {
        if(item.edgeGateway === edgeGateway) {
          switch(item.orderStatus) {
            case 'Created':
              this.created[index].value++;
              break;
            case 'Processing':
              this.processing[index].value++;
              break;
            case 'Pass':
              this.pass[index].value++;
              break;
            case 'Fail':
              this.fail[index].value++;
              break;
          }
        }
      });
    });

    this.option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
        }
      },
      grid: {
        top: '8%',
        left: '3%',
        right: '4%',
        bottom: '0%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.locations
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
      series: [
        {
          name: 'Create',
          type: 'bar',
          stack: 'total',
          data: this.created,
          barMaxWidth: 100
        },
        {
          name: 'Processing',
          type: 'bar',
          stack: 'total',
          data: this.processing,
          barMaxWidth: 100
        },
        {
          name: 'Pass',
          type: 'bar',
          stack: 'total',
          data: this.pass,
          barMaxWidth: 100
        },
        {
          name: 'Fail',
          type: 'bar',
          stack: 'total',
          data: this.fail,
          barMaxWidth: 100
        }
      ]
    };
  }

  onChartEvent(event: any): void {
    this.locationSelection.toggle(event.name);
    this.eventService.emit({
      id: this.id,
      eventName: CardEvent.ChangeCardFilter,
      data: this.locationSelection.selected
    });
  }
}
