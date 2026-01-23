import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { adminRoutes } from '../../shared/routers/admin.routes';
import { userRoutes } from '../../shared/routers/user.routes';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  links: { path: string; label: string, icon: string }[] = [];
  userEmail: string | null = null;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    // First check if user is logged in
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const userRole = this.auth.role;
    
    // If role is null, something is wrong with the token
    if (!userRole) {
      this.auth.logout();
      return;
    }

    // Combine routes based on role
    let routes: any[] = [];
    
    if (userRole === 'Admin') {
      // Admin gets both admin routes AND user routes
      routes = [...adminRoutes];
    } else {
      // User only gets user routes
      routes = [...userRoutes];
    }

    this.processRoutes(routes);

    // set user email for display
    this.userEmail = this.auth.email ?? null;
  }

  private processRoutes(routes: any[]): void {
    if (!routes || routes.length === 0) {
      this.links = [];
      return;
    }

    this.links = routes
      .filter(route => route && route.path && route.path !== 'landing')
      .map(route => {
        // Determine the correct base path based on the route source
        let fullPath = route.path;
        
        // If it's an admin route, ensure it has the /admin prefix
        if (this.isAdminRoute(route) && !route.path.startsWith('admin/')) {
          fullPath = `admin/${route.path}`;
        }
        // If it's a user route, ensure it has the /user prefix  
        else if (this.isUserRoute(route) && !route.path.startsWith('user/')) {
          fullPath = `user/${route.path}`;
        }
        
        return {
          path: fullPath.startsWith('/') ? fullPath : `/${fullPath}`,
          label: this.getRouteLabel(route),
          icon: this.getRouteIcon(route)
        };
      });
  }

  private isAdminRoute(route: any): boolean {
    return adminRoutes.includes(route) || 
           (route.data && route.data.roles && route.data.roles.includes('Admin'));
  }

  private isUserRoute(route: any): boolean {
    return userRoutes.includes(route) || 
           !route.data || 
           !route.data.roles || 
           route.data.roles.includes('User');
  }

  private getRouteLabel(route: any): string {
    if (route.data && route.data['title']) return route.data['title'];
    if (route.data && route.data['label']) return route.data['label'];
    if (route.data && route.data['icon']) return route.data['icon'];
    return route.path.charAt(0).toUpperCase() + route.path.slice(1);
  }

  private getRouteIcon(route: any): string {
    const iconMap: { [key: string]: string } = {
      'ticket': 'fas fa-ticket-alt',
      'chat': 'fas fa-comments',
      'chart': 'fas fa-chart-bar',
      'users': 'fas fa-users',
      'settings': 'fas fa-cog',
      'admin': 'fas fa-user-shield',
      'user': 'fas fa-user',
      'calendar': 'fas fa-calendar-alt',
      'customer': 'fas fa-address-card',
      'helper': 'fas fa-hands-helping',
      'videos': 'fas fa-video',
    };

    const routeKey = Object.keys(iconMap).find(key => 
      route.path.includes(key)
    );

    return routeKey ? iconMap[routeKey]: '';
  }
}