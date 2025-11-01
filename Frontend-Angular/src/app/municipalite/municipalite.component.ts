import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

interface Municipalite {
  id: string;
  name_francais: string;
}

@Component({
  selector: 'app-municipalite',
  templateUrl: './municipalite.component.html',
  styleUrls: ['./municipalite.component.scss']
})
export class MunicipaliteComponent implements OnInit {
  newMunicipaliteName: string = '';
  selectedMunicipalite: Municipalite | null = null;
  municipalities: Municipalite[] = [];
  filteredMunicipalities: Municipalite[] = [];
  searchMunicipality: string = '';
  isSuperAdmin = false;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private dialog: MatDialog,
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Set default language
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  ngOnInit(): void {
    this.checkUserRole();
    this.fetchMunicipalities(); // Fetch municipalities for both superadmin and admin
  }

  checkUserRole(): void {
    const authData = this.authService.getAuthData();
    if (authData && authData.groups) {
      this.isSuperAdmin = authData.groups.includes('superadmin');
    }
  }

  fetchMunicipalities(): void {
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('No token found. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<Municipalite[]>('http://localhost:8000/municipalites/', { headers })
      .subscribe(
        (response) => {
          if (Array.isArray(response)) {
            this.municipalities = response;
            this.filteredMunicipalities = [...this.municipalities];
          } else {
            console.error('Server response is not an array:', response);
            this.municipalities = [];
            this.filteredMunicipalities = [];
          }
        },
        (error) => {
          console.error('Error fetching municipalities:', error);
          this.municipalities = [];
          this.filteredMunicipalities = [];
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('error'),
            text: this.translate.instant('error_fetching_municipalities')
          });
        }
      );
  }

  openAddMunicipaliteDialog(): void {
    const dialogRef = this.dialog.open(AddMunicipaliteDialog, {
      width: '400px',
      data: { newMunicipaliteName: this.newMunicipaliteName },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addMunicipalite(result.newMunicipaliteName);
        this.newMunicipaliteName = ''; // Reset input
      }
    });
  }

  addMunicipalite(name: string): void {
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('Le token est nul. Veuillez vous reconnecter.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const newMunicipality: Municipalite = { id: '', name_francais: name };
    this.http.post<Municipalite>('http://localhost:8000/municipalites/', newMunicipality, { headers }).subscribe(
      (response) => {
        console.log('Municipalité ajoutée avec succès', response);
        this.fetchMunicipalities(); // Refresh the list after adding
        Swal.fire(this.translate.instant('municipality_added_success'));
      },
      (error) => {
        console.error('Erreur lors de l\'ajout de la municipalité', error);
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('error'),
          text: this.translate.instant('error_adding_municipality')
        });
      }
    );
  }

  openModifyMunicipaliteDialog(municipalite:Municipalite): void {
    this.selectedMunicipalite = { ...municipalite }; // Create a copy to avoid direct modification
    const dialogRef = this.dialog.open(ModifyMunicipaliteDialog, {
      width: '400px',
      data: { selectedMunicipalite: this.selectedMunicipalite },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.selectedMunicipalite) {
        this.modifyMunicipalite(this.selectedMunicipalite);
        this.selectedMunicipalite = null; // Reset selection
      }
    });
  }

  modifyMunicipalite(municipalite: Municipalite): void {
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('Le token est nul. Veuillez vous reconnecter.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http.put<Municipalite>(`http://localhost:8000/municipalites/${municipalite.id}/`, municipalite, { headers }).subscribe(
      (response) => {
        console.log('Municipalité modifiée avec succès', response);
        this.fetchMunicipalities(); // Refresh the list after modifying
        Swal.fire(this.translate.instant('municipality_updated_success'));
      },
      (error) => {
        console.error('Erreur lors de la modification de la municipalité', error);
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('error'),
          text: this.translate.instant('error_updating_municipality')
        });
      }
    );
  }

  handleDeleteMunicipality(municipalite: Municipalite): void {
    if (!municipalite || !municipalite.id) {
      console.error('Municipality ID is missing or undefined');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDeleteMunicipalityDialog, {
      width: '300px',
      data: { id: municipalite.id, name: municipalite.name_francais }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const token = this.authService.getAccessToken();
        if (!token) {
          console.error('No token found. Please log in again.');
          return;
        }

        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        this.http.delete(`http://localhost:8000/municipalites/${municipalite.id}/`, { headers })
          .subscribe(
            () => {
              this.fetchMunicipalities();
              Swal.fire(this.translate.instant('municipality_deleted_success'));
            },
            (error) => {
              console.error('Error deleting municipality:', error);
              Swal.fire({
                icon: 'error',
                title: this.translate.instant('error'),
                text: this.translate.instant('error_deleting_municipality')
              });
            }
          );
      }
    });
  }

  filterMunicipalities(): void {
    this.filteredMunicipalities = this.municipalities.filter((municipalite) =>
      municipalite.name_francais?.toLowerCase().includes(this.searchMunicipality.toLowerCase())
    );
  }

  onMunicipalitySearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchMunicipality = target.value;
    this.filterMunicipalities();
  }

  switchLanguage(language: string): void {
    this.translate.use(language);
  }
}

// Inline Dialog Components
@Component({
  selector: 'app-add-municipalite-dialog',
  template: `
    <h2 mat-dialog-title>{{ 'add_municipality' | translate }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill">
        <mat-label>{{ 'municipality_name' | translate }}</mat-label>
        <input matInput [(ngModel)]="data.newMunicipaliteName" name="newMunicipaliteName" required />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="dialogRef.close()">{{ 'cancel' | translate }}</button>
      <button mat-button (click)="dialogRef.close({ newMunicipaliteName: data.newMunicipaliteName })" [disabled]="!data.newMunicipaliteName">
        {{ 'save' | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class AddMunicipaliteDialog {
  constructor(
    public dialogRef: MatDialogRef<AddMunicipaliteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}

@Component({
  selector: 'app-modify-municipalite-dialog',
  template: `
    <h2 mat-dialog-title>{{ 'edit_municipality' | translate }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill">
        <mat-label>{{ 'municipality_name' | translate }}</mat-label>
        <input matInput [(ngModel)]="data.selectedMunicipalite.name_francais" name="name_francais" required />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="dialogRef.close()">{{ 'cancel' | translate }}</button>
      <button mat-button (click)="dialogRef.close(data.selectedMunicipalite)" [disabled]="!data.selectedMunicipalite.name_francais">
        {{ 'save' | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ModifyMunicipaliteDialog {
  constructor(
    public dialogRef: MatDialogRef<ModifyMunicipaliteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}

@Component({
  selector: 'app-confirm-delete-municipality-dialog',
  template: `
    <div class="pop-up">
      <h2>{{ 'confirm_delete_municipality'}}</h2>
      <p>{{ 'confirm_delete_message'}} {{ data.name }} ?</p>
      <div class="button-container">
        <button class="button cancel" (click)="onNoClick()">{{ 'cancel'}}</button>
        <button class="button delete" (click)="onConfirm()">{{ 'delete'}}</button>
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
export class ConfirmDeleteMunicipalityDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteMunicipalityDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; name: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false); // Close dialog with false
  }

  onConfirm(): void {
    this.dialogRef.close(true); // Close dialog with true
  }
}