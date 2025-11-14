// Track current user in memory

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../models/jwt-payload.model';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class UserSessionService {
  private user$ = new BehaviorSubject<JwtPayload | null>(null);

  constructor(private tokenService: TokenService) {
    const token = this.tokenService.getAccessToken();
    if (token) this.user$.next(jwtDecode<JwtPayload>(token));
  }

  currentUser() {
    return this.user$.asObservable();
  }

  get role(): string | null {
    return this.user$.getValue()?.role ?? null;
  }

  clear() {
    this.user$.next(null);
  }
}
