import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule, onDestroyed } from '../../../shared';
import { IColumnDef } from '../../../core/model';
import _ from 'lodash';
import { DialogService } from '../../../shared/service';
import { Router } from '@angular/router';
import { DataTableComponent, LocationCardComponent, StatusCardComponent } from '../../../shared/component';

interface testResp {
  id: number,
  name: string,
  email: string,
  group: string,
  note: string
}

@Component({
  selector: 'app-system-overview',
  standalone: true,
  imports: [CommonModule, SharedModule, DataTableComponent, StatusCardComponent, LocationCardComponent],
  templateUrl: './system-overview.component.html',
  styleUrls: ['./system-overview.component.scss']
})
export class SystemOverviewComponent implements OnInit {

  dialogService = inject(DialogService);
  router = inject(Router);

  destory$ = onDestroyed();

  coldefs: IColumnDef<testResp>[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'name', headerName: 'Name' },
    { field: 'group', headerName: 'Group' },
    { field: 'email', headerName: 'E-mail' },
    { field: 'note', headerName: 'Note' }
  ];

  tableID = '';
  data = new Array();

  constructor() { }

  ngOnInit(): void {
  }

  test() {
    this.data = [
      { id: 45227645, name: 'Joe', group: 'group1', email: 'joe777@test.com', note: 'Joe666' },
      { id: 41315785, name: 'Leon', group: 'group2', email: 'Leon77894@test.com', note: '777' },
      { id: 76612755, name: 'Mark', group: 'group3', email: 'Mark6@test.com', note: 'Mark no.1' },
      { id: 12648789, name: 'Terry', group: 'group1', email: 'Terry77979@test.com', note: '77979 Yeee' },
    ];
  }

  test2() {
    this.data = [];
  }

  test3() {
    // this.router.navigateByUrl('/Demo');
    this.router.navigate(['/Demo']);
  }
}
