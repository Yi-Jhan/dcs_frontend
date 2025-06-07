import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared';
import { StateService } from '../../../../shared/service';

@Component({
  selector: 'app-options',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule
  ],
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  viewPrivilege: any = this.stateService.viewPrivilege;
  optMenu = [
    { key: 'NetworkConfig', name: 'Network Configuration', value: 0, cssClass: '', icon: 'fab fa-connectdevelop fa-5x', style:'', routerLink:'/NetworkConfig' }
  ];

  constructor(private stateService: StateService) { }

  ngOnInit(): void {
  }

}
