import { Routes } from '@angular/router';
import { CanActivate } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: 'login',
        // canActivate: [AuthGuard, RoleGuard],
        // data: {roles: ["User", "Amdin"]},
        loadComponent: () => import('./features/auth/views/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/views/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'unauthorized',
        loadComponent: () => import('./features/auth/views/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
    },
    {
        path: 'verify-email',
        loadComponent: () => import('./features/auth/views/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    {
        path: '',
        loadComponent: () => import('./core/layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
        children: [
            {
                path: 'landing',
                loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
            },
            {
                path: 'tickets',
                loadComponent: () => import('./features/tickets/ticket.component').then(m => m.TicketComponent)
            },
        ]
    }
];
