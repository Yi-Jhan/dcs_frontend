import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { privilegeResolver } from './privilege.resolver';

describe('privilegeResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => privilegeResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
