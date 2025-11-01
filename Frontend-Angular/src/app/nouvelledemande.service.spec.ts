import { TestBed } from '@angular/core/testing';

import { NouvelledemandeService } from './nouvelledemande.service';

describe('NouvelledemandeService', () => {
  let service: NouvelledemandeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NouvelledemandeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
