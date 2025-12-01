import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleGuard } from "app/core/guards/role.guard";
import { AuthGuard } from "app/core/guards/auth.guard";

export const adminRoutes: Routes = [
    {
        path: 'users',
        loadComponent: () => import('../../features/admin/users/users.component').then(m => m.UsersComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Admin'], title: 'User Management', icon: 'cil-animal' }
    },
    {
        path: 'settings',
        loadComponent: () => import('../../features/admin/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Admin'], title: 'Settings', icon: 'cil-camera' }
    },
    {
        path: 'ticket',
        loadComponent: () => import('../../features/ticket/ticket.component').then(m => m.TicketComponent),
        canActivate: [AuthGuard],
        data: {title: 'Tickets', icon: 'cil-camera' }
    },
    {
        path: 'chat',
        loadComponent: () => import('../../features/chat/chat.component').then(m => m.ChatComponent),
        canActivate: [AuthGuard],
        data: {title: 'Chat', icon: 'cil-camera'}
    },
    {
        path: 'chart',
        loadComponent: () => import('../../features/chart/chart.component').then(m => m.ChartComponent),
        canActivate: [AuthGuard],
        data: {title: 'Chart'}
    },
    {
        path: 'calendar',
        loadComponent: () => import('../../features/calendar/calendar.component').then(m => m.CalendarComponent),
        canActivate: [AuthGuard],
        data: {title: 'Calendar'}
    },
];

@NgModule({
    imports: [RouterModule.forChild(adminRoutes)],
    exports: [RouterModule]
})
export class AdminRoutingModule {}