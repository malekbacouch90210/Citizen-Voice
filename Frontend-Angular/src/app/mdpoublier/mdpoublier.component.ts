import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Importer HttpClient
import Swal from 'sweetalert2';
@Component({
  selector: 'app-mdpoublier',
  templateUrl: './mdpoublier.component.html',
  styleUrls: ['./mdpoublier.component.scss'],
})
export class MdpoublierComponent {
  isLoading: boolean = false;
  email: string = '';
  message: string = '';

  constructor(
    private translate: TranslateService,
    private router: Router,
    private http: HttpClient // Injecter HttpClient
  ) {}

  onSubmit() {
    if (this.isValidEmail(this.email)) {
      this.isLoading = true;

      // Données à envoyer à l'API
      const resetData = { email: this.email };

      // Envoyer la requête POST à l'API
      this.http.post('http://localhost:8000/authentification/reset-password/request/', resetData)
        .subscribe(
          (response) => {
            this.isLoading = false;
            this.message = this.translate.instant('EMAIL_SENT', { email: this.email });
            Swal.fire({
              icon: 'success',
              title: 'Succès !',
              text: 'Un email a été envoyé à ' + this.email + '.',
              confirmButtonText: 'OK'
            });
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          (error) => {
            this.isLoading = false;
            console.error('Erreur lors de la réinitialisation du mot de passe:', error);
            this.message = this.translate.instant('RESET_PASSWORD_ERROR');
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'L\'email saisi est invalide. Veuillez vérifier et réessayer.',
              confirmButtonText: 'OK'
            });
          }
        );
    } else {
      this.message = this.translate.instant('INVALID_EMAIL');
    }
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }
}