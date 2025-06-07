import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chart-base',
  standalone: true,
  imports: [],
  templateUrl: './chart-base.component.html',
  styleUrl: './chart-base.component.scss'
})
export class ChartBaseComponent implements OnInit {

  ngOnInit(): void { }

  createChart(): void { }

}
