import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { NouvelledemandeComponent } from './nouvelledemande/nouvelledemande.component';
import { SuivdemandeComponent } from './suivdemande/suivdemande.component';
import { LoginComponent } from './login/login.component';
import { MdpoublierComponent } from './mdpoublier/mdpoublier.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DemandesComponent } from './demandes/demandes.component';
import { UsersComponent } from './users/users.component';
import { AddMunicipaliteDialog, ModifyMunicipaliteDialog, MunicipaliteComponent } from './municipalite/municipalite.component';
import { ConfirmDialogComponent } from './demandes/confirm-dialog/confirm-dialog.component';
import { ConfirmDeleteDialogComponent } from './users/confirm-delete-dialog/confirm-delete-dialog.component';
import { ConfirmStatusChangeDialogComponent } from './dialogs/confirm-status-change-dialog/confirm-status-change-dialog.component';
import { AuthService } from './services/auth.service';

// Translation loader factory
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// JWT token getter
export function tokenGetter() {
  return localStorage.getItem('access_token');
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    NouvelledemandeComponent,
    SuivdemandeComponent,
    LoginComponent,
    MdpoublierComponent,
    DashboardComponent,
    DemandesComponent,
    UsersComponent,
    MunicipaliteComponent,
    AddMunicipaliteDialog,
    ModifyMunicipaliteDialog,
    ConfirmDialogComponent,
    ConfirmDeleteDialogComponent,
    ConfirmStatusChangeDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule.forRoot([]), // Empty routes here; actual routes are in AppRoutingModule
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NoopAnimationsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['localhost:8000'], // Adjust to your backend domain
        disallowedRoutes: [] // Optional
      }
    })
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }