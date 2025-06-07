import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddworkorderComponent } from './addworkorder.component';

describe('AddworkorderComponent', () => {
  let component: AddworkorderComponent;
  let fixture: ComponentFixture<AddworkorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddworkorderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddworkorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
