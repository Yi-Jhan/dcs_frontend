import { TestBed } from '@angular/core/testing';

import { ChipsInputService } from './chips-input.service';

describe('ChipsInputService', () => {
  let service: ChipsInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChipsInputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
