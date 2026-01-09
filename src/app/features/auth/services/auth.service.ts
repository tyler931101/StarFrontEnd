import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { RegisterUser } from '../models/register.model';
import { JwtPayload } from '../models/jwt-payload.model';
import { TokenService } from './token.service';
import { ApiService } from '../../../core/services/api.service';
import { UserStateService } from '../../../core/services/user-state.service';
import { UpdateProfileDto, ChangePasswordDto } from '../models/user.model';

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
      catchError((error) => {
        console.error('Failed to get profile:', error);
        return throwError(() => error);
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
      catchError((error) => {
        console.error('Failed to get profile:', error);
        return throwError(() => error);
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
    // logout() {
    //   this.api.post('auth/logout', {}).subscribe({
    //     next: () => {
    //       this.tokenService.clearTokens();
    //       this.userState.clearUser();
    //       this.router.navigate(['/login']);
    //     },
    //     error: () => {
    //       this.tokenService.clearTokens();
    //       this.userState.clearUser();
    //       this.router.navigate(['/login']);
    //     }
    //   });
    // }
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

  get currentUserId(): string | null {
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
      return decoded.id || null;
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

  // Get user profile from /api/user/profile
  getProfile(): Observable<any> {
    return this.api.get('user/profile').pipe(
      tap((response: any) => {
        if (response.success && response.data) {
          this.userState.setUser(response.data);
        }
      }),
      catchError((error) => {
        console.error('Failed to get profile:', error);
        return throwError(() => error);
      })
    );
  }

  getUserAvatar(userId?: string, timestamp?: number): Observable<Blob> {
    const endpoint = `user/${userId}/avatar${timestamp ? `?t=${timestamp}` : ''}`;

    return (this.api.getBlob(endpoint as any) as unknown as Observable<Blob>).pipe(
      // If avatar does not exist in backend (404), just return an empty Blob so
      // callers can fall back to a default avatar without logging console errors.
      catchError((error) => {
        if (error?.status === 404) {
          // No avatar for this user – treat as "no content" instead of an error
          return of(new Blob());
        }

        console.error('Failed to get avatar:', error);
        return throwError(() => error);
      })
    );
  }

   updateProfileWithAvatar(formData: FormData): Observable<any> {
    return this.api.put('user/update-profile', formData).pipe(
      tap((response: any) => {
        if (response.success && response.data) {
          // Update user state
          const updatedUser = {
            ...response.data.profile,
            avatarUrl: response.data.avatarUrl || response.data.profile.avatarUrl
          };
          this.userState.setUser(updatedUser);
        }
      }),
      catchError((error) => {
        console.error('Update profile error:', error);
        return throwError(() => error);
      })
    );
  }

  // Update profile via /api/user/profile (PUT)
  updateProfile(payload: UpdateProfileDto): Observable<any> {
    console.log(payload)
    return this.api.put('user/profile', payload).pipe(
      tap((response: any) => {
        if (response.success && response.data) {
          this.userState.setUser(response.data);
        }
      })
    );
  }

  // Delete avatar via /api/user/avatar (DELETE)
  deleteAvatar(): Observable<any> {
    return this.api.delete('user/avatar').pipe(
      tap((response: any) => {
        if (response.success) {
          // Update user state - clear avatar
          const currentUser = this.userState.getUser();
          if (currentUser) {
            this.userState.setUser({
              ...currentUser,
              avatarUrl: ''
            });
          }
        }
      })
    );
  }

  // Change password via /api/user/change-password (POST)
  changePassword(payload: ChangePasswordDto): Observable<any> {
    return this.api.post('user/change-password', payload);
  }

  // Check email verification status via /api/user/check-email (GET)
  checkEmailVerification(): Observable<any> {
    return this.api.get('user/check-email');
  }

  // Resend verification email via /api/user/resend-verification (POST)
  resendVerificationEmail(): Observable<any> {
    return this.api.post('user/resend-verification', {});
  }

  // Get user activity via /api/user/activity (GET)
  getUserActivity(): Observable<any> {
    return this.api.get('user/activity');
  }
}
