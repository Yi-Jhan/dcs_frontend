import { Component, input } from '@angular/core';
import { GridsterComponent, GridsterConfig, GridsterItemComponent } from 'angular-gridster2';

@Component({
  selector: 'app-widget-container',
  standalone: true,
  imports: [
    GridsterComponent,
    GridsterItemComponent
  ],
  templateUrl: './widget-container.component.html',
  styleUrl: './widget-container.component.scss'
})
export class WidgetContainerComponent {

  options = input.required<GridsterConfig>();
  dashboard = input.required<GridsterItemComponent[]>();

}
