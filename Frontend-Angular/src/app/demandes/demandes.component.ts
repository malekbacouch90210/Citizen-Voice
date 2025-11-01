import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmStatusChangeDialogComponent } from '../dialogs/confirm-status-change-dialog/confirm-status-change-dialog.component';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-demandes',
  templateUrl: './demandes.component.html',
  styleUrls: ['./demandes.component.scss']
})
export class DemandesComponent implements OnInit {
  demandes: Demande[] = [];
  filteredDemandes: Demande[] = [];
  searchTerm = '';
  isSuperAdmin = false;
  isAdmin = false;
  municipalites: Municipalite[] = [];

  constructor(
    private router: Router,
    private translate: TranslateService,
    private dialog: MatDialog,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.translate.setDefaultLang('fr');
  }

  ngOnInit(): void {
    this.checkUserRole();
    this.fetchDemandes();
    this.fetchMunicipalites();
  }

  checkUserRole(): void {
    const authData = this.authService.getAuthData();
    if (authData && authData.groups) {
      this.isSuperAdmin = authData.groups.includes('superadmin');
      this.isAdmin = authData.groups.includes('admin');
    }
  }

  fetchMunicipalites(): void {
    const token = this.authService.getAccessToken();
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http.get<Municipalite[]>('http://localhost:8000/municipalites/', { headers })
      .subscribe(
        (response) => {
          this.municipalites = response;
        },
        (error) => {
          console.error('Error fetching municipalites:', error);
        }
      );
  }

  fetchDemandes(): void {
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('Token is null. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http.get<Demande[]>('http://localhost:8000/demandes/', { headers })
      .subscribe(
        (response) => {
          this.demandes = response;
          this.filteredDemandes = [...response];
        },
        (error) => {
          console.error('Error fetching demandes:', error);
        }
      );
  }

  filterDemandes(): void {
    this.filteredDemandes = this.demandes.filter((d) =>
      Object.values(d).some((value) =>
        value?.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.filterDemandes();
  }

  openConfirmDialog(demande: Demande): void {
    const previousStatut = demande.statut;

    const dialogRef = this.dialog.open(ConfirmStatusChangeDialogComponent, {
      width: '400px',
      data: { demande }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = this.authService.getAccessToken();
        if (token) {
          this.updateStatut(demande.id, demande.statut, token);
        }
      } else {
        demande.statut = previousStatut;
      }
    });
  }

  updateStatut(id: string, statut: string, token: string): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.put(`http://localhost:8000/demandes/${id}/`, { statut }, { headers })
      .subscribe(
        (response) => {
          console.log('Statut updated successfully:', response);
          Swal.fire('Statut mis à jour avec succès.');
        },
        (error) => {
          console.error('Error updating statut:', error);
        }
      );
  }

  onDeleteRequest(demande: Demande): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const token = this.authService.getAccessToken();
        if (!token) return;

        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        this.http.delete(`http://localhost:8000/demandes/${demande.id}/`, { headers })
          .subscribe(
            () => {
              this.fetchDemandes();
              Swal.fire('Demande supprimée avec succès.');
            },
            (error) => {
              console.error('Error deleting demande:', error);
            }
          );
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  switchLanguage(language: string): void {
    this.translate.use(language);
  }
}

export interface Demande {
  id: string;
  nom_complet: string;
  email: string;
  telephone: string;
  adresse: string;
  request_type: string;
  domaine: string;
  municipalite: Municipalite;
  titre: string;
  description: string;
  piece_jointe?: string | null;
  key?: string | null;
  statut: string;
}

export interface Municipalite {
  id: string;
  name_francais: string;
}