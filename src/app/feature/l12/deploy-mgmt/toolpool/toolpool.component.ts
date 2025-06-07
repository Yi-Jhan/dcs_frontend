import { Component, HostBinding, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild, input, model } from '@angular/core';
import _ from 'lodash';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CommonLibService, SharedModule, objectAPI, onDestroyed, toolAPI } from '../../../../shared';
import { ChipsInputComponent, DataTableComponent } from '../../../../shared/component';
import { IExportConfig } from '../../../../core/model';
import { DialogService, EventService, SpinnerOverlayService } from '../../../../shared/service';
import { ChipsInputEvent, ExportEvent, TableEvent } from '../../../../core/enum';

@Component({
  selector: 'app-toolpool',
  standalone:true,
  imports:[
    CommonModule,
    SharedModule,
    ChipsInputComponent,
    DataTableComponent,
    MatProgressBar
  ],
  templateUrl: './toolpool.component.html',
  styleUrls: ['./toolpool.component.scss']
})
export class ToolpoolComponent implements OnInit {
  destroy$ = onDestroyed();
  @ViewChild('addDialog') addDialog!: TemplateRef<any>;
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;
  @ViewChild('uploadFileDialog') uploadFileDialog!: TemplateRef<any>;
  addForm: FormGroup = new FormGroup({});
  editForm: FormGroup = new FormGroup({});
  columnsDef: Array<any>;
  groupByColumns: Array<string>;
  // tableInfo: any;
  columns: Array<any>;
  testToolData = new Array();
  isLoadingResults = false;
  filters = new Array<string>();
  addFormDef: any;
  editFormDef: any;
  editData: any;
  exportData = {} as IExportConfig;
  uploadFiles: any = '';
  uploadProgress: number = 0;
  uploadFileDialogControl: any;
  uploadfield: any;
  uploadtype: any;
  uploadFileSize: any;
  objectName: any;
  rowClickedData: any;
  tableData:any;
  removeFileVal:any;
  removeFileDialogControl:any;
  id = input.required<string>();
  placeholder = input('i18n_EnterToSearch');
  enteredValue = model<Array<string>>([]);
  @HostBinding('class.fileOver') fileOver: boolean | undefined;
  tableID = 'toolpool';

  objectAPI = objectAPI();
  toolAPI  = toolAPI();

  constructor(
    private eventService: EventService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private commonLib: CommonLibService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private loading: SpinnerOverlayService) {
    this.columnsDef = [
      { field: 'category', headerName: 'i18n_Category', width: '120px' },
      { field: 'name', headerName: 'i18n_Name', width: '120px' },
      { field: 'toolPackageName', headerName: 'i18n_ToolPackage', width: '120px', cellRender: this.fileCellRender },
      { field: 'scriptName', headerName: 'i18n_Script', width: '120px', cellRender: this.cmdCellRender },
      { field: 'logPath', headerName: 'i18n_LogPath', width: '120px' },
      { field: 'successMsg', headerName: 'i18n_SuccessMessage', width: '120px', cellRender: this.successCellRender },
      { field: 'failMsg', headerName: 'i18n_FailMessage', width: '120px', cellRender: this.failCellRender },
      { field: 'remark', headerName: 'i18n_Remark', width: '120px'},
      { field: 'update_at', headerName: 'i18n_LastUpdateTime', width: '120px'}
    ];

    this.groupByColumns = ['category'];

    this.columns = _.map(this.columnsDef, item => {
      return { field: item.field, name: item.headerName, checked: _.includes(this.groupByColumns, item.field) };
    });

    this.addFormDef = [
      { field: 'category', name: 'i18n_Category', inputVal: '' },
      { field: 'name', name: 'i18n_Table.Name', inputVal: '' },
      { field: 'toolPackageName', name: 'i18n_ToolPackage', inputVal: '', upload: true },
      { field: 'scriptName', name: 'i18n_Script', inputVal: '', upload: true },
      { field: 'logPath', name: 'i18n_LogPath', inputVal: '' },
      { field: 'successMsg', name: 'i18n_SuccessMessage', inputVal: '' },
      { field: 'failMsg', name: 'i18n_FailMessage', inputVal: '' },
      { field: 'remark', name: 'i18n_Remark', inputVal: '' }
    ];

    this.editFormDef = [
      { field: 'category', name: 'i18n_Category', inputVal: '' },
      { field: 'name', name: 'ToolPooi18n_Name', inputVal: '' },
      { field: 'toolPackageName', name: 'i18n_ToolPackage', inputVal: '', upload: true },
      { field: 'scriptName', name: 'i18n_Script', inputVal: '', upload: true },
      { field: 'logPath', name: 'i18n_LogPath', inputVal: '' },
      { field: 'successMsg', name: 'i18n_SuccessMessage', inputVal: '' },
      { field: 'failMsg', name: 'i18n_FailMessage', inputVal: '' },
      { field: 'remark', name: 'i18n_Remark', inputVal: '' }
    ];
  }

