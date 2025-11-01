import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NouvelledemandeComponent } from './nouvelledemande/nouvelledemande.component';
import { SuivdemandeComponent } from './suivdemande/suivdemande.component';
import { HomeComponent } from './home/home.component';
import { MdpoublierComponent } from './mdpoublier/mdpoublier.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DemandesComponent } from './demandes/demandes.component';
import { UsersComponent } from './users/users.component';
import { MunicipaliteComponent } from './municipalite/municipalite.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'nouvelledemande', component: NouvelledemandeComponent },
  { path: 'suivdemande', component: SuivdemandeComponent },
  { path: 'mdpoublier', component: MdpoublierComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'demandes', component: DemandesComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'municipalites', component: MunicipaliteComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }