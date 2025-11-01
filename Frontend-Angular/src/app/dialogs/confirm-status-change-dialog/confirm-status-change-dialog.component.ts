import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-status-change-dialog',
  template: `
    <h2 class="dialog-title">Changer le statut</h2>
    <p class="dialog-content">Êtes-vous sûr de vouloir changer le statut de cette demande ?</p>
    <div class="dialog-actions">
      <button mat-button class="cancel-button" (click)="cancel()">Annuler</button>
      <button mat-button color="primary" class="confirm-button" (click)="confirm()">Oui</button>
    </div>
  `,
  styles: [
    `
      /* Style pour le titre */
      .dialog-title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin-bottom: 20px;
      }

      /* Style pour le contenu du modal */
      .dialog-content {
        font-size: 16px;
        color: #555;
        margin-bottom: 30px;
      }

      /* Style pour les boutons */
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      .cancel-button {
        background-color: #f44336; /* Rouge */
        color: white;
        border-radius: 5px;
        padding: 10px 20px;
        font-weight: bold;
        transition: background-color 0.3s ease;
      }

      .cancel-button:hover {
        background-color: #e53935; /* Rouge plus foncé */
      }

      .confirm-button {
        background-color: #4caf50; /* Vert */
        color: white;
        border-radius: 5px;
        padding: 10px 20px;
        font-weight: bold;
        transition: background-color 0.3s ease;
      }

      .confirm-button:hover {
        background-color: #45a049; /* Vert plus foncé */
      }

      /* Style du fond du modal */
      ::ng-deep .mat-dialog-container {
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
      }

      
    `,
  ],
})
export class ConfirmStatusChangeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmStatusChangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; statut: string }
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
