import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = true;
  showHeader: boolean = true;

  constructor(
    public translate: TranslateService,
    private router: Router,
    private authService: AuthService
  ) {
    this.translate.setDefaultLang('fr'); // Définir la langue par défaut
  }

  ngOnInit(): void {
    
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showHeader = !(event.url.includes('/dashboard') || event.url.includes('/demandes') || event.url.includes('/users'|| event.url.includes('/adduser') ) || event.url.includes('/municipalite') );
      }
    });
  }
  switchLanguage(language: string): void {
    this.translate.use(language);
  }
}
