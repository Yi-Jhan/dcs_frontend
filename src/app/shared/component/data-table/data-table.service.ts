import { Injectable } from '@angular/core';
import { EventService } from '../../service';
import { IEvent } from '../../../core/model';
import _ from 'lodash';
import { MatTableDataSource } from '@angular/material/table';

export class Group {
  __parent: Group | null = null;
  groupLevel = 0;
  expanded = true;
  totalCounts = 0;
  [key: string]: any;

  get visible(): boolean {
    return !this.__parent || (this.__parent.visible && this.__parent.expanded);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DataTableService {

  constructor(private eventService: EventService) { }

  addGroup(data: Array<any>, groupByColumns: Array<string>): Array<any> {
    return this.getSubGroups(data, 0, null, groupByColumns);
  }

  getSubGroups(data: Array<any>, groupLevel: number, parent: Group|null, groupByColumns: Array<string>): Array<any> {
    if(groupLevel >= groupByColumns.length) {
      _.map(data, row => row.__parent = parent);
      return data;
    }

    let subGroups = new Array<any>();
    const currentColumn = groupByColumns[groupLevel];
    const groupCollection = _.groupBy(data, groupByColumns[groupLevel]);

    _.chain(groupCollection)
      .keys()
      .map((row => {
        const result = new Group();
        result.groupLevel = groupLevel + 1;
        result.__parent = parent;
        result['group'] = { key: currentColumn, value: row }

        return result;
      }))
      .each(group => {
        const rowsInGroup = groupCollection[group['group'].value];
        group.totalCounts = rowsInGroup.length;

        const subGroup = this.getSubGroups(rowsInGroup, groupLevel + 1, group, groupByColumns);
        subGroup.unshift(group);
        subGroups = _.concat(subGroups, subGroup);
      }).value();

    return subGroups;
  }

  setFilterPredicate(dataSource: MatTableDataSource<any>): void {
    dataSource.filterPredicate = (row: any, filter: string) => {
      if(!(row instanceof Group)) {
        return this.getDataRowVisible(row) && row['__tableFilter'];
      }
      else {
        return row.visible && row.totalCounts > 0;
      }
    };
  }

  getDataRowVisible(data: any): boolean {
    return data.__parent ? (data.__parent.visible && data.__parent.expanded) : true;
  }

  preFilter(data: Array<any>, filters: Array<string> ): void {
    _.each(data, row => {
      if(!(row instanceof Group)) {
        const include = this.isIncludes(row, filters);
        if(row['__tableFilter'] !== include) {
          row['__tableFilter'] = include;
          this.calCounts(row.__parent, include);
        }
      }
    });
  }

  isIncludes(rowData: any, filters: Array<string>): boolean {
    if(filters.length === 0) {
      return true;
    }

    let include = false;
    _.each(filters, item => {
      const filter = item.trim().toLowerCase();
      _.each(_.keys(rowData), key => {
        if(!this.isTableKey(key) && !_.isNull(rowData[key])) {
          switch(key) {

            // special case
            // ...

            default:
              include = _.includes(rowData[key].toString().toLowerCase(), filter);
              break;
          }
        }
        else {

        }

        if(include) { return false; }
        return;
      })

      if(!include) { return false; }
      return;
    });

    return include;
  }

  calCounts(parent: Group | null, isInclude: boolean): void {
    if(!parent) {
      return;
    }

    parent.totalCounts = isInclude ? ++parent.totalCounts : --parent.totalCounts;
    this.calCounts(parent.__parent, isInclude);
  }

  sortData(data: Array<any>, sortActive: string, sortDirection: 'asc' | 'desc', type: string | undefined): Array<any> {
    let _temp: Array<any>;
    switch(sortActive) {

      // special case
      // ...

      default:
        _temp = _.orderBy(
          data,
          item => {
            if(_.isNumber(item[sortActive])) {
              return item[sortActive];
            }
            else {
              const parse = parseInt(item[sortActive], 10);
              if(_.isNaN(parse)) {
                return item[sortActive];
              }
              return parse;
            }
          },
          sortDirection
        );
        break;
    }

    return _temp;
  }

  tableEventHandler(id: string, eventName: string, data?: any): void {
    const e: IEvent = { id, eventName, data };
    this.eventService.emit(e);
  }

  isTableKey(key: string): boolean {
    const tableKeys = [
      '__parent',
      '__tableFilter',
      '__rowID',
      '__rowSelected'
    ];

    return _.includes(tableKeys, key);
  }
}
