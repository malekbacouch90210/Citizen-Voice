import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  currentLanguage: string = 'fr'; // Langue par défaut
  isLoggedIn: boolean = true; // Vérification de la connexion
  demandes: Demande[] = []; // Liste des demandes récupérées depuis l'API
  totalDemandes: number = 0; // Nombre total de demandes
  traitesDemandes: number = 0; // Nombre de demandes traitées
  tauxTraitement: number = 0; // Pourcentage de demandes traitées
  statsChart: any; // Référence au graphique des statistiques
  municipalityChart: any; // Référence au graphique des municipalités

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngAfterViewInit(): void {
    this.updateCharts();
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      console.log('Utilisateur non connecté, redirection vers /login');
      this.router.navigate(['/login']);
    } else {
      console.log('Utilisateur connecté, accès autorisé');
    }
    // Charger la langue sauvegardée ou utiliser 'fr' par défaut
    const savedLang = localStorage.getItem('lang') || 'fr';
    this.currentLanguage = savedLang;
    this.translate.use(this.currentLanguage);
    this.fetchDemandes();
    this.fetchMunicipalites();
  }
  

  // Changer de langue et sauvegarder dans localStorage
  switchLanguage(language: string): void {
    this.currentLanguage = language;
    this.translate.use(language);
    localStorage.setItem('lang', language); // Sauvegarder la langue
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

            // Appeler les fonctions pour générer les graphiques
            this.generateStatsChart();
            this.generateMunicipalityChart();
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

  // Fonction pour générer le graphique des statistiques
  generateStatsChart(): void {
    const stats = {
      "traité": this.demandes.filter(d => d.statut === 'traité').length,
      'en cours': this.demandes.filter(d => d.statut === 'en cours').length,
      'non traité': this.demandes.filter(d => d.statut === 'non traité').length,
    };

    const statusColors: { [key in 'traité' | 'en cours' | 'non traité']: string } = {
      "traité": "#22c55e",
      "en cours": "#fbbf24",
      "non traité": "#ef4444",
    };

    const chartCanvas = document.getElementById('statsChart') as HTMLCanvasElement;
    if (this.statsChart) {
      this.statsChart.destroy();
    }

    this.statsChart = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels: Object.keys(stats),
        datasets: [{
          label: 'Pourcentage des demandes',
          data: Object.values(stats).map(value => (value / this.demandes.length) * 100),
          backgroundColor: Object.keys(stats).map(key => statusColors[key as 'traité' | 'en cours' | 'non traité']),
          borderRadius: 5,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + '%';
              },
            },
          },
        },
      },
    });
  }

  // Fonction pour générer le graphique des municipalités
  generateMunicipalityChart(): void {
    const municipalityStats: { [key: string]: number } = {};
  
    // Loop through demandes and count the occurrences of each municipality
    this.demandes.forEach(demande => {
      // Directly access name_francais from the 'municipalite' object in Demande
      const municipalityName = demande.municipalite ? demande.municipalite.name_francais : 'Unknown';
  
      // Update the count for the municipality
      municipalityStats[municipalityName] = (municipalityStats[municipalityName] || 0) + 1;
    });
  
    // Destroy the previous chart if it exists
    if (this.municipalityChart) {
      this.municipalityChart.destroy();
    }
  
    // Get the canvas element for the chart
    const chartCanvas = document.getElementById('municipalityChart') as HTMLCanvasElement;
  
    // Generate the new chart using the municipalityStats data
    this.municipalityChart = new Chart(chartCanvas, {
      type: 'doughnut',
      data: {
        labels: Object.keys(municipalityStats),
        datasets: [{
          data: Object.values(municipalityStats).map(value => (value / this.demandes.length) * 100),
          backgroundColor: ["#689D71", "#94a3b8", "#64748b", "#475569"], // You can adjust colors here
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    });
  }
  
  
  municipalites: Municipalite[] = [];
  municipaliteIds: string[] = [];
  fetchMunicipalites(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Le token est nul. Veuillez vous reconnecter.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    console.log('Headers:', headers.keys());

    this.http.get<Municipalite[]>('http://localhost:8000/municipalites/', { headers })
      .subscribe(
        (response) => {
          if (Array.isArray(response)) {
            this.municipalites = response.map(municipalite => {
              return {
                id: municipalite.id,
                name_francais: municipalite.name_francais, // Ne conserver que name_francais
              };
            });

            console.log('Municipalités avec les noms en français:', this.municipalites);
          } else {
            console.error('La réponse du serveur n\'est pas un tableau de municipalités :', response);
          }
        },
        (error) => {
          console.error('Erreur lors de la récupération des municipalités:', error);
        }
      );
  }
  // Définir la méthode updateCharts
  updateCharts(): void {
    this.generateStatsChart();
    this.generateMunicipalityChart();
  }
}

// Déclaration de l'interface Demande
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
  municipaliteDisplayName?: string;
}

export interface Municipalite {
  id: string;
  name_francais: string;
}
