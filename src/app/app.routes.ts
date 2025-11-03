import { Routes } from '@angular/router';
import { CanActivate } from '@angular/router';
import { AuthGuard } from './core/auth/viewmodels/auth.guard';
import { RoleGuard } from './core/auth/viewmodels/role.guard';

export const routes: Routes = [
    {
        path: 'login',
        // canActivate: [AuthGuard, RoleGuard],
        // data: {roles: ["User", "Amdin"]},
        loadComponent: () => import('./core/auth/views/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./core/auth/views/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'unauthorized',
        loadComponent: () => import('./core/auth/views/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
    },
    {
        path: 'verify-email',
        loadComponent: () => import('./core/auth/views/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
