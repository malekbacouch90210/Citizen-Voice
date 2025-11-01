import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html', // Ensure this matches the file name exactly
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('fr'); // Sets French as the default language
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Switches to the specified language
  }
}