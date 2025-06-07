import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, input, model } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { ENTER } from '@angular/cdk/keycodes';
import { EventService } from '../../service';
import { onDestroyed } from '../../common-lib';
import { ChipsInputEvent, SearchBarEvent } from '../../../core/enum';
import _ from 'lodash';

@Component({
  selector: 'app-chips-input',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './chips-input.component.html',
  styleUrl: './chips-input.component.scss'
})
export class ChipsInputComponent implements OnInit {

  destroy$ = onDestroyed();

  id = input.required<string>();
  placeholder = input<string>('');
  hint = input<string>('');
  isSearchBar = input<boolean>(false);
  valid = input<boolean>(true);
  chips = model<Array<string>>([]);
  label = input<string>('');

  eventService = inject(EventService);
  separatorKeysCodes: number[] = [ENTER];

  constructor() { }

  ngOnInit(): void {
    this.initEvent();
    this.uniqChips();
  }

  initEvent(): void {
    this.eventService.event.pipe(this.destroy$()).subscribe(event => {
      switch(event.eventName) {
        case SearchBarEvent.ClearSearchInput:
          if(event.id === this.id()) {
            this.removeAll();
          }
          break;
      }
    });
  }

  add(event: any): void {
    const value = (event.value || '').trim();

    if (value && _.indexOf(this.chips(), value) === -1) {
      this.chips().push(value);
    }

    event.chipInput!.clear();
    this.eventService.emit({id: this.id(), eventName: ChipsInputEvent.InputChange, data: this.chips()});
  }

  remove(filter: string): void {
    _.remove(this.chips(), item => {
      return item === filter;
    });

    this.eventService.emit({id: this.id(), eventName: ChipsInputEvent.InputChange, data: this.chips()});
  }

  removeAll(): void {
    this.chips.set([]);
    this.eventService.emit({id: this.id(), eventName: ChipsInputEvent.InputChange, data: this.chips()});
  }

  uniqChips() {
    this.chips.set(_.uniq(this.chips()));
  }
}
