import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolePrivConfigComponent } from './role-priv-config.component';

describe('RolePrivConfigComponent', () => {
  let component: RolePrivConfigComponent;
  let fixture: ComponentFixture<RolePrivConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RolePrivConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RolePrivConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
