import { ApplicationRef, Component, HostBinding, Injector, OnInit, TemplateRef, ViewChild, effect, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AccountService, DialogService, StateService } from './shared/service';
import { SharedModule } from './shared';
import { CommonModule } from '@angular/common';
import { BannerComponent, BreadcrumbComponent, SidemenuComponent } from './shared/component';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import dayjs from 'dayjs';
import { IDialogConfig } from './core/model';
import { DialogButtonType } from './core/enum';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    BannerComponent,
    SidemenuComponent,
    BreadcrumbComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('timeoutDialog') timeoutDialog!: TemplateRef<any>;

  private stateService = inject(StateService);
  private idle = inject(Idle);
  private dialogService = inject(DialogService);
  private appRef = inject(ApplicationRef);
  private accountService = inject(AccountService);
  private injector = inject(Injector);

  @HostBinding('class')
  get themeMode(){
    return this.stateService.theme();
  }

  sideMenuStatus = this.stateService.sideMenuStatus;
  loginStatus = this.stateService.loginStatus;
  idleTimeSec = this.stateService.idleTimeSec;
  idleStartDate = '';
  expiretDate = '';
  expire = false;
  countdown = 0;

  constructor() {
    const translate = inject(TranslateService);
    translate.addLangs(['en-us', 'zh-tw']);
    translate.use(this.stateService.language());
  }

  ngOnInit(): void {
    this.initIdle();
    this.initEvent();
  }

  initIdle(): void {
    this.idle.setIdle(this.idleTimeSec());
    this.idle.setTimeout(60);
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
  }

  initEvent(): void {
    this.initIdleEvent();

    effect(() => {
      if(this.loginStatus()) {
        this.expire = false;
        this.idle.watch();
      }
      else {
        this.expire = true;
        this.idle.stop();
      }

      this.idle.setIdle(this.idleTimeSec());
    }, {injector: this.injector});
  }

  initIdleEvent(): void {
    this.idle.onIdleStart.subscribe(() => {
      this.idleStartDate = dayjs().format('YYYY/MM/DD HH:mm:ss');
      const dialogInfo: IDialogConfig = {
        title: "i18n_Message",
        matConfig: { id: '__timeoutDialog' },
        buttons: [{ id: 'close', desc: 'i18n_Close', type: DialogButtonType.Close }]
      };
      this.dialogService.open(this.timeoutDialog, dialogInfo);
    });

    this.idle.onIdleEnd.subscribe(() => {
      this.dialogService.close('__timeoutDialog');

      this.appRef.tick();
    });

    this.idle.onTimeout.subscribe(() => {
      this.expire = true;
      this.expiretDate = dayjs().format('YYYY/MM/DD HH:mm:ss');
      this.accountService.logout();
    });

    this.idle.onTimeoutWarning.subscribe(countdown => {
      this.countdown = countdown;
    });
  }
}
