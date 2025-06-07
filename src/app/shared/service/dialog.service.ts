import { Injectable, TemplateRef, inject } from '@angular/core';
import { IDialogButton, IDialogConfig } from '../../core/model';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EventService } from './event.service';
import { DialogEvent, DialogSize, DialogStatus } from '../../core/enum';
import { DialogComponent } from '../component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {

  dialog = inject(MatDialog);
  eventService = inject(EventService);

  constructor() { }

  open(content: ComponentType<any> | TemplateRef<any> | string, dialogConfig?: IDialogConfig): MatDialogRef<DialogComponent, any> {

    const matDialogRef = this.dialog.open(DialogComponent, dialogConfig ? dialogConfig.matConfig : undefined);
    const instance = matDialogRef.componentInstance;

    instance.loadCustomContent(content);
    instance.id = matDialogRef.id;
    instance.matDialogRef = matDialogRef;

    if (dialogConfig) {
      instance.title = dialogConfig.title !== '' ? dialogConfig.title : 'i18n_Message';
      instance.subtitle = dialogConfig.subtitle ?? '';
      instance.buttons = dialogConfig.buttons ?? [];
      instance.status = dialogConfig.status ?? DialogStatus.Primary;
      instance.size = dialogConfig.size ?? DialogSize.normal;

      if (dialogConfig.matConfig) {
        dialogConfig.matConfig.autoFocus = false;
      }
    }

    return matDialogRef;
  }

  close(id: string): void {
    this.eventService.emit({ id, eventName: DialogEvent.CloseDialog });
  }

  closeAll(): void {
    this.dialog.closeAll();
  }

  updateButtonStatus(id: string, buttonID: string, status: boolean): void {
    this.eventService.emit({
        id,
        eventName: DialogEvent.UpdateButtonStatus,
        data: { buttonID, status }
    });
  }

  updateButtons(id: string, buttons: Array<IDialogButton>): void {
    this.eventService.emit({
      id,
      eventName: DialogEvent.UpdateButtons,
      data: buttons
    });
  }
}
