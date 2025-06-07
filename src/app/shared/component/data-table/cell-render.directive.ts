import { Directive, ElementRef, Renderer2, input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../service';
import { TableEvent } from '../../../core/enum';

@Directive({
  selector: '[appCellRender]',
  standalone: true
})
export class CellRenderDirective {

  // @Input() cellRender: any = null;
  // @Input() rowData: any = null;
  // @Input() id: any = null;
  // @Input() eventName: string = '';

  cellRender = input.required<any>();
  rowData = input<any>(null);
  id = input<any>(null);
  eventName = input<string>('');

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private eventService: EventService,
    private translate: TranslateService
  ) { }

  ngOnInit() {

    if(this.cellRender() instanceof Node) {
      if(this.eventName()) {
        this.addElementEvent(this.cellRender());
      }
      this.renderer.appendChild(this.el.nativeElement, this.cellRender());
    }

    else if(typeof(this.cellRender()) === 'string') {
      const div = document.createElement('div');
      div.innerHTML = this.translate.instant(this.cellRender());
      this.renderer.appendChild(this.el.nativeElement, div);
    }

    // Angular Material Test
    // else if(typeof(this.cellRender) === 'object') {
    //   this.viewContainerRef.clear();
    //   switch(this.cellRender.type) {
    //     case 'MatProgressBar':
    //       const progressBar = this.viewContainerRef.createComponent(MatProgressBar);
    //       progressBar.instance.mode = 'indeterminate';
    //       this.renderer.appendChild(this.el.nativeElement, progressBar.injector.get(MatProgressBar)._elementRef.nativeElement);
    //       break;
    //   }
    // }
  }

  addElementEvent(element: Node): void {

    element.addEventListener(this.eventName(), event => {
      event.stopPropagation();
      this.eventService.emit({
        id: this.id(),
        eventName: TableEvent.CellEvent,
        data: this.rowData()
      });
    });

  }
}
