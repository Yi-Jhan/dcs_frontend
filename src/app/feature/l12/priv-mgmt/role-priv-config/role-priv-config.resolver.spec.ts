import { TestBed } from '@angular/core/testing';

import { RolePrivConfigResolver } from './role-priv-config.resolver';

describe('RolePrivConfigResolver', () => {
  let resolver: RolePrivConfigResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(RolePrivConfigResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
