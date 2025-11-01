import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmStatusChangeDialogComponent } from './confirm-status-change-dialog.component';

describe('ConfirmStatusChangeDialogComponent', () => {
  let component: ConfirmStatusChangeDialogComponent;
  let fixture: ComponentFixture<ConfirmStatusChangeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmStatusChangeDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmStatusChangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
