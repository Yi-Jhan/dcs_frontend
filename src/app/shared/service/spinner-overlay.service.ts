import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { SpinnerOverlayComponent } from '../component/spinner-overlay/spinner-overlay.component';

@Injectable({
  providedIn: 'root'
})
export class SpinnerOverlayService {
  overlayRef: OverlayRef = this.cdkSpinnerCreate();

  constructor(private overlay: Overlay) { }

  private cdkSpinnerCreate() {
    return this.overlay.create({
      positionStrategy: this.overlay.position()
        .global()
    });
  }

  show() {
    if(!this.overlayRef.hasAttached()) {
      this.overlayRef.attach(new ComponentPortal(SpinnerOverlayComponent))
    }
  }

  hide() {
    this.overlayRef.detach();
  }
}
