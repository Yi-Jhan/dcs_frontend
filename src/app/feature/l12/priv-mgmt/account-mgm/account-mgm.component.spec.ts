import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountMgmComponent } from './account-mgm.component';

describe('AccountMgmComponent', () => {
  let component: AccountMgmComponent;
  let fixture: ComponentFixture<AccountMgmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountMgmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountMgmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
