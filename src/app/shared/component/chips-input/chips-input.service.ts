import { Injectable } from '@angular/core';
import { EventService } from '../../service';
import { IEvent } from '../../../core/model';

@Injectable({
  providedIn: 'root'
})
export class ChipsInputService {

  constructor(
    private eventService: EventService
  ) { }

  eventHandler(id: string, eventName: string, data: any): void {
    const e: IEvent = { id, eventName, data };
    this.eventService.emit(e);
  }
}
