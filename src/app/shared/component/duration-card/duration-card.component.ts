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
  selector: 'app-duration-card',
  standalone: true,
  imports:[
    CommonModule,
    SharedModule,
    NgxEchartsModule
  ],
  providers: [
    provideEcharts(),
  ],
  templateUrl: './duration-card.component.html',
  styleUrls: ['./duration-card.component.scss']
})
export class DurationCardComponent implements OnInit {
  destroy$ = onDestroyed();
  @Input() id = 'durationCard';

  durationData = new Array<any>();
  initialOption: EChartsOption = {};
  option: EChartsOption = {};
  top5 = new Array();
  orderSelection = new SelectionModel<any>(false, []);
  sortDirection: 'desc'|'asc' = 'desc';
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
          this.durationData = event.data;
          this.setChartData();
          break;

        case CardEvent.ChangeCardFilter:
          if(event.id === 'overview') {
            this.orderSelection.deselect(event.data);
          }
      }
    });

    this.theme$.pipe(this.destroy$()).subscribe(themeMode => {
      this.setChartData();
    });
  }

  setChartData(): void {
    this.top5 = _
      .chain(this.durationData)
      .filter(item => item.orderNo)
      .orderBy(item => item.duration, this.sortDirection)
      .take(5)
      .reverse()
      .value();

    const yAxisData = new Array<string>();
    const xAxisData = new Array<any>();

    _.each(this.top5, item => {
      yAxisData.push(item.orderNo);
      xAxisData.push({
        value: item.durationMinute,
        itemStyle: {
          color: this.getBarColor(item.status)
        }
      });
    });

    this.option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (data: any) => {
          if(data[0].value) {
            const format = '<div>' + data[0].name + '</div>' + data[0].marker;
            const day = Math.floor(data[0].value / 60 / 24);
            const hour = Math.floor(data[0].value / 60 % 24);
            const min = Math.floor(data[0].value % 60);
            const value = day + 'd:' + hour + 'h:' + min + 'm';

            return format + '<strong> ' + value + ' </strong>';
          }
          return '';
        }
      },
      grid: {
        top: '8%',
        left: '2%',
        right: '6%',
        bottom: '2%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: yAxisData
      },
      series: [
        {
          type: 'bar',
          data: xAxisData,
          barMaxWidth: 100
        }
      ]
    };
  }

  getBarColor(status: string): string {
    let color = this.stateService.theme() === 'theme-dark' ? '#6c757d' : '#ced4da';
    switch(status) {
      case 'Processing':
        color = this.stateService.theme() === 'theme-dark' ? '#0070cc' : '#5eb5f9';
        break;

      case 'Pass':
        color = this.stateService.theme() === 'theme-dark' ? '#1eb770' : '#3cc988';
        break;

      case 'Fail':
        color = this.stateService.theme() === 'theme-dark' ? '#f14141' : '#ff5555';
        break;
    }
    return color;
  }

  onChartEvent(event: any): void {
    this.orderSelection.toggle(event.name);

    this.eventService.emit({
      id: this.id,
      eventName: CardEvent.ChangeCardFilter,
      data: this.orderSelection.selected
    });
  }

  sort(): void {
    this.sortDirection = (this.sortDirection === 'desc') ? 'asc' : 'desc';
    this.setChartData();
  }
}
