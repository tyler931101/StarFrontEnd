// Protect private routes

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../../features/auth/services/auth.service";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate{
    constructor(private auth:AuthService, private router: Router) {}
    canActivate(): boolean {
        if(!this.auth.isLoggedIn) {
            this.router.navigate(['/login']);
            return false;
        }
        return true;
    }
}
