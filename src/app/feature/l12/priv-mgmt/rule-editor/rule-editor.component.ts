import { Component, OnInit } from '@angular/core';
import _ from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import { CommonModule } from '@angular/common';
import { SharedModule, onDestroyed } from '../../../../shared';
import { ChipsInputComponent } from '../../../../shared/component';
import { DialogService, EventService } from '../../../../shared/service';
import { ChipsInputEvent, DialogEvent } from '../../../../core/enum';
import { IEvent } from '../../../../core/model';

@Component({
  selector: 'app-rule-editor',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ChipsInputComponent
  ],
  templateUrl: './rule-editor.component.html',
  styleUrls: ['./rule-editor.component.scss']
})
export class RuleEditorComponent implements OnInit {
  destroy$ = onDestroyed();
  dataFromMatDialog: any;
  chipsInputID = 'KeywordInput';
  placeHolder = 'RolePrivConfig.Dialog.KeyWordPlaceholder';
  enteredValue = new Array<any>();
  keywordChanged = false;
  ruleForm: FormGroup;
  fields: Array<any>;
  // operators: Array<any>;
  isDateField = false;

  constructor(
    private eventService: EventService,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private translate: TranslateService,
  ) {
    // super();
    this.fields = [
      { value: 1, displayName: this.translate.instant('i18n_Order'), fieldName: 'orderNo' },
      { value: 2, displayName: this.translate.instant('i18n_EdgeGateway'), fieldName: 'edgeGateway' },
      { value: 3, displayName: this.translate.instant('i18n_CreatedDate'), fieldName: 'createdAt' }
    ]
    // this.operators = [
    //   {value: 'Contain', text: 'Contain'},
    //   {value: 'Equal', text: 'Equal'}
    // ];
    this.ruleForm = this.formBuilder.group({
      field: ['', Validators.required],
      start: null,
      end: null
      // operator: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if(this.dataFromMatDialog) {
      console.log(this.dataFromMatDialog);
      this.ruleForm.patchValue({
        field: this.dataFromMatDialog.value
      });
      // this.ruleForm.patchValue({operator: this.dataFromMatDialog.operator});
      this.isDateField = (this.ruleForm.value.field === 3);
      if(this.isDateField) {
        this.ruleForm.patchValue({
          start: dayjs(this.dataFromMatDialog.keyword[0]).toISOString() ,
          end: dayjs(this.dataFromMatDialog.keyword[1]).toISOString()
        });
      }
      else {
        _.each(this.dataFromMatDialog.keyword, item => {
          this.enteredValue.push(item);
        });
      }
    }

    this.initEvent();
  }

  initEvent(): void {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      switch(event.eventName) {
        case ChipsInputEvent.InputChange:
          this.keywordChanged = true;
          if(event.id === this.chipsInputID) {
            this.dialogService.updateButtonStatus(
              'RuleEditorDialog',
              this.dataFromMatDialog ? 'update' : 'save',
              this.ruleForm.controls['field'].valid && this.enteredValue.length > 0
            );
          }
          break;

        case DialogEvent.ButtonClicked:
          this.saveData(event);
          break;
      }
    });

    this.ruleForm.valueChanges.pipe(this.destroy$()).subscribe(change => {
      this.isDateField = (change.field === 3);

      if(this.isDateField) {
        this.dialogService.updateButtonStatus(
          'RuleEditorDialog',
          this.dataFromMatDialog ? 'update' : 'save',
          !this.ruleForm.controls['start'].hasError('matStartDateInvalid') &&
          !this.ruleForm.controls['end'].hasError('matEndDateInvalid') &&
          this.ruleForm.value.start && this.ruleForm.value.end
        );
      }
      else {
        this.dialogService.updateButtonStatus(
          'RuleEditorDialog',
          this.dataFromMatDialog ? 'update' : 'save',
          this.ruleForm.controls['field'].valid && this.enteredValue.length > 0
        );
      }
    });
  }

  saveData(event: IEvent): void {
    this.eventService.emit({
      id: 'RuleEditorDialog',
      eventName: (event.data.id === 'save') ? 'addRule': 'updateRule',
      data: this.getRuleData()
    });
  }

  getRuleData() {
    const field = _.find(this.fields, item => item.value === this.ruleForm.value.field);
    if(this.isDateField) { console.log(this.ruleForm.value.start);}
    return {
      fieldName: field ? field.fieldName : '',
      keyword: this.isDateField ? [this.ruleForm.value.start, this.ruleForm.value.end] : this.enteredValue,
      operator: this.isDateField ? 'Range' : 'Contain',
      value: this.ruleForm.value.field
    }
  }

  // getFieldName(value: number) {
  //   switch(value) {
  //     case 1:
  //       return 'Order';
  //     case 2:
  //       return 'Edge Gateway';
  //     case 3:
  //       return 'Created Date';
  //     default:
  //       return '';
  //   }
  // }
}
