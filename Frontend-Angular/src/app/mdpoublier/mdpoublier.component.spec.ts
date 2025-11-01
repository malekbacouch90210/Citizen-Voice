import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MdpoublierComponent } from './mdpoublier.component';

describe('MdpoublierComponent', () => {
  let component: MdpoublierComponent;
  let fixture: ComponentFixture<MdpoublierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MdpoublierComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MdpoublierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
