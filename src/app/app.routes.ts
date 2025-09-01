import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployesComponent } from './components/employes/employes.component';
import { GradesComponent } from './components/grades/grades.component';
import { DepartementsComponent } from './components/departements/departements.component';
import { MissionsComponent } from './components/missions/missions.component';
import { ParametresComponent } from './components/parametres/parametres.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'employes', component: EmployesComponent, canActivate: [authGuard] },
  { path: 'grades', component: GradesComponent, canActivate: [authGuard] },
  { path: 'departements', component: DepartementsComponent, canActivate: [authGuard] },
  { path: 'missions', component: MissionsComponent, canActivate: [authGuard] },
  { path: 'parametres', component: ParametresComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
