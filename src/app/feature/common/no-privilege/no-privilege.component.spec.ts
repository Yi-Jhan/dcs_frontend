import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoPrivilegeComponent } from './no-privilege.component';

describe('NoPrivilegeComponent', () => {
  let component: NoPrivilegeComponent;
  let fixture: ComponentFixture<NoPrivilegeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoPrivilegeComponent]
    });
    fixture = TestBed.createComponent(NoPrivilegeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
