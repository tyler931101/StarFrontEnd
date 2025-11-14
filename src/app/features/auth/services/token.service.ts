// Manage tokens in localStorage

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private ACCESS_TOKEN = 'token';
  private REFRESH_TOKEN = 'refreshToken';

  saveTokens(access: string, refresh: string) {
    localStorage.setItem(this.ACCESS_TOKEN, access);
    localStorage.setItem(this.REFRESH_TOKEN, refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
  }
}