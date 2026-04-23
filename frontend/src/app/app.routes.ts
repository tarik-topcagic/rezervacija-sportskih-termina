import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { PendingChangesGuard } from './guards/pending-changes.guard';
import { SearchUsersComponent } from './search-users/search-users.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { SearchGroupsComponent } from './search-groups/search-groups.component';
import { SettingsComponent } from './settings/settings.component';
import { GroupDetailsComponent } from './group-details/group-details.component';
import { NotificationsComponent } from './notifications/notifications.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'registracija', component: RegisterComponent },
    { path: 'prijava', component: LoginComponent },
    { path: 'pocetna', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'moj-profil', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'postavke-profila', component: ProfileEditComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
    { path: 'postavke', component: SettingsComponent, canActivate: [AuthGuard] },
    { path: 'pretraga-korisnika', component: SearchUsersComponent, canActivate: [AuthGuard] },
    { path: 'korisnicki-profil/:username', component: UserProfileComponent, canActivate: [AuthGuard] },
    { path: 'grupe', component: SearchGroupsComponent, canActivate: [AuthGuard] },
    { path: 'grupe/:id', component: GroupDetailsComponent, canActivate: [AuthGuard] },
    { path: 'obavijesti', component: NotificationsComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '' }
];
