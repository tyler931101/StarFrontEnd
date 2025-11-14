import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { RegisterUser } from '../models/register.model';
import { JwtPayload } from '../models/jwt-payload.model';
import { TokenService } from './token.service';
import { ApiService } from '../../../core/services/api.service';
import { UserStateService } from 'app/core/services/user-state.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private api: ApiService,
    private router: Router,
    private tokenService: TokenService,
    private userState: UserStateService
  ) { }

  // --- Register a new user
  register(user: RegisterUser): Observable<any> {
    return this.api.post('auth/register', user);
  }

  // --- Verify email after registration
  verifyEmail(token: string): Observable<any> {
    return this.api.get(`auth/verify-email?token=${token}`);
  }

  // --- Login and store tokens
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.api.post('auth/login', credentials).pipe(
      tap((res: any) => {
        if (!res?.accessToken) {
          throw new Error('Login failed: accessToken missing');
        }
        this.tokenService.saveTokens(res.accessToken, res.refreshToken);

        this.userState.setUserFromToken(res.accessToken);
        const decoded = jwtDecode<JwtPayload>(res.accessToken);
        console.log('Decoded token:', decoded);

        this.redirectByRole(decoded.role);
      })
    );
  }

  // --- Route user based on their role
  private redirectByRole(role: string) {
    switch (role) {
      case 'Admin':
        this.router.navigate(['/admin']);
        break;
      case 'User':
      default:
        this.router.navigate(['/tickets']);
        break;
    }
  }

  // --- Refresh access token
  refresh(): Observable<any> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    return this.api.post('auth/refresh', { refreshToken }).pipe(
      tap((res: any) => {
        if (res?.accessToken && res?.refreshToken) {
          this.tokenService.saveTokens(res.accessToken, res.refreshToken);
          this.userState.setUserFromToken(res.accessToken);
        } else {
          console.warn('Refresh failed, clearing tokens');
          this.tokenService.clearTokens();
          this.userState.clearUser();
        }
      })
    );
  }

  // --- Logout user
  logout(): Observable<any> {
    return this.api.post('auth/logout', {}).pipe(
      tap(() => {
        this.tokenService.clearTokens();
        this.userState.clearUser();
        this.router.navigate(['/login']);
      })
    );
  }

  // --- Simple getter for login state
  get isLoggedIn(): boolean {
    return !!this.tokenService.getAccessToken();
  }

  // --- Extract current user's role from token
  get role(): string | null {
    const token = this.tokenService.getAccessToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const isExpired = Date.now() >= decoded.exp * 1000;
      if (isExpired) {
        console.warn('Token expired, clearing tokens');
        this.tokenService.clearTokens();
        return null;
      }
      return decoded.role;
    } catch (err) {
      console.error('Error decoding token', err);
      this.tokenService.clearTokens();
      return null;
    }
  }

  // --- Get Profile
  // getProfile(): Observable<any> {
  //   return this.api.get('auth/profile').pipe(
  //     tap((profile: any) => this.)
  //   )
  // }
}
