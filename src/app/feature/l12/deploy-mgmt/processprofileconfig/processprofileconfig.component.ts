import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { SharedModule, onDestroyed, profileAPI } from '../../../../shared';
import { TeststageComponent } from '../../../../shared/component';
import { DialogService, EventService } from '../../../../shared/service';
import { DialogEvent } from '../../../../core/enum';
import { IDialogButton } from '../../../../core/model';

@Component({
  selector: 'app-processprofileconfig',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TeststageComponent,
    MatRadioModule
  ],
  templateUrl: './processprofileconfig.component.html',
  styleUrls: ['./processprofileconfig.component.scss']
})
export class ProcessprofileconfigComponent implements OnInit {
  destroy$ = onDestroyed();
  @ViewChild('createProfileDialog') createProfileDialog!: TemplateRef<any>;
  createProfileDialogID = 'CreateProfileDialog';
  warningProfileDialogID = 'WarningProfileDialog';
  deleteConfirmID = 'DeleteConfirm';
  deactivateConfirmID = 'DeactivateConfirm';
  profileData:any;
  stageData:any;
  rowProfile:boolean;
  createProfileForm: FormGroup;
  isSaving:boolean;
  isDeleting:boolean;
  deactivateSubjuct = new Subject<boolean>();
  unsaved = false;
  profileid:any;
  profileForm:FormGroup;

  profileAPI = profileAPI();

  constructor(
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private eventService: EventService,

    private translate: TranslateService
    ) {

      this.createProfileForm = this.formBuilder.group({
        createType: 'new',
        profile: ''
      });

      this.profileForm = this.formBuilder.group({
        profilename:['', Validators.required],
        descr:['']
      });

      this.stageData = [];
      this.rowProfile = false;
      this.isSaving = false;
      this.isDeleting = false;
      const navigation  = this.router.getCurrentNavigation();
      this.profileData = navigation?.extras.state ? navigation.extras.state['profileData'] : undefined;
    }

  ngOnInit(): void {
    this.initEvent();
    this.geStageData();
  }

  ngAfterViewInit(): void {
    if(!this.rowProfile) {
      this.getProfileList();
      this.openCreateProfileDialog();
    }
  }

