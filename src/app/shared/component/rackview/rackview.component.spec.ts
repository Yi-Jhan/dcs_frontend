import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RackviewComponent } from './rackview.component';

describe('RackviewComponent', () => {
  let component: RackviewComponent;
  let fixture: ComponentFixture<RackviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RackviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RackviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
