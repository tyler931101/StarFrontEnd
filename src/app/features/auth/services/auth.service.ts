import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { RegisterUser } from '../models/register.model';
import { JwtPayload } from '../models/jwt-payload.model';
import { TokenService } from './token.service';
import { ApiService } from '../../../core/services/api.service';
import { UserStateService } from '../../../core/services/user-state.service';

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
    return this.api.post('auth/register', user).pipe(
      tap((res: any) => {
        alert(res.message || 'Registration successful. Please check your email to verify your account.');
        this.router.navigate(['/login'])
      }),
      catchError((error: any) => {
        const errorMessage = error.error?.message || 'Register failed. Please try again.';
        alert(errorMessage);
        return of(null);
      })
    );
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

        this.redirectByRole(decoded.role);
      }),
      catchError((error: any) => {
        const errorMessage = error.error?.message || 'Login failed. Please try again.';
        alert(errorMessage);
        console.error('Login error:', error);
        return of(null);
      })
    );
  }

  // --- Route user based on their role
  private redirectByRole(role: string) {
    this.router.navigate(['/landing']);
  }

  // --- Refresh access token
  refresh(): Observable<any> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error('No refresh token available'));

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
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  // --- Logout user
  logout() {
    this.tokenService.clearTokens();
    this.userState.clearUser();
    this.router.navigate(['/login']);
  }

  // --- Simple getter for login state
  get isLoggedIn(): boolean {
    const token = this.tokenService.getAccessToken();
    if (!token) return false;

    try {
        const decoded = jwtDecode<JwtPayload>(token);
        const isExpired = decoded.exp ? Date.now() >= decoded.exp * 1000 : true;
        
        if (isExpired) {
            this.tokenService.clearTokens();
            this.userState.clearUser();
            return false;
        }
        return true;
    } catch (err) {
        console.error('Error decoding token', err);
        this.tokenService.clearTokens();
        this.userState.clearUser();
        return false;
    }
  }

  // --- Extract current user's role from token
  get role(): string | null {
    const token = this.tokenService.getAccessToken();
    if (!token) return null;
  
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const isExpired = decoded.exp ? Date.now() >= decoded.exp * 1000 : true;
      
      if (isExpired) {
        console.warn('Token expired, clearing tokens');
        this.tokenService.clearTokens();
        this.userState.clearUser(); // Also clear user state for consistency
        return null;
      }
      return decoded.role;
    } catch (err) {
      console.error('Error decoding token', err);
      this.tokenService.clearTokens();
      this.userState.clearUser(); // Also clear user state for consistency
      return null;
    }
  }

  get email(): string | null {
    const token = this.tokenService.getAccessToken();
    if (!token) return null;
  
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const isExpired = decoded.exp ? Date.now() >= decoded.exp * 1000 : true;
      console.log('decoded email', decoded);
      if (isExpired) {
        console.warn('Token expired, clearing tokens');
        this.tokenService.clearTokens();
        this.userState.clearUser(); // Also clear user state for consistency
        return null;
      }
      return decoded.email || null;
    } catch (err) {
      console.error('Error decoding token', err);
      this.tokenService.clearTokens();
      this.userState.clearUser(); // Also clear user state for consistency
      return null;
    }
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  // --- Get Profile
  // getProfile(): Observable<any> {
  //   return this.api.get('auth/profile').pipe(
  //     tap((profile: any) => this.)
  //   )
  // }
}
