import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { UserRoutingModule } from './shared/routing.module/user.routes';
import { AdminRoutingModule } from './shared/routing.module/admin.routes';
import { AuthRoutingModule } from './shared/routing.module/auth.routes';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { 
        path: '', 
        loadChildren: () => import('./shared/routing.module/auth.routes').then(m => m.AuthRoutingModule)
    },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: 'landing',
                loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/auth/views/profile/profile.component').then(m => m.ProfileComponent)
            },
            {
                path: 'user',
                loadChildren: () => import('./shared/routing.module/user.routes').then(m => m.UserRoutingModule)
            },
            {
                path: 'admin',
                loadChildren: () => import('./shared/routing.module/admin.routes').then(m => m.AdminRoutingModule)
            },
        ]
    },
    { path: '**', redirectTo: 'login' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes),
        AuthRoutingModule,
        UserRoutingModule,
        AdminRoutingModule
    ],
    exports: [RouterModule]
})

export class AppRoutingModule {}
