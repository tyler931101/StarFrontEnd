import { Injectable, signal, computed } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { TokenService } from 'app/features/auth/services/token.service';

interface User {
  name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserStateService {
  private _user = signal<User | null>(null);

  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());
  role = computed(() => this._user()?.role ?? '');

  constructor(private tokenService: TokenService) {
    this.restoreFromToken();
  }

  // Build user from JWT payload
  private restoreFromToken() {
    const token = this.tokenService.getAccessToken();
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      this._user.set({
        name: decoded.unique_name || decoded.name || '',
        email: decoded.email || '',
        role: decoded.role || '',
      });
    } catch {
      console.warn('Invalid token — clearing...');
      this.tokenService.clearTokens();
    }
  }

  setUserFromToken(token: string) {
    const decoded: any = jwtDecode(token);
    this._user.set({
      name: decoded.unique_name || decoded.name || '',
      email: decoded.email || '',
      role: decoded.role || '',
    });
  }

  clearUser() {
    this._user.set(null);
    this.tokenService.clearTokens();
  }
}
