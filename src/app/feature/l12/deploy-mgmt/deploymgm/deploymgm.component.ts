import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import _ from 'lodash';
import { SharedModule } from '../../../../shared';
import { StateService } from '../../../../shared/service';

@Component({
  selector: 'app-deploymgm',
  standalone: true,
  imports:[
    CommonModule,
    SharedModule
  ],
  templateUrl: './deploymgm.component.html',
  styleUrls: ['./deploymgm.component.scss']
})
export class DeploymgmComponent implements OnInit {
  viewPrivilege: any = this.stateService.viewPrivilege;
  showAddWorkOrder = false;;
  menu = [
    { key: 'AddWorkOrder', name: 'AddWorkOrder', value: 0, cssClass: '', icon: 'fas fa-clipboard-list fa-5x', style:'', routerLink:'/AddWorkOrder' },
  ];
  menu2 = [
    { key: 'ToolPool', name: 'ToolPool', value: 0, cssClass: '', icon: 'fas fa-tools fa-5x', style:'', routerLink:'/ToolPool' },
    { key: 'ProcessProfile', name: 'ProcessProfile', value: 0, cssClass: '', icon: 'fas fa-tasks fa-5x', style:'', routerLink:'/ProcessProfile' }
  ];
  constructor(
    private stateService: StateService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // _.each(this.activatedRoute.snapshot.data['privilege'].privilegeDefine, item => { this.showAddWorkOrder = item; });
  }

}
