import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymgmComponent } from './deploymgm.component';

describe('DeploymgmComponent', () => {
  let component: DeploymgmComponent;
  let fixture: ComponentFixture<DeploymgmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeploymgmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeploymgmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
