import { CommonModule } from '@angular/common';
import { Component, forwardRef, inject, input, model } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

interface IValidInfo {
  valid: boolean;
  errorMsg: string
}

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {

  form = input.required<FormGroup>();
  controlName = input.required<string>();
  label = input<string>('');
  hasClear = input<boolean>(true);
  type = input('text');
  errorMsg = input('');
  hint = input('');
  suffixIcon = input('');
  // validInfo = input<IValidInfo[]>([{ valid: true, errorMsg: 'msg1' }, { valid: false, errorMsg: 'msg2' }]);

  clearValue(): void {
    this.form().controls[this.controlName()].patchValue('');
  }
}
