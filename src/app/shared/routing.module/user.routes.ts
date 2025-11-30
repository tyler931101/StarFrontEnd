import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleGuard } from "app/core/guards/role.guard";
import { AuthGuard } from "app/core/guards/auth.guard";
import { tick } from "@angular/core/testing";

export const userRoutes: Routes = [
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
    imports: [RouterModule.forChild(userRoutes)],
    exports: [RouterModule]
})
export class UserRoutingModule {}
