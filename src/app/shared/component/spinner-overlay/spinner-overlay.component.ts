import { Component, OnInit } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner-overlay',
  standalone: true,
  imports: [
    MatProgressSpinner
  ],
  templateUrl: './spinner-overlay.component.html',
  styleUrls: ['./spinner-overlay.component.scss']
})
export class SpinnerOverlayComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
