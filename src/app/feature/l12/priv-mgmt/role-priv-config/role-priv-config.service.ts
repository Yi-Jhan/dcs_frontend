import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import _ from 'lodash';
import { EventService } from '../../../../shared/service';
import { TableEvent } from '../../../../core/enum';

@Injectable({
  providedIn: 'root'
})
export class RolePrivConfigService {

  constructor(
    private eventService: EventService,
    private translate: TranslateService
  ) { }

  getRoleConfigInfo(privilegeData: Array<any>, ruleData: Array<any>, itemHidden: Array<any>, roleInfo: any) {
    _.each(itemHidden, item => privilegeData.push(item));

    return {
      role: {
        name: roleInfo.name,
        description: roleInfo.description
      },
      privilegeDefine: this.getPrivilegeDefineData(privilegeData),
      ruleList: this.getRuleListData(ruleData)
    };
  }

  getPrivilegeDefineData(data: Array<any>) {
    _.each(data, item => {
      if(item.grouping === 'i18n_Privilege') {
        item.active = false;
        item.visible = false;
      }
    });

    return _.map(data, item => {
      return _.omit(item, ['rowID', 'rowSelected', 'tableFilter']);
    });
  }

  getRuleListData(data: Array<any>) {
    const list = new Array<{fieldName: string, value: number, operator: string, keyword: Array<string>}>();
    _.each(data, item => {
      list.push({
        fieldName: item.fieldName,
        value: item.value,
        operator: item.operator,
        keyword: item.operator === 'Range' ? [dayjs(item.keyword[0]).toISOString(), dayjs(item.keyword[1]).toISOString()] : item.keyword
      });
    });

    return list;
  }

  isRoleDuplicate(roleList: Array<any>, roleName: string): boolean {
    return _.some(roleList, item => item.name === roleName);
  }

  checkRowSelected(tableData: Array<any>, row: any): void {
    _
    .chain(tableData)
    .filter(item => {
      return item.category === row.category;
    })
    .each(item => {
      if(row.rowSelected && item.level < row.level) {
        this.eventService.emit({
          id: 'PrivilegeTable',
          eventName: TableEvent.SelectToggleRequest,
          data: { rowID: item.rowID, checked: true }
        });
        item.active = true;
      }
      else if(!row.rowSelected && item.level > row.level) {
        this.eventService.emit({
          id: 'PrivilegeTable',
          eventName: TableEvent.SelectToggleRequest,
          data: { rowID: item.rowID, checked: false }
        });
        item.active = false;
      }

      if(row.id === item.id) {
        item.active = row.rowSelected;
      }
    })
    .value();

    this.additionalConfirm(tableData, row);
  }

  additionalConfirm(tableData: Array<any>, row: any) {
    switch(row.stateName) {
      case 'ProcessProfile':
        if(row.itemInState === 'View' && !row.rowSelected) {
          _
          .chain(tableData)
          .filter(row => row.stateName === 'AddWorkOrder')
          .each(row => {
            this.eventService.emit({
              id: 'PrivilegeTable',
              eventName: TableEvent.SelectToggleRequest,
              data: { rowID: row.rowID, checked: false }
            });
          })
          .value();
        }
        break;
    }
  }

  //#region cell renderer
  fieldNameCellRender(data: any, row: any): any {
    if(data.displayName) {
      return data.displayName;
    }
    else {
      switch(row.value) {
        case 1:
          return 'i18n_OrderNo';
        case 2:
          return 'i18n_EdgeGateway';
        case 3:
          return 'i18n_CreatedDate';
      }
    }
  }

  keywordCellRender(data: any, row: any): HTMLElement {
    const container = document.createElement('div');
    container.style.display = 'flex';

    if(row.operator !== 'Range') {
      const amount = data.length;
      for (let i = 0; i < amount; i++) {
        const chip = document.createElement('div');
        chip.style.lineHeight = '22px';
        chip.style.border = '1px solid #ccc';
        chip.style.borderRadius = '15px';
        chip.style.padding = '0 10px';
        chip.style.margin = '0 5px 0 0';
        chip.innerHTML = data[i];
        container.appendChild(chip);
      }
    }
    else {
      container.innerHTML = `${dayjs(data[0]).format('YYYY/MM/DD')}&nbsp;~&nbsp;${dayjs(data[1]).format('YYYY/MM/DD')}`;
    }

    return container;
  }

  deleteCellRender(data: any, rowData: any): HTMLElement {
    const btn = document.createElement('button');
    btn.classList.add('cellBtn', 'warn');
    const i = document.createElement('i');
    i.classList.add('fa-solid', 'fa-trash-can');
    btn.append(i);
    return btn;
  }
  //#endregion
}
