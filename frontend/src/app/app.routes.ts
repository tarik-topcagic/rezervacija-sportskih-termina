import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'registracija', component: RegisterComponent },
    { path: 'prijava', component: LoginComponent },
    { path: 'pocetna', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'moj-profil', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'postavke-profila', component: ProfileEditComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '' }
];
