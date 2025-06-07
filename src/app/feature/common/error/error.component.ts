import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [SharedModule, CommonModule],
  template: `
    <p>
      {{ 'i18n_PageNotFound' | translate }}
    </p>
  `,
  styles: []
})
export class ErrorComponent {

}
