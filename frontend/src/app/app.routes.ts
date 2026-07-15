import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ProfileComponent } from './profile/profile.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { PendingChangesGuard } from './guards/pending-changes.guard';
import { SearchUsersComponent } from './search-users/search-users.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { SearchGroupsComponent } from './search-groups/search-groups.component';
import { SportsArenasComponent } from './sports-arenas/sports-arenas.component';
import { SettingsComponent } from './settings/settings.component';
import { GroupDetailsComponent } from './group-details/group-details.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ArenaDetailsComponent } from './arena-details/arena-details.component';
import { ReservationPaymentComponent } from './reservation-payment/reservation-payment.component';
import { MyReservationsComponent } from './my-reservations/my-reservations.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'profile/edit', component: ProfileEditComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard] },
    { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
    { path: 'users', component: SearchUsersComponent, canActivate: [AuthGuard] },
    { path: 'users/:username', component: UserProfileComponent, canActivate: [AuthGuard] },
    { path: 'sports-arenas', component: SportsArenasComponent, canActivate: [AuthGuard] },
    { path: 'sports-arenas/:id', component: ArenaDetailsComponent, canActivate: [AuthGuard] },
    { path: 'payment', component: ReservationPaymentComponent, canActivate: [AuthGuard] },
    { path: 'my-reservations', component: MyReservationsComponent, canActivate: [AuthGuard] },
    { path: 'groups', component: SearchGroupsComponent, canActivate: [AuthGuard] },
    { path: 'groups/:id', component: GroupDetailsComponent, canActivate: [AuthGuard] },
    {
      path: 'groups/:id/chat',
      loadComponent: () => import('./group-chat/group-chat.component').then((module) => module.GroupChatComponent),
      canActivate: [AuthGuard],
    },
    { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
    {
      path: 'messages',
      loadComponent: () => import('./messages/messages.component').then((module) => module.MessagesComponent),
      canActivate: [AuthGuard],
    },
    {
      path: 'messages/private/:conversationId',
      loadComponent: () => import('./private-chat/private-chat.component').then((module) => module.PrivateChatComponent),
      canActivate: [AuthGuard],
    },
    {
      path: 'admin',
      loadComponent: () => import('./admin/admin-dashboard/admin-dashboard.component').then((module) => module.AdminDashboardComponent),
      canActivate: [AuthGuard, AdminGuard],
    },
    {
      path: 'admin/users',
      loadComponent: () => import('./admin/admin-users/admin-users.component').then((module) => module.AdminUsersComponent),
      canActivate: [AuthGuard, AdminGuard],
    },
    {
      path: 'admin/groups',
      loadComponent: () => import('./admin/admin-groups/admin-groups.component').then((module) => module.AdminGroupsComponent),
      canActivate: [AuthGuard, AdminGuard],
    },
    {
      path: 'admin/arenas',
      loadComponent: () => import('./admin/admin-arenas/admin-arenas.component').then((module) => module.AdminArenasComponent),
      canActivate: [AuthGuard, AdminGuard],
    },
    {
      path: 'admin/arenas/new',
      loadComponent: () => import('./admin/admin-arenas/admin-arenas.component').then((module) => module.AdminArenasComponent),
      canActivate: [AuthGuard, AdminGuard],
    },
    {
      path: 'admin/arenas/:id/edit',
      loadComponent: () => import('./admin/admin-arenas/admin-arenas.component').then((module) => module.AdminArenasComponent),
      canActivate: [AuthGuard, AdminGuard],
    },
    {
      path: 'admin/reservations',
      loadComponent: () => import('./admin/admin-reservations/admin-reservations.component').then((module) => module.AdminReservationsComponent),
      canActivate: [AuthGuard, AdminGuard],
    },
    {
      path: 'admin/notifications',
      loadComponent: () => import('./admin/admin-notifications/admin-notifications.component').then((module) => module.AdminNotificationsComponent),
      canActivate: [AuthGuard, AdminGuard],
    },
    { path: 'registracija', redirectTo: 'register', pathMatch: 'full' },
    { path: 'prijava', redirectTo: 'login', pathMatch: 'full' },
    { path: 'pocetna', redirectTo: 'home', pathMatch: 'full' },
    { path: 'moj-profil', redirectTo: 'profile', pathMatch: 'full' },
    { path: 'postavke-profila', redirectTo: 'profile/edit', pathMatch: 'full' },
    { path: 'postavke', redirectTo: 'settings', pathMatch: 'full' },
    { path: 'pretraga-korisnika', redirectTo: 'users', pathMatch: 'full' },
    { path: 'sportski-tereni', redirectTo: 'sports-arenas', pathMatch: 'full' },
    { path: 'placanje', redirectTo: 'payment', pathMatch: 'full' },
    { path: 'moje-rezervacije', redirectTo: 'my-reservations', pathMatch: 'full' },
    { path: 'korisnicki-profil/:username', redirectTo: 'users/:username', pathMatch: 'full' },
    { path: 'grupe', redirectTo: 'groups', pathMatch: 'full' },
    { path: 'grupe/:id', redirectTo: 'groups/:id', pathMatch: 'full' },
    { path: 'grupe/:id/chat', redirectTo: 'groups/:id/chat', pathMatch: 'full' },
    { path: 'obavijesti', redirectTo: 'notifications', pathMatch: 'full' },
    { path: 'poruke', redirectTo: 'messages', pathMatch: 'full' },
    { path: 'poruke/privatno/:conversationId', redirectTo: 'messages/private/:conversationId', pathMatch: 'full' },
    { path: '**', redirectTo: '' }
];
