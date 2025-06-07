import { Component, OnInit, inject, input, model } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EventService } from '../../../shared/service';
import { CommonModule } from '@angular/common';
import { SharedModule, onDestroyed } from '../../../shared';
import { ChipsInputComponent } from '../chips-input/chips-input.component';
import { SearchBarEvent } from '../../../core/enum';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ChipsInputComponent
  ],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

  destory$ = onDestroyed();

  formBuilder = inject(FormBuilder);
  eventService = inject(EventService);

  id = input.required<string>();
  placeholder = input('i18n_EnterToSearch');
  enteredValue = model<Array<string>>([]);
  dateRangerPicker = input<boolean>(true);
  cancelDateChange = false;

  range: FormGroup = this.formBuilder.group({
    start: null,
    end: null,
  });

  // form = input.required<FormGroup>();

  get formControls() {
    return this.range.controls;
  }

  constructor() {
  }

  ngOnInit(): void {
    this.initEvent();
  }

  initEvent(): void {
    this.eventService.event.pipe(this.destory$()).subscribe(event => {
      switch (event.eventName) {
        case SearchBarEvent.RemoveDateRange:
          this.range.patchValue({
            start: null,
            end: null,
          });
          break;
      }
    });
  }

  dateChange(type: string, e: any): void {
    if (!this.cancelDateChange && e) {
      this.eventService.emit({
        id: this.id(),
        eventName: type === 'start' ? SearchBarEvent.StartDateChange : SearchBarEvent.EndDateChange,
        data: new Date(e)
      });
    }
    else {
      this.cancelDateChange = false;
    }
  }

  closeDatePicker(): void {
    if (this.range.value.start && !this.range.value.end) {
      this.eventService.emit({ id: this.id(), eventName: SearchBarEvent.CancelDateChange });
      this.cancelDateChange = true;
      this.range.patchValue({ start: null });
    }
  }

  clearSerchInput(): void {
    this.eventService.emit({id: this.id(), eventName: SearchBarEvent.ClearSearchInput});
  }
}
