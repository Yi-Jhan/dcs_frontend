import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import _ from 'lodash';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { SharedModule, onDestroyed } from '../../../../shared';
import { DialogService, EventService } from '../../../../shared/service';
import { DialogButtonType, DialogEvent, DialogStatus } from '../../../../core/enum';
import { IDialogConfig } from '../../../../core/model';

@Component({
  selector: 'app-network-config',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    MatRadioModule
  ],
  templateUrl: './network-config.component.html',
  styleUrls: ['./network-config.component.scss']
})
export class NetworkConfigComponent implements OnInit {
  destroy$ = onDestroyed();
  netWorkFormGroup: any;
  ipDHCPData = false;
  ipAddrData: any;
  subnetData: any;
  getwayData: any;
  DNSManualData = false;
  prefDNSData: any;
  AltDNSData: any;
  isSaved = false;
  deactivateSubjuct = new Subject<boolean>();


  constructor(
    private dialogService: DialogService,
    private translate: TranslateService,
    private eventService: EventService
    ) {}

  ngOnInit(): void {
    this.initEvent();
    this.getConfigData();

  }

  initEvent(): void {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      //console.log("event",event);
      switch(event.eventName) {
        case  DialogEvent.ButtonClicked:
          switch(event.id){
            case 'Unsaved_dialog' :
                this.deactivateSubjuct.next(event.data.id === 'ok');
                this.deactivateSubjuct.complete();
                this.dialogService.close('Unsaved_dialog');
                break;

          }

        break;
      }
    })
  }

  openTemplateDialog(){
    const dialogInfo: IDialogConfig = {
      title: 'Test Title',
      matConfig: { id: 'DialogTest3' },
      buttons: [
        {id: 'colseAll', desc: 'close all', type: DialogButtonType.CloseAll},
        {id: 'close', desc: 'close', type: DialogButtonType.Close}
      ]
    }

    const dialogRef = this.dialogService.open('Test Message 123', dialogInfo);
}

  getConfigData() {
    let jsonData = {"dhcp":false,
    "ip": "10.19.121.1",
    "subnet":"20",
    "gateway": "10.19.19.19",
    "autoDns": false,
    "preDns":"8.8.8.8",
    "altDns":"8.8.4.4"};

    //console.log(typeof(jsonData)); // object
    this.setFormData(jsonData);
   // const jsonObj = JSON.parse(jsonData);
    // this.workorderAPI.getFactories().subscribe(data=>{
    //   this.factoriesData = data;
    // });
    // this.profileAPI.getProfile().subscribe((resp:any)=>{
    //   this.profileData = resp;
    // });
  }

  setFormData(jsonData:any){
    let asignIP = jsonData.dhcp? 'dhcp':'IPmanual';
    let asignDns = jsonData.autoDns? 'auto':'DNSmanual';

    this.netWorkFormGroup = new FormGroup({
      assignment: new FormControl(asignIP),
      dns: new FormControl(asignDns),
      ipAddress: new FormControl({value:jsonData.ip,disabled:false},[
        Validators.pattern('(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)')
      ]),
      subnetPL: new FormControl({value:jsonData.subnet,disabled:false},[
        Validators.max(32),
        Validators.min(0),
        Validators.pattern('^(0|[1-9][0-9]*)$') // zero or not start from zero's number
      ]),
      gateway:new FormControl(jsonData.gateway,[
        Validators.pattern('(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)')
      ]),
      prefDNS:new FormControl(jsonData.preDns,[
        Validators.pattern('(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)')
      ]),
      altDNS:new FormControl(jsonData.altDns,[
        Validators.pattern('(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)')
      ])
    });
    this.isSaved = this.netWorkFormGroup.touched;
    this.setDHCP(jsonData.dhcp);

  }

  setDHCP(isDhcp:any){
    //console.log("setDHCP");
    //this.netWorkFormGroup.controls.assignment.ipAddress.value = ' ';
   // this.netWorkFormGroup.
  }



  onSubmit(){
    console.log(this.netWorkFormGroup.value);
    if(!this.isValidData()){
      console.log("=DDDD");
      this.openWarningDialog();
    }else{
      this.openSucesDialog();
      this.netWorkFormGroup.touched = false;
    }
    console.log("Form is touched : ",this.netWorkFormGroup.touched);

  }
  openWarningDialog(){
    const dialogInfo: IDialogConfig = {
      title: this.translate.instant('i18n_Fail'),
      matConfig: { id: 'WarningNetworkConfig', data: '' },
      status: DialogStatus.Warning,
      buttons: []
    };
    this.dialogService.open(this.translate.instant('i18n_CheckConfigMsg'), dialogInfo);
  }

  openSucesDialog(){
    const dialogInfo: IDialogConfig = {
      title:  this.translate.instant('i18n_Success'),
      matConfig: { id: 'SuccessNetworkConfig', data: '' },
      status: DialogStatus.Success,
      buttons: []
    };
    this.dialogService.open(this.translate.instant('i18n_saveSuccessMsg'), dialogInfo);

    setTimeout(()=>{
      this.dialogService.close('SuccessNetworkConfig');
    },1400)
  }

  getEnteredData(){

  }

  isValidData():Boolean{
    console.log(this.netWorkFormGroup.value.dns);
    if(this.netWorkFormGroup.value.assignment == "IPmanual"){
      if (!this.netWorkFormGroup.controls.ipAddress.valid ||
        !this.netWorkFormGroup.controls.subnetPL.valid  ||
        !this.netWorkFormGroup.controls.gateway.valid  ||
        !this.netWorkFormGroup.controls.prefDNS.valid ||
        !this.netWorkFormGroup.controls.altDNS.valid )
      {
        console.log("return false");
        return false;
      }
    }

    if (this.netWorkFormGroup.value.assignment == "dhcp" && this.netWorkFormGroup.value.dns == "DNSmanual")
    {
      if (!this.netWorkFormGroup.controls.prefDNS.valid ||
        !this.netWorkFormGroup.controls.altDNS.valid )
      {
        console.log("return false");
        return false;
      }
    }
    console.log("return true");
    return true;
  }

  canDeactivate(): boolean | Observable<boolean> {
    if(this.netWorkFormGroup.touched){
      // 尚未儲存
      //this.openWarningDialog();
      const dialogInfo: IDialogConfig = {
        title:  'i18n_Warning',
        matConfig: { id: 'Unsaved_dialog', data: '' },
        status: DialogStatus.Warning,
        buttons: [
          { id: 'cancel', desc: 'i18n_Cancel', type: DialogButtonType.Cancel },
          //{ id: 'ok', desc: 'Common.Button.OK', type: 'general' }
          { id: 'ok', desc: 'i18n_Confirm', type: DialogButtonType.General }
      ]
      };
      this.dialogService.open(this.translate.instant('i18n_ConfirmToLeave'), dialogInfo);

     // this.openTemplateDialog();
      //return false;
    return this.deactivateSubjuct.asObservable();
    }
    // 已經儲存
    return true;
  }

}
