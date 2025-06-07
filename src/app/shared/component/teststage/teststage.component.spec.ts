import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeststageComponent } from './teststage.component';

describe('TeststageComponent', () => {
  let component: TeststageComponent;
  let fixture: ComponentFixture<TeststageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeststageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeststageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
