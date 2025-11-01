import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-suivdemande',
  templateUrl: './suivdemande.component.html',
  styleUrls: ['./suivdemande.component.scss']
})
export class SuivdemandeComponent implements OnInit {
  demandes: Demande[] = [];
  currentLanguage: string = 'fr';
  trackingForm: FormGroup = this.fb.group({
    key: ['', [Validators.required, this.trackingNumberValidator()]]
  });
  message: string = '';
  isSuccess: boolean = false;

  constructor(private translate: TranslateService,private http: HttpClient, private fb: FormBuilder) {
    this.translate.setDefaultLang('fr');
  }
  ngOnInit() {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      this.switchLanguage(savedLang);
    }
  }
  trackingNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isValid = /^[A-Z0-9]{6}$/i.test(control.value);
      return isValid ? null : { 'invalidTrackingNumber': true };
    };
  }
  

  switchLanguage(language: string) {
    this.translate.use(language);
    this.currentLanguage = language;
    localStorage.setItem('language', language);
  }

  get textDirection() {
    return this.currentLanguage === 'ar' ? 'rtl-text' : '';
  }

  onSubmit() {
    this.trackingForm.markAllAsTouched();
    if (this.trackingForm.valid) {
      this.message = this.translate.instant('code suivi valide');
      this.isSuccess = true;
  
      // Validation du key
      const key = this.trackingForm.get('key')?.value;
      if (key && key.length === 6) {
  
        // Récupération des données depuis l'API
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
  
        this.http.get<Demande[]>('http://localhost:8000/demandes/', { headers })
          .subscribe(
            (response) => {
              if (Array.isArray(response)) {
                // Filtrage de la demande correspondante au key
                const demandeTrouvee = response.find(demande => demande.key === key);
                if (demandeTrouvee) {
                  this.demandes = [demandeTrouvee]; // Afficher la demande correspondante
                } else {
                  console.error('Aucune demande trouvée pour ce code de suivi');
                  this.demandes = []; // Si aucune demande correspondante n'est trouvée
                }
              } else {
                console.error('La réponse du serveur n\'est pas un tableau de demandes :', response);
                this.demandes = []; // Réinitialiser en cas de réponse invalide
              }
            },
            (error) => {
              console.error('Erreur lors de la récupération des demandes:', error);
              this.demandes = []; // Réinitialiser les données en cas d'erreur
            }
          );
        
        
      } else {
        this.message = this.translate.instant('Veuillez entrer un code de suivi valide');
        this.isSuccess = false;
        this.demandes = []; // Réinitialiser les demandes en cas d'erreur
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.message,
          confirmButtonText: 'OK'
        });
      }
    } else {
      this.message = this.translate.instant('code suivi invalide');
      this.isSuccess = false;
      this.demandes = []; // Réinitialiser les données en cas d'erreur
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: this.message,
        confirmButtonText: 'OK'
      });
    }
  }
  
  
}  
export interface Demande {
  titre: string;
  key?: string | null;
  statut: string;
}
