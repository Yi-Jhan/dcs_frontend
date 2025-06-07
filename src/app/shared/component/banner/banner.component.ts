import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { AccountService, StateService } from '../../service';
import { Theme } from '../../../core/enum';
import { OverlayContainer } from '@angular/cdk/overlay';
import { environment } from '../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';
import { Language } from '../../../core/enum/language.enum';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent {

  stateService = inject(StateService);
  accountService = inject(AccountService);
  translate = inject(TranslateService);

  title = environment.title;
  loginStatus = this.stateService.loginStatus;
  sideMenuStatus = this.stateService.sideMenuStatus;
  theme = this.stateService.theme;
  mode = this.theme();
  userName = 'Administrator';
  currentTime = '12:00';
  languageList = _.map(_.entries(Language), ([key, value]) => ({
    key,
    value
  }));

  constructor() {
    const overlayContainer = inject(OverlayContainer);

    effect(() => {
      const currentClass = this.theme() === Theme.Light ? Theme.Dark : Theme.Light;
      overlayContainer.getContainerElement().classList.remove(currentClass);
      overlayContainer.getContainerElement().classList.add(this.theme());
    });
  }

  sideMenuToggle(): void {
    this.sideMenuStatus.update(state => !state);
  }

  logout(): void {
    this.accountService.logout();
  }

  test(): void {
    localStorage.setItem('theme', this.mode);
    this.theme.set(this.mode);
  }

  test2(event: any) {
    const choose = event ? Theme.Dark : Theme.Light
    localStorage.setItem('theme', choose);
    this.theme.set(choose);
  }

  isThemeDark(): boolean {
    return this.mode === 'theme-dark';
  }

  switchTheme(): void {
    this.mode = this.mode === Theme.Light ? Theme.Dark : Theme.Light
    localStorage.setItem('theme', this.mode);
    this.theme.set(this.mode);
  }

  changeLang(lang: string): void {
    this.stateService.language.set(lang);
  }
}