  initEvent(): void {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      // console.log('event',event)
      switch(event.eventName) {
        case DialogEvent.ButtonClicked:
          switch(event.id) {
            case this.createProfileDialogID:
              if(event.data.id === 'ok') {
                this.unsaved = true;
                const createType = this.createProfileForm.value.createType;
                if(createType == 'existing'){
                  const profileId = this.createProfileForm.value.profile;
                  this.profileAPI.getProfile(profileId).subscribe((resp:any)=>{
                    this.stageData = resp.stages;
                  });
                }
                this.dialogService.closeAll();
              }
              break;
              case this.warningProfileDialogID:
                if(event.data.id === 'ok') {
                  this.dialogService.closeAll();
                }
                break;

                case this.deleteConfirmID:
                  if(event.data.id === 'ok') {
                    this.deleteProfile();
                    this.dialogService.closeAll();
                  }
                  break;

                  case this.deactivateConfirmID:
                    this.deactivateSubjuct.next(event.data.id === 'ok');
                    this.deactivateSubjuct.complete();
                    this.dialogService.close(this.deactivateConfirmID);
                    break;

                  case "errorUpdateProfile":
                    this.router.navigate(['/']);
                    this.dialogService.closeAll();
                    break;
          }
          break;
      }
    });

    this.profileForm.valueChanges.pipe(this.destroy$()).subscribe(()=>{
      this.unsaved = true;
    });
  }

  canDeactivate(): boolean | Observable<boolean> {
    if(this.unsaved) {
      this.openConfrimDialog(this.deactivateConfirmID, this.translate.instant('i18n_ConfirmToLeave'));

      return this.deactivateSubjuct.asObservable();
    }

    return true;
  };

  getProfileList(){
    this.profileAPI.getProfile().subscribe((resp:any)=>{
      this.profileData = resp;
    });
  }

  geStageData() {
    this.route.queryParams.subscribe(params=>{
      this.profileid = JSON.parse(params['profileid']  || '[]')
      if(!_.isEmpty(this.profileid)){
        this.rowProfile = true;
        this.profileAPI.getProfile(this.profileid).subscribe((resp:any)=>{
          this.stageData = resp.stages;
          this.profileForm.patchValue({profilename:resp.name, descr:resp.description},{emitEvent: false, onlySelf: true});
        });
      }
    });
  }

  openCreateProfileDialog(): void {
    const dialogInfo: any = {
      title: 'i18n_ProcessProfileInfo',
      matConfig: { id: this.createProfileDialogID, disableClose: true ,width:'550px'},
      status:"primary",
      buttons: [
        { id: 'cancel', desc: 'i18n_Cancel', type: 'cancel' },
        { id: 'ok', desc: 'i18n_OK', type: 'general' }
      ]
    };
    this.dialogService.open(this.createProfileDialog, dialogInfo);
  }

  detectStageData(stagedata:any){
    this.stageData = stagedata;
    this.unsaved = true;
  }

  onClickCancelBtn(): void {
    this.router.navigate(['ProcessProfile']);
  }

  opendeleteDialog(){
    this.deleteDialog(this.deleteConfirmID, this.translate.instant('i18n_DeleteProcessProfileMsg'));
  }

  deleteProfile(){
    this.unsaved = false;
    this.profileAPI.deleteProfile(this.profileid).subscribe((resp:any)=>{
      this.onClickCancelBtn();
    }, error=>{
      const dialogInfo: any = {
        title: 'i18n_DeleteProcessProfileTitle',
        matConfig: {id: "errorUpdateProfile" , autoFocus: false, disableClose: true, width: '350px' },
        buttons: [
          { id: 'ok', desc: 'i18n_OK', type: 'general' }
        ],
        status: 'danger'
      }

      this.dialogService.open("Please check that the profile is being used.", dialogInfo)
    });
  }

  saveProfile(){
    this.unsaved = false;
    if(!this.rowProfile){
      const chkProfile = _.filter(this.profileData, existData=>{ return _.lowerCase(existData.name) == _.lowerCase(this.profileForm.value.profilename)});
      if(chkProfile.length > 0){
        this.openWarningDialog();
      }
      else{
        this.isSaving = true;
        const addProfileObj = {
          name:this.profileForm.value.profilename,
          description:this.profileForm.value.descr,
          stages:this.stageData
        }
        this.profileAPI.createProfile(addProfileObj).subscribe((resp:any)=>{
          this.isSaving = false;
          this.onClickCancelBtn();
        },error=>{
          const dialogInfo: any = {
            title: 'i18n_ProcessProfileInfo',
            matConfig: {id: "errorUpdateProfile" , autoFocus: false, disableClose: true, width: '350px' },
            buttons: [
              { id: 'ok', desc: 'i18n_OK', type: 'general' }
            ],
            status: 'danger'
          }

          this.dialogService.open("Please check that the profile is being used.", dialogInfo)
        });
      }
    }
    else{
      this.isSaving = true;
      const updateProfileObj:any = {
        id:this.profileid,
        name:this.profileForm.value.profilename,
        description:this.profileForm.value.descr,
        stages:this.stageData
      }
      this.profileAPI.updateProfile(updateProfileObj).subscribe((resp:any)=>{
        this.isSaving = false;
        this.onClickCancelBtn();
      },error=>{
        const dialogInfo: any = {
          title: 'i18n_ProcessProfileInfo',
          matConfig: {id: "errorUpdateProfile" , autoFocus: false, disableClose: true, width: '350px' },
          buttons: [
            { id: 'ok', desc: 'i18n_OK', type: 'general' }
          ],
          status: 'danger'
        }

        this.dialogService.open("Please check that the profile is being used.", dialogInfo)
      });
    }
  }

  openWarningDialog(){
    const dialogInfo: any = {
      title: 'Warning',
      matConfig: { id: this.warningProfileDialogID, data: '' },
      buttons: [ { id: 'ok', desc: 'OK', type: 'general' } ],
      status:"warning"
    };
    this.dialogService.open('i18n_DataExistMsg', dialogInfo);
  }

  deleteDialog(id: string, msg: string, button?: Array<IDialogButton>): void {
    const dialogInfo: any = {
      title: 'i18n_DeleteProcessProfileTitle',
      matConfig: { id, autoFocus: false, disableClose: true, width: '300px' },
      buttons: button ? button
                      : [
                        { id: 'cancel', desc: 'i18n_Cancel', type: 'cancel' },
                        { id: 'ok', desc: 'i18n_OK', type: 'general' }
                      ],
      status: 'danger'
    }

    this.dialogService.open(msg, dialogInfo);
  }

  openConfrimDialog(id: string, msg: string, button?: Array<IDialogButton>): void {
    const dialogInfo: any = {
      title: 'i18n_Confirm',
      matConfig: { id, autoFocus: false, disableClose: true, width: '300px' },
      buttons: button ? button
                      : [
                        { id: 'cancel', desc: 'i18n_Cancel', type: 'cancel' },
                        { id: 'ok', desc: 'i18n_OK', type: 'general' }
                      ],
      status: 'danger'
    }

    this.dialogService.open(msg, dialogInfo);
  }

}
