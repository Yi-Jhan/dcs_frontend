import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessprofileconfigComponent } from './processprofileconfig.component';

describe('ProcessprofileconfigComponent', () => {
  let component: ProcessprofileconfigComponent;
  let fixture: ComponentFixture<ProcessprofileconfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessprofileconfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessprofileconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
