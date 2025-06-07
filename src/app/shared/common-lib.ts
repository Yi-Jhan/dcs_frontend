import { DestroyRef, Injectable, inject } from "@angular/core";
import { Subject, takeUntil } from "rxjs"
import { IDialogConfig, IExportConfig } from "../core/model";
import { DialogService } from "./service";
import { TableExportComponent } from "./component";
import { DialogButtonType } from "../core/enum";

export const onDestroyed = () => {

  const subject = new Subject();

  inject( DestroyRef ).onDestroy(() => {
    subject.next( null );
    subject.complete();
  });

  return <T>() => takeUntil<T>( subject.asObservable() );
}

export const commonLib = () => {
  const dialogService = inject(DialogService);

  return {

    openTableExportDialogFn: (data: IExportConfig) => {
      const dialogInfo: IDialogConfig = {
        title: 'Export File',
        matConfig: { id: 'ExportDialog', data, autoFocus: false },
        buttons: [
          { id: 'cancel', desc: 'Common.Button.Cancel', type: DialogButtonType.Cancel },
          { id: 'export', desc: 'Common.Button.Export', type: DialogButtonType.General, icon: 'fa-solid fa-download' }
        ]
      }

      dialogService.open(TableExportComponent, dialogInfo);
    },

    exportCSV: (fileName: string, csv: string) => {

      let hiddenElement = document.createElement('a');

      hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = fileName;
      hiddenElement.click();
    }
  };
}

export const openTableExportDialogFn = () => {

  const dialogService = inject(DialogService);

  return (data: IExportConfig) => {
    const dialogInfo: IDialogConfig = {
      title: 'Export File',
      matConfig: { id: 'ExportDialog', data, autoFocus: false },
      buttons: [
        { id: 'cancel', desc: 'Common.Button.Cancel', type: DialogButtonType.Cancel },
        { id: 'export', desc: 'Common.Button.Export', type: DialogButtonType.General, icon: 'fa-solid fa-download' }
      ]
    }

    dialogService.open(TableExportComponent, dialogInfo);
  }
}

export const exportCSV = (fileName: string, csv: string) => {

  let hiddenElement = document.createElement('a');

  hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = fileName;
  hiddenElement.click();
}

@Injectable({
  providedIn: 'root'
})
export class CommonLibService{
  constructor(
    private dialogService: DialogService
  ) { }

  openTableExportDialog(data: IExportConfig): void {
    const dialogInfo: any = {
      title: 'Export File',
      matConfig: { id: 'ExportDialog', data, autoFocus: false },
      buttons: [
        { id: 'cancel', desc: 'Common.Button.Cancel', type: 'cancel' },
        { id: 'export', desc: 'Common.Button.Export', type: 'general', icon: 'fa-solid fa-download' }
      ]
    }
    this.dialogService.open(TableExportComponent, dialogInfo);
  }

  exportCSV(fileName: string, csv: string): void {
    let hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName;
    hiddenElement.click();
  }

}
