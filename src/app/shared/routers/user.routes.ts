import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "app/core/guards/auth.guard";

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
    {
        path: 'calendar',
        loadComponent: () => import('../../features/calendar/calendar.component').then(m => m.CalendarComponent),
        canActivate: [AuthGuard],
        data: {title: 'Calendar'}
    },
    {
        path: 'helper',
        loadComponent: () => import('../../features/helper/helper.component').then(m => m.HelperComponent),
        canActivate: [AuthGuard],
        data: { title: 'Helper' }
    },
    {
        path: 'videos',
        loadComponent: () => import('../../features/videos/videos.component').then(m => m.VideosComponent),
        canActivate: [AuthGuard],
        data: { title: 'Videos' }
    }
];

@NgModule({
    imports: [RouterModule.forChild(userRoutes)],
    exports: [RouterModule]
})
export class UserRoutingModule {}
