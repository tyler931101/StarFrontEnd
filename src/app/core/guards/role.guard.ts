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

        if(!userRole || !expectedRole.includes(userRole)) {
            this.router.navigate(['/unauthorized']);
            return false;
        }
        return true;
    }
}