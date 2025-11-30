import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleGuard } from "app/core/guards/role.guard";
import { AuthGuard } from "app/core/guards/auth.guard";
import { Title } from "@angular/platform-browser";

export const adminRoutes: Routes = [
    {
        path: 'users',
        loadComponent: () => import('../../features/admin/users/users.component').then(m => m.UsersComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Admin'], title: 'User Management' }
    },
    {
        path: 'settings',
        loadComponent: () => import('../../features/admin/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Admin'], title: 'Settings' }
    },
    {
        path: 'ticket',
        loadComponent: () => import('../../features/ticket/ticket.component').then(m => m.TicketComponent),
        canActivate: [AuthGuard],
        data: {title: 'Tickets'}
    },
    {
        path: 'chat',
        loadComponent: () => import('../../features/chat/chat.component').then(m => m.ChatComponent),
        canActivate: [AuthGuard],
        data: {title: 'Chat'}
    },
    {
        path: 'chart',
        loadComponent: () => import('../../features/chart/chart.component').then(m => m.ChartComponent),
        canActivate: [AuthGuard],
        data: {title: 'Chart'}
    },
];

@NgModule({
    imports: [RouterModule.forChild(adminRoutes)],
    exports: [RouterModule]
})
export class AdminRoutingModule {}