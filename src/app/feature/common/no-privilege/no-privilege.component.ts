import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared';

@Component({
  selector: 'app-no-privilege',
  standalone: true,
  imports: [SharedModule, CommonModule],
  template: `
    <p>
      {{ 'i18n_NoPermissionAccess' | translate }}
    </p>
  `,
  styles: [
  ]
})
export class NoPrivilegeComponent {

}
