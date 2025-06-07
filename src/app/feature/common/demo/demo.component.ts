import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, inject, input } from '@angular/core';
import { LicenseComponent } from '../../acc/license/license.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { SharedModule, onDestroyed } from '../../../shared';
import { ChipsInputComponent, DataTableComponent, InputComponent, SearchBarComponent } from '../../../shared/component';
import { IColumnDef, IDialogConfig } from '../../../core/model';
import { DialogService, EventService } from '../../../shared/service';
import { DialogButtonType, DialogSize, DialogStatus, SearchBarEvent } from '../../../core/enum';
import Chart from 'chart.js/auto';
import _ from 'lodash';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import dayjs from 'dayjs'
import { GridsterComponent, GridsterConfig, GridsterItem, GridsterItemComponent } from 'angular-gridster2';

interface respData {
  id: number,
  name: string,
  email: string,
  group: string,
  note: string
}

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    DataTableComponent,
    ChipsInputComponent,
    InputComponent,
    SearchBarComponent,
    GridsterComponent,
    GridsterItemComponent
  ],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit, AfterViewInit {

  destory$ = onDestroyed();
  eventService = inject(EventService);

  @ViewChild('testTemp') testTemp!: TemplateRef<any>;

  formBuilder = inject(FormBuilder);
  testForm = this.formBuilder.group({
    input1: ['123']
  });

  demoList = [
    { view: 'Table', value: 'Table' },
    { view: 'Dialog', value: 'Dialog' },
    { view: 'Event', value: 'Event' },
    { view: 'i18n', value: 'i18n' },
    { view: 'Icon', value: 'Icon' },
    { view: 'Chart', value: 'Chart' },
    { view: 'Input', value: 'Input' },
    { view: 'Search Bar', value: 'SearchBar' },
    { view: 'Gridster', value: 'Gridster' }
  ];

  optionSelected = this.demoList[0].value;

  coldefs: IColumnDef<respData>[] = [
    { field: 'id', headerName: 'ID' },
    { field: 'name', headerName: 'Name' },
    { field: 'group', headerName: 'Group' },
    { field: 'email', headerName: 'E-mail' },
    { field: 'note', headerName: 'Note' }
  ];

  // tableInfo: ITable<respData> = {
  //   id: '',
  //   columnDefs: this.coldefs,
  //   data: [],
  //   withSelection: true
  // };

  tableID = '';
  data = new Array();
  withSelection = true;
  loading = false

  chart: any = [];

  tt = ['tt', '123', 'group'];
  inputValue = '1231';

  emailFormControl = new FormControl('', [Validators.required]);

  form = this.formBuilder.group({
    chips: [['111', '222']],
    startDate: [''],
    endDate: ['']
  });

  startDate = '';
  endDate = '';
  datatest = new Array();

  privilege = input();

  options: GridsterConfig = {};
  dashboard: Array<GridsterItem> = [];

  constructor(
    private dialogService: DialogService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // this.initChart();
    this.initEvent();
    this.initGridster()
    console.log(this.privilege());
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

  }

  initEvent() {
    this.eventService.event.pipe(this.destory$()).subscribe(event => {
      switch (event.eventName) {
        case SearchBarEvent.StartDateChange:
          this.startDate = dayjs(event.data).format('YYYY/MM/DD');
          break;

        case SearchBarEvent.EndDateChange:
          this.endDate = dayjs(event.data).format('YYYY/MM/DD');
          break;

        case SearchBarEvent.CancelDateChange:
          this.startDate = '';
          this.endDate = '';
          break;

        default:
          break;
      }
    });
  }

  initGridster() {
    console.log('initGridster');
    // this.options = {
    //   gridType: 'fit',
    //   compactType: 'compactUp',
    //   itemChangeCallback: this.itemChange,
    //   itemResizeCallback: this.itemResize,
    //   margin: 10,
    //   outerMargin: true,
    //   outerMarginTop: null,
    //   outerMarginRight: null,
    //   outerMarginBottom: null,
    //   outerMarginLeft: null,
    //   useTransformPositioning: true,
    //   mobileBreakpoint: 640,
    //   minCols: 1,
    //   maxCols: 100,
    //   minRows: 1,
    //   maxRows: 100,
    //   maxItemCols: 100,
    //   minItemCols: 1,
    //   maxItemRows: 100,
    // };

    this.options = {
      gridType: 'fit',
      compactType: 'compactUp',
      // itemChangeCallback: this.itemChange,
      // itemResizeCallback: this.itemResize,
      margin: 10,
      outerMargin: true,
      outerMarginTop: 60,
      outerMarginRight: 60,
      outerMarginBottom: 60,
      outerMarginLeft: 60,
      useTransformPositioning: true,
      mobileBreakpoint: 640,
      minCols: 1,
      maxCols: 100,
      minRows: 1,
      maxRows: 100,
      maxItemCols: 100,
      minItemCols: 1,
      maxItemRows: 100,
    };

    this.dashboard = [
      {cols: 2, rows: 1, y: 0, x: 0},
      {cols: 2, rows: 2, y: 0, x: 2}
    ];
  }

  setTableData(): void {

    this.data = [
      { id: 45227645, name: 'Joe', group: 'group1', email: 'joe777@test.com', note: 'Joe666' },
      { id: 41315785, name: 'Leon', group: 'group2', email: 'Leon77894@test.com', note: '777' },
      { id: 76612755, name: 'Mark', group: 'group3', email: 'Mark6@test.com', note: 'Mark no.1' },
      { id: 12648789, name: 'Terry', group: 'group1', email: 'Terry77979@test.com', note: '77979 Yeee' },
    ];

    // this.tableInfo = _.clone(this.tableInfo);

  }

  pushdata() {


    this.data = _.uniqBy(this.data, 'group');
  }

  switchLoading() {
    this.loading = !this.loading;
  }

  tt2() {
    // this.datatest.push('');
    this.datatest = [];
  }

  clearTableData() {

    this.data = [];
    // this.tableInfo = _.clone(this.tableInfo);

  }

  openComponentDialog() {

    const dialogInfo: IDialogConfig = {
      title: 'Dialog with Component',
      subtitle: 'subtitle',
      matConfig: { id: 'DialogTest', data: 'test2' },
      buttons: [
        { id: 'test', desc: 'test', type: DialogButtonType.General, status: DialogStatus.Danger },
        { id: 'close', desc: 'close', type: DialogButtonType.Close}
      ],
      size: DialogSize.large,
      status: DialogStatus.Primary
    };

    const dialogRef = this.dialogService.open(LicenseComponent, dialogInfo);

  }

  openTemplateDialog() {

    const dialogInfo: IDialogConfig = {
      title: 'Dialog with Template',
      subtitle: '',
      matConfig: { id: 'DialogTest', data: 'Test Template', autoFocus: false },
      buttons: [{ id: 'close', desc: 'close', type: DialogButtonType.Close }],
      size: DialogSize.normal,
      status: DialogStatus.Warning
    };

    const dialogRef = this.dialogService.open(this.testTemp, dialogInfo);

  }

  openStringDialog() {

    const config: IDialogConfig = {
      title: '',
      size: DialogSize.small,
      // buttons: [{ id: 'close', desc: 'close', type: DialogButtonType.Close}],
      status: DialogStatus.Danger
    };

    const dialogRef = this.dialogService.open('test', config);

  }

  initChart() {
    this.chart = new Chart('canvas', {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
    });
  }

  changeSelect() {
    if (this.optionSelected === 'Chart') {
      setTimeout(() => {
        this.initChart();
      }, 500);

    }
  }

  testInput() {
    console.log(this.inputValue);
  }
}
