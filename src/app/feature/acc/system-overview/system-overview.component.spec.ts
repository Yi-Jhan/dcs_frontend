import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemOverviewComponent } from './system-overview.component';

describe('SystemOverviewComponent', () => {
  let component: SystemOverviewComponent;
  let fixture: ComponentFixture<SystemOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SystemOverviewComponent]
    });
    fixture = TestBed.createComponent(SystemOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
