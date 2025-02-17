import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { LoginComponent } from './app/auth/login/login.component';
import { RegisterComponent } from './app/auth/register/register.component';
import { AdminDashboardComponent } from './app/admin/dashboard/dashboard.component';
import { UserDashboardComponent } from './app/user/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'user', component: UserDashboardComponent }
];

bootstrapApplication(LoginComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ],
}).catch(err => console.error(err));
