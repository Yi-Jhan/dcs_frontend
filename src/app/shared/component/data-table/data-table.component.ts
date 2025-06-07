import { CommonModule } from '@angular/common';
import { Component, SimpleChanges, inject, input, model } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { TableVirtualScrollDataSource, TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { CellRenderDirective } from './cell-render.directive';
import { CssHeightPipe } from '../../pipe';
import { onDestroyed } from '../../common-lib';
import { EventService } from '../../service';
import { IColumnDef } from '../../../core/model';
import { SelectionModel } from '@angular/cdk/collections';
import { SortDirection } from '@angular/material/sort';
import { TableEvent } from '../../../core/enum';
import _ from 'lodash';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { DataTableService, Group } from './data-table.service';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TableVirtualScrollModule,
    CellRenderDirective,
    CssHeightPipe,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {
  destroy$ = onDestroyed();
  tableService = inject(DataTableService);
  eventService = inject(EventService);

  // Signal Input
  id =                    input.required<string>();
  columnDefs =            model.required<Array<IColumnDef<any>>>();
  data =                  model.required<Array<any>>();
  groupByColumns =        model<Array<string>>([]);
  filters =               input<Array<string>>([]);
  height =                input<number | string>('350px');
  isLoading =             input<boolean>(false);
  clickRowSelected =      input<boolean>(false);
  showNoDataMessage =     input<boolean>(true);
  columnsPanel =          input<boolean>(true);
  columnPanelExpanded =   model<boolean>(false);
  withSelection =         model<boolean>(false);
  noDataMessage =         input<string>('i18n_NoData');

  allData = new Array<any>();
  columnsDisplay = new Array<string>();
  dataSource = new TableVirtualScrollDataSource<any>([]);
  rowSelection = new SelectionModel<any>(true, []);
  moveInGroupContent = false;
  sortActive = '';
  sortDirection: SortDirection = '';

  constructor() { }

  ngOnInit(): void {
    this.initEvent();
    this.tableService.setFilterPredicate(this.dataSource);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      console.log(changes);
      this.initData();

      // this.sortActive = '';
      // this.sortDirection = '';
      this.checkGroupByColumns();
      this.updateDataSource();
      this.tableService.tableEventHandler(this.id(), TableEvent.UpdateTableData, this.dataSource.filteredData);
      this.tableService.tableEventHandler(this.id(), TableEvent.ColumnVisible, { data: this.dataSource.filteredData, columns: this.columnDefs() });
    }

    if (changes['filters']) {
      this.tableService.preFilter(this.dataSource.data, this.filters());
      this.dataSource.filter = '__tableFilter'; // trigger filter
      this.tableService.tableEventHandler(this.id(), TableEvent.UpdateTableData, this.dataSource.filteredData);
      this.tableService.tableEventHandler(this.id(), TableEvent.ColumnVisible, { data: this.dataSource.filteredData, columns: this.columnDefs() });
    }

  }

  initData(): void {
    this.rowSelection.clear();
    _.each(this.data(), (item, index) => {
      item.__tableFilter = true;
      item.__rowID = item.__rowID ?? index;
      item.__rowSelected = item.__rowSelected ?? false;
      if (item.__rowSelected) {
        this.rowSelection.select(item.__rowID);
      }
    });

    this.columnDefs.set(_.map(this.columnDefs(), def => {
      def.visible = def.visible ?? true;
      return def;
    }));

    this.columnsDisplay = _.map(_.filter(this.columnDefs(), def => def.visible), 'field');
    if (this.withSelection()) {
      this.columnsDisplay = _.concat('select', this.columnsDisplay);
    }
  }

  initEvent(): void {
    this.eventService.event.pipe(this.destroy$()).subscribe((event: any) => {
      if (event.id === this.id()) {
        switch(event.eventName) {
          case TableEvent.SelectToggleRequest:
            _.each(this.dataSource.data, item => {
              if (item.__rowID === event.data.__rowID) {
                item.__rowSelected = event.data.checked;
                if (event.data.checked) {
                  if (!this.rowSelection.isSelected(item.__rowID)) {
                    this.rowSelection.select(item.__rowID);
                  }
                }
                else {
                  this.rowSelection.deselect(item.__rowID);
                }

                return false;
              }
              return true;
            });
            break;
        }
      }
    });
  }

  updateDataSource(): void {
    this.allData = _.cloneDeep(this.data());
    this.checkSelection();

    if (this.sortActive && this.sortDirection) {
      const type = _.find(this.columnDefs(), item => { return item.field === this.sortActive})?.cellType;
      this.allData = this.tableService.sortData(this.allData, this.sortActive, this.sortDirection, type);
    }
    this.dataSource.data = this.tableService.addGroup(this.allData, this.groupByColumns());
    this.tableService.preFilter(this.dataSource.data, this.filters());
    this.dataSource.filter = '__tableFilter'; // trigger filter
  }

  checkGroupByColumns() {
    const result = _.chain(this.columnDefs())
      .map('field')
      .intersection(this.groupByColumns())
      .value();

    this.groupByColumns.set(result);
  }

  checkSelection() {
    _.each(this.allData, item => {
      item.__rowSelected = this.rowSelection.isSelected(item.__rowID);
    });
  }

  isGroup(index: number, item: any): boolean {
    return item.groupLevel;
  }

  getGroupName(field: string): string {
    const groupName = _.find(this.columnDefs(), colDef => {
      return colDef.field === field
    })?.headerName;

    return groupName ?? '';
  }

  clickGroupHeader(row: Group): void {
    row.expanded = !row.expanded;
    this.dataSource.filter = '__tableFilter'; // trigger filter
  }

  onRowClicked(row: any): void {
    if (this.withSelection() && this.clickRowSelected() && !(row instanceof Group)) {
      this.changeSelect({ checked: !row.__rowSelected }, row);
    }
    this.tableService.tableEventHandler(this.id(), TableEvent.RowClicked, row);
  }

  unGroupByColumn(field: string) {
    _.remove(this.groupByColumns(), column => {
      return column === field;
    })
    this.updateDataSource();
  }

  isRowAllSelected(): boolean {
    return _.every(this.dataSource.data, item => {
      if (!(item instanceof Group)) {
        return item.__rowSelected;
      }
      return true;
    });
  }

  masterToggle() {
    if (this.isRowAllSelected()) {
      _.each(this.dataSource.data, item => {
        if (!(item instanceof Group) && item.__rowSelected) {
          item.__rowSelected = false;
        }
      });
      this.rowSelection.clear();
    }
    else {
      _.each(this.dataSource.data, item => {
        if (!(item instanceof Group) && !item.__rowSelected) {
          this.rowSelection.select(item.__rowID);
          item.__rowSelected = true;
        }
      });
    }
  }

  changeSelect(event: any, row: any): void {
    if (event) {
      this.rowSelection.toggle(row.__rowID);
      row.__rowSelected = event.checked;

      this.tableService.tableEventHandler(
        this.id(),
        TableEvent.RowSelectToggle,
        row
      );
    }
  }

  changeMasterSelect(event: any): void {
    if (event) {
      this.masterToggle();
      this.tableService.tableEventHandler(
        this.id(),
        TableEvent.MasterToggle,
        event.checked
      );
    }
  }

  updateColumnsDisplay(): void {
    const _temp = this.withSelection() ? ['select'] : [];
    _.each(this.columnDefs(), col => {
      if (col.visible) {
        _temp.push(col.field);
      }
    });
    this.columnsDisplay = _temp;
    this.tableService.tableEventHandler(this.id(), TableEvent.ColumnVisible, { data: this.dataSource.filteredData, columns: this.columnDefs() });
  }

  // updateColumns(): void {
  //   this.columns = _
  //     .chain(this.columnsDisplay)
  //     .map(field => _.find(this.columns, col => col.field===field))
  //     .compact()
  //     .concat(_.filter(this.columns, item => !item.checked))
  //     .value();
  // }

  removeColumn(field: string): void {
    _.remove(this.columnsDisplay, item => item === field);

    this.tableService.tableEventHandler(this.id(), TableEvent.ColumnVisible, { data: this.dataSource.filteredData, columns: this.columnDefs() });
  }

  // dropHeader(event: CdkDragDrop<string[]>): void {
  //   let fromIndex = event.previousIndex;
  //   let toIndex = event.currentIndex;
  //   if (fromIndex !== toIndex) {
  //     if (this.tableInfo.withSelection) {
  //       moveItemInArray(this.columnsDisplay, ++fromIndex, ++toIndex);
  //     }
  //     else {
  //       moveItemInArray(this.columnsDisplay, fromIndex, toIndex);
  //     }
  //     this.updateColumns();
  //   }
  // }

  dropColumsItem(event: any): void {
    const fromIndex = event.previousIndex;
    const toIndex = event.currentIndex;
    if (fromIndex !== toIndex) {
      moveItemInArray(event.container.data, fromIndex, toIndex);
      this.updateColumnsDisplay();
    }
  }

  dropGroupItem(event: any): void {
    const fromIndex = event.previousIndex;
    const toIndex = event.currentIndex;
    if (event.previousContainer === event.container) {
      if (fromIndex !== toIndex) {
        moveItemInArray(event.container.data, fromIndex, toIndex);
        this.updateDataSource();
      }
    }
    else {
      const item = this.columnDefs()[fromIndex].field;
      if (!_.includes(this.groupByColumns(), item)) {
        this.groupByColumns().splice(toIndex, 0, item);
        this.updateDataSource();
      }
    }
    this.moveInGroupContent = false;
  }

  setSortInfo(sort: any): void {
    this.sortActive = sort.active;
    this.sortDirection = sort.direction;
    this.updateDataSource();
  }
}
