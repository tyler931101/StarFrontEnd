import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleGuard } from "app/core/guards/role.guard";
import { AuthGuard } from "app/core/guards/auth.guard";
import { Title } from "@angular/platform-browser";

export const adminRoutes: Routes = [
    {
        path: 'users',
        loadComponent: () => import('../../features/admin/views/users/users.component').then(m => m.UsersComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Admin'], title: 'User Management', icon: 'cil-animal' }
    },
    {
        path: 'settings',
        loadComponent: () => import('../../features/admin/views/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Admin'], title: 'Settings' }
    },
    {
        path: 'ticket',
        loadComponent: () => import('../../features/ticket/ticket.component').then(m => m.TicketComponent),
        canActivate: [AuthGuard],
        data: {title: 'Tickets' }
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
        data: {title: 'Reports'}
    },
    {
        path: 'calendar',
        loadComponent: () => import('../../features/calendar/calendar.component').then(m => m.CalendarComponent),
        canActivate: [AuthGuard],
        data: {title: 'Calendar'}
    },
    {
        path: 'customer',
        loadComponent: () => import('../../features/admin/views/customer/customer.component').then(m => m.CustomerComponent),
        canActivate: [AuthGuard],
        data: {title: 'Customer'}
    },
    {
        path: 'helper',
        loadComponent: () => import('../../features/helper/helper.component').then(m => m.HelperComponent),
        canActivate: [AuthGuard],
        data: { title: 'Helper' }
    }
];

@NgModule({
    imports: [RouterModule.forChild(adminRoutes)],
    exports: [RouterModule]
})
export class AdminRoutingModule {}
