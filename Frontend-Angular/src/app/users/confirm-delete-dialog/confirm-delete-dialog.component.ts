import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-dialog',
  template: `
    <div class="pop-up">
      <h2>Confirmer la suppression</h2>
      <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
      <div class="button-container">
        <button class="button cancel" (click)="onNoClick()">Annuler</button>
        <button class="button delete" (click)="onConfirm()">Supprimer</button>
      </div>
    </div>
  `,
  styles: [`
    .pop-up {
      background-color: #fff;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      width: 250px;
      text-align: center;
    }

    .pop-up h2 {
      font-size: 18px;
      margin-bottom: 10px;
    }

    .pop-up p {
      font-size: 14px;
      margin-bottom: 20px;
    }

    .button-container {
      display: flex;
      justify-content: space-around;
    }

    .button {
      padding: 8px 15px;
      font-size: 12px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .button.cancel {
      background-color: #ccc;
      color: #333;
    }

    .button.cancel:hover {
      background-color: #bbb;
    }

    .button.delete {
      background-color: #e94e77;
      color: #fff;
    }

    .button.delete:hover {
      background-color: #d43d5c;
    }
  `]
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false); // Close dialog with false
  }

  onConfirm(): void {
    this.dialogRef.close(true); // Close dialog with true
  }
}
