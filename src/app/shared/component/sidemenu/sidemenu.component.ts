import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, input } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { environment } from '../../../../environments/environment';
import { Service } from '../../../core/enum';

@Component({
  selector: 'app-sidemenu',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss']
})
export class SidemenuComponent implements OnInit {
  menuList = new Array();
  ngOnInit(): void {
    this.setMenu()
  }

  setMenu() {
    switch (environment.service) {
      case Service.ACC:
        this.menuList = [
          {
            text: 'Monitor',
            icon: 'fa-solid fa-house',
            children: [
              { text: 'System Overview', icon: '', routerLink: '/SystemOverview' },
              { text: 'VM Overview', icon: '', routerLink: '/VMOverview' }
            ]
          },
          {
            text: 'Report',
            icon: 'fa-solid fa-chart-column',
            children: [
              { text: 'Software Report', icon: '', routerLink: '/SoftwareReport' },
              { text: 'Hardware Report', icon: '', routerLink: '/HardwareReport' },
              { text: 'Task Report', icon: '', routerLink: '/TaskReport' }
            ]
          },
          { text: 'Options', icon: 'fa-solid fa-gear', routerLink: '/Options' },
          { text: 'License', icon: 'fa-solid fa-key', routerLink: '/License' },
          { text: 'Demo', icon: 'fa-solid fa-ghost', routerLink: '/Demo' }
        ];
        break;

      case Service.L12:
        this.menuList = [
          { text: 'System Overview', icon: 'fas fa-home fa-lg', routerLink: '/Overview' },
          { text: 'Deploy Management', icon: 'fas fa-sitemap fa-fw', routerLink: '/Deploymgm' },
          { text: 'Options', icon: 'fas fa-cog fa-fw', routerLink: '/Options' },
          { text: 'Privilege Management', icon: 'fa-solid fa-user-gear', routerLink: '/Privilege' }
        ]
        break;

      default:
        this.menuList = [
          {
            text: 'Monitor',
            icon: 'fa-solid fa-house',
            children: [
              { text: 'System Overview', icon: '', routerLink: '/SystemOverview' },
              { text: 'VM Overview', icon: '', routerLink: '/VMOverview' }
            ]
          },
          {
            text: 'Report',
            icon: 'fa-solid fa-chart-column',
            children: [
              { text: 'Software Report', icon: '', routerLink: '/SoftwareReport' },
              { text: 'Hardware Report', icon: '', routerLink: '/HardwareReport' },
              { text: 'Task Report', icon: '', routerLink: '/TaskReport' }
            ]
          },
          { text: 'Options', icon: 'fa-solid fa-gear', routerLink: '/Options' },
          { text: 'License', icon: 'fa-solid fa-key', routerLink: '/License' },
          { text: 'Demo', icon: 'fa-solid fa-ghost', routerLink: '/Demo' },
          { text: 'Demo2', icon: 'fa-solid fa-ghost', routerLink: '/Demo2' }
        ];
        break;
    }
  }

}
