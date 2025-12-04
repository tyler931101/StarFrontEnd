import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { UserRoutingModule } from './routers/user.routes';
import { AdminRoutingModule } from './routers/admin.routes';
import { AuthRoutingModule } from './routers/auth.routes';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '',
        component: AuthLayoutComponent,
        children: [
            {
                path: '',
                loadChildren: () => import('./routers/auth.routes').then(m => m.AuthRoutingModule)
            }
        ]
    },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: 'landing',
                loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/auth/views/profile/profile.component').then(m => m.ProfileComponent),
            },
            {
                path: 'user',
                loadChildren: () => import('./routers/user.routes').then(m => m.UserRoutingModule),
            },
            {
                path: 'admin',
                loadChildren: () => import('./routers/admin.routes').then(m => m.AdminRoutingModule),
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
