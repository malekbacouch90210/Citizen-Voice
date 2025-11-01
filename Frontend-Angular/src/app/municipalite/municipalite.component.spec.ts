import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MunicipaliteComponent } from './municipalite.component';

describe('MunicipaliteComponent', () => {
  let component: MunicipaliteComponent;
  let fixture: ComponentFixture<MunicipaliteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MunicipaliteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MunicipaliteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
