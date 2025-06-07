import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Processprofile } from './processprofile.component';

describe('Processprofile', () => {
  let component: Processprofile;
  let fixture: ComponentFixture<Processprofile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Processprofile ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Processprofile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
