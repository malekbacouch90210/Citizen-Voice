import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
import { LoginResponse } from '../models/auth.model'; // Import the interface

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loginForm: FormGroup;
  passwordVisible: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  ngOnInit(): void {
    this.translate.setDefaultLang('fr');
    console.log('LoginComponent initialized');
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

  onLogin() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      this.authService.login(loginData.email, loginData.password).subscribe(
        (response: LoginResponse) => {
          console.log('Server response:', response);
          if (response.access && response.refresh) {
            console.log('Auth data stored:', this.authService.getAuthData());
            this.router.navigateByUrl('/dashboard').then(success => {
              console.log('Redirection successful:', success);
            }).catch(err => {
              console.error('Redirection error:', err);
            });
          } else {
            console.error('Missing tokens in response:', response);
            this.errorMessage = 'Erreur lors de la connexion. Tokens manquants.';
            Swal.fire({
              icon: 'error',
              title: 'Oups...',
              text: 'Tokens manquants dans la réponse du serveur.',
            });
          }
        },
        (error) => {
          console.error('Login error:', error);
          this.errorMessage = 'Nom d’utilisateur ou mot de passe incorrect.';
          Swal.fire({
            icon: 'error',
            title: 'Oups...',
            text: 'Nom d’utilisateur ou mot de passe incorrect.',
            confirmButtonText: 'Réessayer'
          });
        }
      );
    } else {
      console.log('Form invalid:', this.loginForm.value);
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      Swal.fire({
        icon: 'error',
        title: 'Oups...',
        text: 'Veuillez remplir tous les champs correctement.',
        confirmButtonText: 'Réessayer'
      });
    }
  }
}