  @HostListener('window:dragover', ['$event'])
  onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = true;
  }

  @HostListener('window:drop', ['$event'])
  onDrop(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = false;
    const file = event.dataTransfer.files;
    this.onFileDropped(file);
  }

  onFileDropped(file: any) {
    this.uploadProgress = 0;
    if (file.length > 0) {
      this.uploadFiles = file[0];
      this.uploadFileSize = (this.uploadFiles.size / 1024).toFixed(2);
      this.uploadTestScript(this.uploadFiles, this.uploadfield);
    }
  }

  ngOnInit(): void {
    this.initEvent();
    this.gettestToolData();
    this.initDialogItem();
  }

  ngAfterViewInit() {
    this.getrouteAction();
  }

  initEvent() {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      // console.log(event)
      switch (event.id) {
        case 'addTool':
          switch (event.data.id) {
            case 'Save':
              this.addTestTool(this.addForm.value);
              break;
            case 'Cancel':
              const toolPackagFolder = 'tool_package';
              const toolPackageVal = _.find(this.addForm.value.itemDef,val => { return val.field == 'toolPackageName' }).inputVal;
              const scriptFolder = 'script';
              const scriptsVal = _.find(this.addForm.value.itemDef,val => { return val.field == 'scriptName' }).inputVal;
              if(toolPackageVal.trim()){
                this.removeFile(toolPackagFolder,toolPackageVal);
              }
              if(scriptsVal.trim()){
                this.removeFile(scriptFolder,scriptsVal);
              }
              this.addForm.reset();
              break;
          }
          break;
        case 'editDevice':
          switch (event.data.id) {
            case 'Save':
              this.updateTestTool(this.editForm.value);
              break;
            case 'Delete':
              this.openDeleteDialog();
              break;
          }
          break;
        case 'deleteTestTool':
          switch (event.data.id) {
            case 'Submit':
              this.deleteData();
              this.dialogService.closeAll();
              break;
          }
          break;
        case 'uploadTestTool':
          switch (event.data.id) {
            case 'Next':
              this.chkUploadFile(this.uploadtype, this.uploadfield, this.uploadFiles);
              this.uploadFileDialogControl.close();
              this.uploadFiles = '';
              break;
            case 'Cancel':
              const removeFolder = this.uploadfield.split('Name')[0].toLowerCase();
              const removeVal = this.uploadFiles.name;
              if(removeVal.trim()){
                this.removeFile(removeFolder,removeVal);
              }
              break;
          }
          break;

        case 'removefile':
          switch (event.data.id) {
            case 'Submit':
              this.removeFile(this.removeFileVal.field, this.removeFileVal.inputVal);
              this.removeFileDialogControl.close();
              break;
          }
        break;
      }
      switch (event.eventName) {
        case ChipsInputEvent.InputChange:
          this.filters = _.clone(event.data);
          break;
        case 'dialogButtonClicked':
          break;
        case 'rowClicked':
          this.rowClickedData = event.data;
          this.openEditDialog(event.data);
          break;
        case TableEvent.ColumnVisible:
          this.tableData = event.data;
          break;
        case ExportEvent.Export:
          this.exportFile();
          break;
      }
    });
  }

  getrouteAction() {
    this.route.queryParams.subscribe(params => {
      let action = JSON.parse(params['action'] || '[]');
      if (action == 'addtool') {
        this.openAddDialog();
      }
    })
  }

  gettestToolData() {
    this.toolAPI.getTool().subscribe((tooldata: any) => {
        this.testToolData = tooldata;
      });
  }

  openAddDialog() {
    this.initDialogItem();
    const dialogInfo: any = {
      title: 'i18n_ToolInfo',
      matConfig: { id: 'addTool', data: '', width: '550px', disableClose:true },
      status: 'primary',
      buttons: [
        { id: 'Cancel', desc: 'i18n_Cancel', type: 'cancel' }
        , { id: 'Save', desc: 'i18n_Save', type: 'general' }]
    };
    this.dialogService.open(this.addDialog, dialogInfo);
  }

  openEditDialog(data: any) {
    const dialogInfo: any = {
      title: 'i18n_ToolInfo',
      matConfig: { id: 'editDevice', data: '', width: '550px' , disableClose:true},
      status: 'warning',
      buttons: [
        { id: 'Cancel', desc: 'i18n_Cancel', type: 'cancel' },
        { id: 'Delete', desc: 'i18n_Delete', type: 'general', color: 'danger' },
        { id: 'Save', desc: 'i18n_Save', type: 'general' }]
    };
    this.dialogService.open(this.editDialog, dialogInfo);
    this.editData = data;
    this.editForm = this.formBuilder.group({
      itemDef: this.updateEditFormArray(this.editData)
    });
  }

  openDeleteDialog() {
    const dialogInfo: any = {
      title: 'i18n_DeleteTool',
      matConfig: { id: 'deleteTestTool', data: '' , disableClose:true},
      status: 'danger',
      buttons: [
        { id: 'Cancel', desc: 'i18n_Cancel', type: 'cancel' },
        { id: 'Submit', desc: 'i18n_Submit', type: 'general' }]
    };
    this.dialogService.open('i18n_DeleteTestMsg', dialogInfo);
  }

  openWarningDialog(text: any) {
    const dialogInfo: any = {
      title: 'Warning',
      matConfig: { id: 'WarningTestTool', data: '' },
      buttons: [],
      status:'warning'
    };
    this.dialogService.open(text, dialogInfo);
  }

  initDialogItem() {
    this.addForm = this.formBuilder.group({
      itemDef: this.createAddFormArray()
    });

    this.editForm = this.formBuilder.group({
      itemDef: this.createEditFormArray()
    });
  }

  createAddFormArray() {
    return new FormArray(
      this.addFormDef.map(
        (item: any) =>
          new FormGroup({
            field: new FormControl(item.field),
            fieldName: new FormControl(this.translate.instant(item.name)),
            inputVal: new FormControl(item.inputVal),
            upload: new FormControl(item.upload)
          })
      )
    )
  }

  createEditFormArray() {
    return new FormArray(
      this.editFormDef.map(
        (item: any) =>
          new FormGroup({
            field: new FormControl(item.field),
            fieldName: new FormControl(this.translate.instant(item.name)),
            inputVal: new FormControl(item.inputVal),
            upload: new FormControl(item.upload)
          })
      )
    )
  }

  updateEditFormArray(data: any) {
    this.editFormDef = _.forEach(this.editFormDef, item => {
      item['inputVal'] = data[item.field];
    });

    return new FormArray(
      this.editFormDef.map(
        (item: any) =>
          new FormGroup({
            field: new FormControl(item.field),
            fieldName: new FormControl(this.translate.instant(item.name)),
            inputVal: new FormControl(item.inputVal),
            upload: new FormControl(item.upload)
          })
      )
    )
  }

  deleteData() {
    this.loading.show();
    this.toolAPI.deleteTool(this.rowClickedData.id).subscribe((resp: any) => {
      this.gettestToolData();
      this.loading.hide();
    });
  }

  addTestTool(data: any) {
    var convertVal = _.map(data.itemDef, (e: any) => {
      var data: any = {};
      if(!e.upload){
        data[e.field] = e.inputVal.replace(/ /g,"_");
      }
      else{
        data[e.field] = e.inputVal;
      }
      return data;
    }).reduce(function (i, c) {
      return _.assign(i, c);
    }, {});
    this.loading.show();
    this.toolAPI.createTool(convertVal).subscribe((resp: any) => {
      this.gettestToolData();
      this.loading.hide();
    });
    this.addForm.reset();
    this.dialogService.closeAll();
  }

  updateTestTool(data: any) {
    var convertVal = _.map(data.itemDef, (e: any) => {
      var data: any = {};
      if(!e.upload){
        data[e.field] = e.inputVal.replace(/ /g,"_");
      }
      else{
        data[e.field] = e.inputVal;
      }
      return data;
    }).reduce(function (i, c) {
      return _.assign(i, c);
    }, {});
    this.loading.show();
    this.toolAPI.updateTool(this.rowClickedData.id, convertVal).subscribe((resp: any) => {
      this.gettestToolData();
      this.dialogService.closeAll();
      this.loading.hide();
    });
  }

  exportcsv(): void {
    this.commonLib.openTableExportDialog(this.exportData);
  }

  uploadCSV(event: any) {
    const files = event.files;
    if (files && files.length) {
      const fileToRead = files[0];
      let reader: FileReader = new FileReader();
      reader.readAsText(fileToRead);
      reader.onload = (fileLoadedEvent: any) => {
        var textFromFileLoaded = fileLoadedEvent.target.result.trim();
        var csvData = textFromFileLoaded.split('\n');
        var header = csvData[0].split(',');
        for (let i = 1; i < csvData.length; i++) {
          this.testToolData.push(_.zipObject(header, csvData[i].split(',')));
        }
        this.testToolData = _.uniqBy(this.testToolData, 'Name');
        window.localStorage.setItem('addTestToolData', JSON.stringify(this.testToolData));
      }
    }
  }

  uploadFilebtn(field: any) {
    document.getElementById(field)?.click();
  }

  chkUploadFile(type: any, field: any, file: any) {
    const fileName = file.name;
    this.objectName = fileName;
    if (type == 'add') {
      this.addForm = this.formBuilder.group({
        itemDef: this.updateFileInput(type, field, fileName)
      });
    }
    else if (type == 'edit') {
      this.editForm = this.formBuilder.group({
        itemDef: this.updateFileInput(type, field, fileName)
      });
    }
  }

  updateFileInput(type: any, field: any, val: any) {
    var FormDef: any;
    if (type == 'add') {
      FormDef = _.forEach(this.addForm.value.itemDef, item => {
        if (item.field == field) {
          item['inputVal'] = val;
        }
      });
    }
    else if (type == 'edit') {
      FormDef = _.forEach(this.editForm.value.itemDef, item => {
        if (item.field == field) {
          item['inputVal'] = val;
        }
      });
    }
    return new FormArray(
      FormDef.map(
        (item: any) =>
          new FormGroup({
            field: new FormControl(item.field),
            fieldName: new FormControl(item.fieldName),
            inputVal: new FormControl(item.inputVal),
            upload: new FormControl(item.upload)
          })
      )
    )
  }

  uploadTestScript(scripts: any, uploadfield: any) {
    uploadfield == 'toolPackageName' ? uploadfield = 'tool_package': uploadfield = uploadfield.split('Name')[0].toLowerCase();
    this.objectAPI.createObject(scripts, uploadfield).subscribe({
      next:(resp:any)=>{
      if (resp.type == HttpEventType.UploadProgress) {
        const percentDone = Math.round(100 * resp.loaded / resp.total);
        this.uploadProgress = percentDone;
      }
      },
      error:err=>{
        this.openWarningDialog(err.error.message);
        this.uploadFiles = '';
      }
    });
  }

  openuploadFile(type: any, field: any) {
    this.uploadtype = type;
    this.uploadfield = field;
    const dialogInfo: any = {
      title: 'Upload Test Tool File',
      matConfig: { id: 'uploadTestTool', data: { field: field, type: type } },
      buttons: [
        { id: 'Cancel', desc: 'Cancel', type: 'cancel' }
        , { id: 'Next', desc: 'Next', type: 'general' }]
    };
    this.uploadFileDialogControl = this.dialogService.open(this.uploadFileDialog, dialogInfo);
  }

  openRemoveFileDialog(fileVal:any) {
    fileVal.field == 'toolPackageName' ? fileVal.field = 'tool_package': fileVal.field = fileVal.field.split('Name')[0].toLowerCase();
    this.removeFileVal = fileVal;
    const dialogInfo: any = {
      title: 'Remove File',
      matConfig: { id: 'removefile', data: '' , disableClose:true},
      buttons: [
        { id: 'Cancel', desc: 'Cancel', type: 'cancel' },
        { id: 'Submit', desc: 'Submit', type: 'general' }]
    };
    this.removeFileDialogControl = this.dialogService.open('Are you sure you want to remove this file?', dialogInfo);
  }

  removeFile(removefield: any, removeobject: any) {
    const folder = removefield;
    const objectName = removeobject;
    this.loading.show();
    this.objectAPI.deleteObject(folder, objectName).subscribe((resp: any) => {
      _.forEach(this.addForm.value.itemDef, ele => {
        if (ele.field == removefield) {
          ele.inputVal = ' ';
        }
      });
      _.forEach(this.editForm.value.itemDef, ele => {
        if (ele.field == removefield) {
          ele.inputVal = ' ';
        }
      });
      this.uploadFiles = '';
      this.loading.hide();
    });
  }

  cmdCellRender(data: any) {
    data.scriptName = data.scriptName.trim();
    const div = document.createElement('div');
    const i = document.createElement('i');

    if(data.scriptName !== ""){
      i.classList.add("fas", "fa-clipboard-list", "status-font-default");
      div.innerHTML = '&nbsp;&nbsp;' + data.scriptName;
    }
    else{
      div.innerHTML = data;
    }
    div.prepend(i);
    return div;
  }

  fileCellRender(data: any) {
    data.toolPackageName = data.toolPackageName.trim();
    const div = document.createElement('div');
    const i = document.createElement('i');

    if(data.toolPackageName !== "null"){
      i.classList.add("fas", "fa-file", "status-font-default");
      div.innerHTML = '&nbsp;&nbsp;' + data.toolPackageName;
    }
    else{
      div.innerHTML = data.toolPackageName;
    }
    div.prepend(i);
    return div;
  }


  successCellRender(data: any) {
    data.successMsg = data.successMsg.trim();
    const div = document.createElement('div');
    const i = document.createElement('i');

    if(data.successMsg !== ""){
      i.classList.add("fas", "fa-check-circle", "status-font-success");
      div.innerHTML = '&nbsp;&nbsp;' + data.successMsg;
    }
    else{
      div.innerHTML = data.successMsg;
    }
    div.prepend(i);
    return div;
  }

  failCellRender(data: any) {
    data.failMsg = data.failMsg.trim();
    const div = document.createElement('div');
    const i = document.createElement('i');

    if(data.failMsg !== ""){
      i.classList.add("fas", "fa-times-circle", "status-font-danger");
      div.innerHTML = '&nbsp;&nbsp;' + data.failMsg;
    }
    else{
      div.innerHTML = data.failMsg;
    }
    div.prepend(i);
    return div;
  }

  lastupdtCellRender(data:any){
    const date = new Date(data);
    const Lastupdt = new Date(date.getTime() - date.getTimezoneOffset()*60*1000);
    const newLastupdt:any = new DatePipe('en-US').transform(Lastupdt,'yyyy/MM/dd HH:mm');
    const div = document.createElement('div');
    const i = document.createElement('i');
    div.innerHTML = newLastupdt;
    div.prepend(i);
    return div;
  }

  openScirpt(script:any){
    this.loading.show();
    const dialogInfo: any = {
      title: 'Script',
      matConfig: { id: 'openscript', data: '', width:'300px'},
      buttons: [
        { id: 'Cancel', desc: 'Cancel', type: 'cancel' }]
    };
    this.objectAPI.getObject('script',script).subscribe((resp:any) => {
      this.dialogService.open(resp, dialogInfo);
      this.loading.hide();
    });
  }

  async exportFile(): Promise<void>  {
    this.exportData.exportContent = new Array();
    this.exportData.exportContent.push(
      {
        dataType: 'table',
        data: this.tableData,
        position: 0
      },
    );
    this.commonLib.openTableExportDialog(this.exportData);
  }

}
