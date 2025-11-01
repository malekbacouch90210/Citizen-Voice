import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuivdemandeComponent } from './suivdemande.component';

describe('SuivdemandeComponent', () => {
  let component: SuivdemandeComponent;
  let fixture: ComponentFixture<SuivdemandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuivdemandeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuivdemandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
