import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Component, Inject, OnInit, TemplateRef, ViewChild, effect, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { SharedModule } from '../../shared.module';
import { CommonModule } from '@angular/common';
import { onDestroyed } from '../../common-lib';
import { ComponentHostDirective } from '../../directive';
import { DialogService, EventService, StateService } from '../../service';
import { DialogButtonType, DialogEvent, DialogSize, DialogStatus } from '../../../core/enum';
import { IDialogButton, IEvent } from '../../../core/model';
import _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, SharedModule, ComponentHostDirective],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  @ViewChild(ComponentHostDirective, { static: true }) componentHost!: ComponentHostDirective;

  destroy$ = onDestroyed();
  dialogService = inject(DialogService);
  eventService = inject(EventService);
  stateService = inject(StateService);
  translateService = inject(TranslateService);

  id!: string;
  title = 'i18n_Message';
  subtitle = '';
  message = '';
  status = DialogStatus.Primary;
  size = DialogSize.normal;
  buttons = new Array<IDialogButton>();
  matDialogRef!: MatDialogRef<any>;
  loginStatus = this.stateService.loginStatus;

  specificID = new Map([
    // [dialog ID, index]
    ['__timeoutDialog', 0],
    ['__2FA_Dialog', 1],
    ['__unauthorizedDialog', 2],
    ['__errorRespDialog', 3]
  ])

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {

    effect(() => {
      if(!this.loginStatus() && !this.specificID.has(this.id)) {
        console.log('close dialog id: ' +  this.id);
        this.dialogService.close(this.id);
      }
    });

  }

  ngOnInit(): void {

    this.initEvent();

  }

  initEvent(): void {

    this.eventService.event.pipe(this.destroy$()).subscribe(event => {

      if (event.id === this.id) {
        switch (event.eventName) {
          case DialogEvent.UpdateButtonStatus:
            this.updateButtonStatus(event);
            break;

          case DialogEvent.UpdateButtons:
            this.updateButtons(event.data);
            break;

          case DialogEvent.CloseDialog:
            this.matDialogRef.close();
            break;
        }
      }
    });

  }

  loadCustomContent(content: ComponentType<any> | TemplateRef<any> | string): void {

    const viewContainerRef = this.componentHost.viewContainerRef;

    switch (typeof(content)) {
      case 'function': // component
        const component = viewContainerRef.createComponent(content);
        component.instance.dataFromMatDialog = this.data;
        break;

      case 'object': // template
        viewContainerRef.createEmbeddedView(content, { $implicit: this.data });
        break;

      case 'string': // string
        this.message = this.translateService.instant(content);
        break;
    }

  }

  onClickButton(button: IDialogButton): void {

    switch (button.type) {
      case DialogButtonType.General:
        this.dialogEventHandler(DialogEvent.ButtonClicked, button);
        break;

      case DialogButtonType.Close:
        this.dialogEventHandler(DialogEvent.CloseDialog, button);
        break;

      case DialogButtonType.CloseAll:
        this.dialogService.closeAll();
        this.dialogEventHandler(DialogEvent.CloseAllDialog, button);
        break;

      case DialogButtonType.Cancel:
        this.dialogEventHandler(DialogEvent.CancelDialog, button);
        break;
    }

  }

  updateButtonStatus(event: IEvent): void {

    const index = _.findIndex(this.buttons, button => button.id === event.data.buttonID);

    if (index >= 0) {
      _.assignIn(this.buttons[index], { disable: !event.data.status });
    }

  }

  updateButtons(buttons: Array<IDialogButton>): void {

    this.buttons = buttons;

  }

  dialogEventHandler(eventName: string, data: any = null): void {

    const e: IEvent = { id: this.id, eventName, data };
    this.eventService.emit(e);

  }

}
