import { Component } from '@angular/core';
import { ChartBaseComponent } from '../..';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent extends ChartBaseComponent {

  constructor() {
    super();
  }

  override createChart(): void {

  }
}
