import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import _ from 'lodash';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import { DialogService, EventService } from '../../../service';
import { CommonLibService, onDestroyed } from '../../../../shared';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared.module';
import { IExportConfig, IExportContent } from '../../../../core/model';
import { DialogEvent } from '../../../../core/enum';
import { MatRadioModule } from '@angular/material/radio';
import { Group } from '../../data-table/data-table.service';

@Component({
  selector: 'app-table-export',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    MatRadioModule
  ],
  templateUrl: './table-export.component.html',
  styleUrls: ['./table-export.component.scss']
})
export class TableExportComponent implements OnInit {
  destroy$ = onDestroyed();

  eventService = inject(EventService);

  dataFromMatDialog!: IExportConfig;
  tableData: any;
  exportForm: FormGroup;

  columnsHide = new Array();
  columnsShow = new Array();

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private dialogService: DialogService,
    private commonLib: CommonLibService
  ) {

    this.exportForm = this.formBuilder.group({
      fileType: 'csv',
      fileName: ''
    });
  }

  ngOnInit(): void {
    this.initEvent();
    this.initColumnsStatus();
  }

  //#region Init Event
  initEvent(): void {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      switch(event.eventName) {
        case DialogEvent.ButtonClicked:
          if(event.id === 'ExportDialog') {
            if(event.data.id === 'export') {
              switch(this.exportForm.value.fileType) {
                case 'csv':
                  this.exportCSV();
                  break;

                case 'pdf':
                  this.exportPDF(false);
                  break;
              }
            }
            else if(event.data.id === 'view') {
              this.exportPDF(true);
            }
          }
          break;
      }
    });

    this.exportForm.controls['fileType'].valueChanges.subscribe(value => {
      if(value === 'csv') {
        this.updateDialogButtons([
          { id: 'cancel', desc: 'i18n_Cancel', type: 'cancel' },
          { id: 'export', desc: 'i18n_Export', type: 'general', icon: 'fa-solid fa-download' }
        ]);
      }
      else if(value === 'pdf') {
        this.updateDialogButtons([
          { id: 'cancel', desc: 'i18n_Cancel', type: 'cancel' },
          { id: 'view', desc: 'i18n_View', type: 'general', icon: 'fa-solid fa-eye' },
          { id: 'export', desc: 'i18n_Export', type: 'general', icon: 'fa-solid fa-download' }
        ]);
      }
    });
  }
  //#endregion

  initColumnsStatus(): void {
    this.tableData = _.find(this.dataFromMatDialog.exportContent, item => item.dataType === 'table');

    this.columnsHide = _
      .chain(this.tableData.data.columns)
      .filter(item => !item.visible)
      .map(item => {
        return { field: item.field, headerName: item.headerName }
      })
      .value();

    this.columnsShow = _
      .chain(this.tableData.data.columns)
      .filter(item => item.visible)
      .map(item => {
        return { field: item.field, headerName: item.headerName }
      })
      .value();
  }

  drop(event: CdkDragDrop<{ field: string, headerName: string }[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  //#region Export CSV
  exportCSV(): void {
    let csv = '';
    for (let i = 0; i < this.columnsShow.length; i++) {
      csv += this.translate.instant(this.columnsShow[i].headerName) + ",";
    }
    csv = csv.substring(0, csv.length - 1) + "\n";
    _.each(this.tableData.data.data, item => {
      if(!(item instanceof Group)) {

        _.each(this.columnsShow, col => {
          csv += this.getCellValue(item, col.field) + ",";
        });
      }
      csv = csv.substring(0, csv.length - 1) + "\n";
    });

    const fileName = this.exportForm.value.fileName ? this.exportForm.value.fileName : 'export.csv';
    this.commonLib.exportCSV(fileName, csv);
  }

  getCellValue(rowData: any, field: string): string {
    switch(field) {

      // special case
      // ...

      default:
        return this.checkComma(rowData[field].toString());
    }
  }

  checkComma(value: string): string {
    if(value.includes(',')) {
      return `"${value}"`;
    }

    return value;
  }
  //#endregion

  //#region Export PDF
  exportPDF(isPreview: boolean): void {
    const fileName = this.exportForm.value.fileName
                      ? this.exportForm.value.fileName
                      : 'Export_' + dayjs().format('YYYYMMDD') + '.pdf';
    // const pageOrientation = this.dataFromMatDialog.pageOrientation
    //                         ? this.dataFromMatDialog.pageOrientation
    //                         : this.columnsShow.length > 7 ? 'landscape': 'portrait'

    // this.commonLib.exportPDF(
    //   fileName,
    //   // this.getPdfContent(),
    //   this.dataFromMatDialog.pageOrientation,
    //   isPreview
    // );
  }

  // getPdfContent(): Content {
  //   const content = new Array();;
  //   const dataSort = _.sortBy(this.dataFromMatDialog.exportContent, item => item.position);

  //   _.each(dataSort, item => {
  //     switch(item.dataType) {
  //       case 'image':
  //         content.push(this.getImageContent(item));
  //         break;

  //       case 'table':
  //         content.push(this.getGridContent(item));
  //         break;
  //     }
  //   });

  //   content.unshift(this.getTitle(this.dataFromMatDialog.screenName ?? this.router.url.split('/')[1]));

  //   return content;
  // }

  getTitle(title: string) {
    const content = [
      { text: title, style: 'pageTitle' },
      this.getSeparatorLine(),
      { text: 'Date : ' + dayjs().format('YYYY/MM/DD'), style: 'dateInfo' },
    ];

    return content;
  }

  getGridContent(item: IExportContent) {
    const gridContent: any = [
      {
        table: {
          headerRows: 1,
          widths: this.getTableWidths(),
          body: this.getTableContent(item.data.data)
        },
        layout: {
            fillColor: (rowIndex: number, node: any, columnIndex: number) => {
                return (rowIndex % 2 === 0) ? '#F8FAFB' : null;
            },
            vLineColor: (i: number) => { return '#DFDFDF'; },
            hLineColor: (i: number) => { return '#DFDFDF'; }
        }
      }
    ];

    if(item.title) {
      gridContent.unshift(
        { text: item.title, style: 'pageTitle', pageBreak: 'before'},
        this.getSeparatorLine(),
      );
    }

    return gridContent;
  }

  getImageContent(item: IExportContent) {
    const imageContent: any = [];
    if(item.title) {
      imageContent.push(
        { text: item.title, style: 'pageTitle', pageBreak: 'before'},
        this.getSeparatorLine(),
      );
    }

    imageContent.push([{
      table: { body: [this.getImages(item.data, item.imageFit)] },
      layout: 'noBorders'
    }]);

    return imageContent;
  }

  getImages(data: Array<any>, imageFit: any): Array<any> {
    const images = new Array<any>();
    _.each(data, img => {
      images.push({ image: img, fit: [imageFit, imageFit] });
    });

    return images;
  }

  getTableWidths(): Array<string> {
    const widths = _.times(this.columnsShow.length-1, _.constant('auto'));
    widths.push('*');
    return widths;
  }

  getTableContent(data: Array<any>) {
    const content = _
      .chain(data)
      .filter(item => { return !(item instanceof Group); })
      .map(item => {
        return _.map(this.columnsShow, column => {
          switch(column) {


            // special case
            // ...

            default:
              return _.isUndefined(item[column.field]) ? '' : {text: item[column.field].toString().replaceAll(';', '; '), style: 'tableCell'};
          }
        });
      })
      .value();

    content.unshift(
      _.map(this.columnsShow, item => { return { text: this.translate.instant(item.headerName), style: 'tableHeader' }; })
    );

    return content;
  }

  getSeparatorLine() {
    return {
      table : { headerRows : 1, widths: ['*'], body : [ [''], [''] ] },
      layout : {
          hLineWidth: (i: number, node: any) => { return (i === 1 ) ? 1 : 0; },
          vLineWidth: (i: number, node: any) => { return 0; },
          hLineColor: (i: number, node: any) => { return '#DFDFDF'; }
      }
    }
  }
  //#endregion

  updateDialogButtons(buttons: any): void {
    this.dialogService.updateButtons('ExportDialog', buttons);
  }
}
