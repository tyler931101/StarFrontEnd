// Restrict routes by role

import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../../features/auth/services/auth.service";

@Injectable({providedIn: 'root'})
export class RoleGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const expectedRole: string[] = route.data['roles'];
        const userRole = this.auth.role;
        console.log('RoleGuard: expectedRole=', expectedRole, 'userRole=', userRole);

        if(!this.auth.isLoggedIn) {
            this.router.navigate(['/login']);
            return false;
        }

        if(!userRole || !expectedRole.includes(userRole)) {
            alert('You do not have permission to access this page.');
            this.router.navigate(['/landing']);
            return false;
        }
        return true;
    }
}
