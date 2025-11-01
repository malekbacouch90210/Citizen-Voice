import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'voixcitoyen';
  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  switchLanguage(language: string) {
    this.translate.use(language); 
  }
}
