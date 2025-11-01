import { Component,OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  demandes: Demande[] = [];
  totalDemandes: number = 0;
  traitesDemandes: number = 0;
  tauxTraitement: number = 0;
  currentLanguage: string = 'fr';
  constructor(private translate: TranslateService,private http: HttpClient) {
    this.translate.setDefaultLang('fr'); 
  }
  ngOnInit(): void {
    this.translate.use(this.currentLanguage);
    this.fetchDemandes();
  }
  switchLanguage(language: string) {
    this.translate.use(language); 
  }
  fetchDemandes(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Le token est nul. Veuillez vous reconnecter.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    this.http.get<Demande[]>('http://localhost:8000/demandes/', { headers })
      .subscribe(
        (response) => {
          if (Array.isArray(response)) {
            this.demandes = response;

            // Calculer les statistiques
            this.totalDemandes = this.getTotalDemandes();
            this.traitesDemandes = this.getDemandesTraitees();
            this.tauxTraitement = this.getTauxTraitement();
          } else {
            console.error('La réponse du serveur n\'est pas un tableau de demandes :', response);
          }
        },
        (error) => {
          console.error('Erreur lors de la récupération des demandes:', error);
        }
      );
  }

  // Fonction pour obtenir le nombre total de demandes
  getTotalDemandes(): number {
    return this.demandes.length;
  }

  // Fonction pour obtenir le nombre de demandes traitées
  getDemandesTraitees(): number {
    return this.demandes.filter(demande => demande.statut.toLowerCase() === 'traité').length;
  }

  // Fonction pour calculer le taux de traitement (%)
  getTauxTraitement(): number {
    if (this.totalDemandes === 0) return 0; // Éviter division par zéro
    return parseFloat(((this.traitesDemandes / this.totalDemandes) * 100).toFixed(2)); // Convertir en nombre
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
  municipalite: number;
  titre: string;
  description: string;
  piece_jointe?: string | null;
  key?: string | null;
  statut: string;
  municipaliteDisplayName?: string;
}

