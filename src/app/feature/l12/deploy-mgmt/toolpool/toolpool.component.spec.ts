import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolpoolComponent } from './toolpool.component';

describe('ToolpoolComponent', () => {
  let component: ToolpoolComponent;
  let fixture: ComponentFixture<ToolpoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToolpoolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolpoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
