import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import _ from 'lodash';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-rackview',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule
  ],
  templateUrl: './rackview.component.html',
  styleUrls: ['./rackview.component.scss']
})
export class RackviewComponent implements OnInit {
  @Input() rackdata: Array<any> = new Array<any>();
  @Input() racksize:number = 42;
  @Output() selectNode = new EventEmitter<any>();
  rackNode: Array<any> = new Array<any>();
  rackviewData: Array<any> = new Array<any>();
  filterrackviewData: Array<any> = new Array<any>();
  input_chips: Array<any> = new Array<any>();

  constructor() { }

  ngOnInit(): void {
    this.createRack();
  }

  ngOnChanges() {
    this.filterRack();
  }

  createRack() {
    for (let n = this.racksize; n > 0; n--) {
       this.rackNode.push(n);
    }
  }

  clickRacknode(data:any) {
    this.selectNode.emit(data);
  }

  filterRack() {
    var filterResult = _.filter(this.rackdata, data => { return data.cabinet });
    this.rackviewData = _.chain(filterResult)
      .sortBy('cabinet')
      .groupBy('cabinet')
      .map((val, key) => ({ device: key, data: val }))
      .value();
  }

  rackContainer(size: any) {
    return new Array(Number(size));
 }
}
