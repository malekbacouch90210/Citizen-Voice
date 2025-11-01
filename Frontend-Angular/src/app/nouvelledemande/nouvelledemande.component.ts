import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-nouvelledemande',
  templateUrl: './nouvelledemande.component.html',
  styleUrls: ['./nouvelledemande.component.scss']
})
export class NouvelledemandeComponent implements OnInit {
  requestForm!: FormGroup;
  successMessage: string | null = null;
  errorMessage:string | null =null;
  selectedMunicipalite: string = '';
  municipalites: any[] = []; 
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.translate.setDefaultLang('fr');
    this.http.get<any[]>('http://localhost:8000/municipalites/').subscribe(
      (data) => {
        this.municipalites = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des municipalités', error);
      }
    );
  }
  

  private initializeForm(): void {
    this.requestForm = this.fb.group({
      nom_complet: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      request_type: ['', Validators.required],
      adresse:['', Validators.required],
      domaine: ['', Validators.required],
      titre: ['', Validators.required],
      description: ['', Validators.required],
      municipalite: ['', Validators.required], 
      piece_jointe: [null]
    });
  }
  onFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.requestForm.get('piece_jointe')?.setValue(files);
    } else {
      this.requestForm.get('piece_jointe')?.setValue(null);
    }
  }
  onSubmit(): void {
    if (this.requestForm.valid) {
      const formData = new FormData();
  
      // Append other form fields
      Object.keys(this.requestForm.controls).forEach(key => {
        if (key !== 'piece_jointe') {
          formData.append(key, this.requestForm.get(key)?.value);
        }
      });
  
      // Append files for 'piece_jointe'
      const files = this.requestForm.get('piece_jointe')?.value;
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append('piece_jointe', files[i], files[i].name);
        }
      }
  
      // Log the FormData to check what is being sent
      for (let pair of (formData as any).entries()) {
        console.log(pair[0], pair[1]);
      }
  
      // Send the FormData to the backend
      this.http.post('http://localhost:8000/demandes/', formData)
        .subscribe(
          (response) => {
            console.log('Demande soumise avec succès:', response);
            this.successMessage = 'Votre demande a été soumise avec succès.';
            this.errorMessage = null;
            Swal.fire("Votre demande a été soumise avec succès.");
            this.requestForm.reset();
          },
          (error) => {
            console.error('Erreur lors de la soumission de la demande:', error);
            this.successMessage = null;
            this.errorMessage = 'Une erreur s\'est produite lors de la soumission de votre demande. Veuillez réessayer.';
          }
        );
    } else {
      this.markFormGroupTouched(this.requestForm);
      this.successMessage = null;
      this.errorMessage = 'Veuillez remplir tous les champs correctement avant de soumettre.';
    }
  }
 

  switchLanguage(language: string): void {
    this.translate.use(language);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  resetForm() {
    this.requestForm.reset();
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
}
export interface Municipalite {
  id: string;
  name_francais: string;
}


