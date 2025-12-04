import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const authRoutes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('../features/auth/views/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('../features/auth/views/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'verify-email',
        loadComponent: () => import('../features/auth/views/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
    },
    {
        path: '', redirectTo: 'login', pathMatch: 'full'
    },
];

@NgModule({
    imports: [RouterModule.forChild(authRoutes)],
    exports: [RouterModule]
})
export class AuthRoutingModule {}
