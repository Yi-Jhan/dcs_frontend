import { EventEmitter, Injectable, Output } from '@angular/core';
import { IEvent } from '../../core/model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  @Output() event: EventEmitter<IEvent> = new EventEmitter();
  // event = output<IEvent>();

  emit(e: IEvent): void {
    this.event.emit(e);
  }

}
