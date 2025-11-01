import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NouvelledemandeComponent } from './nouvelledemande.component';

describe('NouvelledemandeComponent', () => {
  let component: NouvelledemandeComponent;
  let fixture: ComponentFixture<NouvelledemandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NouvelledemandeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NouvelledemandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
