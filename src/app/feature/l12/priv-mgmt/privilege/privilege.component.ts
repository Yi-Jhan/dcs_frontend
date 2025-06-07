import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared';
import { StateService } from '../../../../shared/service';

@Component({
  selector: 'app-privilege',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule
  ],
  templateUrl: './privilege.component.html',
  styleUrls: ['./privilege.component.scss']
})
export class PrivilegeComponent implements OnInit {
  viewPrivilege: any = this.stateService.viewPrivilege;
  accountMenu = [
    { stateName: 'AccountMgm', title: 'AccountMgm', icon: 'fa-solid fa-user', routerLink: '/AccountMgm' }
  ];
  roleMenu = [
    { stateName: 'RolePrivMgm', title: 'RolePrivMgm', icon: 'fa-solid fa-user', routerLink: '/RolePrivMgm' }
  ];

  constructor(private stateService: StateService) { }

  ngOnInit(): void {
  }

}
