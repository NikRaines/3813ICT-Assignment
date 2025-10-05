import { TestBed } from '@angular/core/testing';

import { Imgupload } from './imgupload';

describe('Imgupload', () => {
  let service: Imgupload;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Imgupload);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
