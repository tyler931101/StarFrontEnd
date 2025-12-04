import { Injectable, signal, computed, effect  } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { TokenService } from 'app/features/auth/services/token.service';
import { UserProfileDto } from 'app/features/auth/models/user.model';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  private _user = signal<UserProfileDto | null>(null);

  private _avatarChanged = signal<number>(0);
  private _avatarUrl = computed(() => this._user()?.avatarUrl ?? 'assets/images/default-avatar.png');

  // Computed signals
  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());
  role = computed(() => this._user()?.role ?? '');
  email = computed(() => this._user()?.email ?? '');
  username = computed(() => this._user()?.username ?? '');
  avatarUrl = computed(() => this._user()?.avatarUrl ?? 'assets/images/default-avatar.png');

  avatarChanged$ = toObservable(this._avatarChanged);
  avatarUrl$ = toObservable(this._avatarUrl);

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
        id: decoded.id || '',
        username: decoded.name || decoded.username || '',
        email: decoded.email || '',
        role: decoded.role || '',
        avatarUrl: decoded.avatar || '',
        phone: '',
        status: '',
        createdAt: '',
        updatedAt: '',
        lastLoginAt: '',
        isVerified: decoded.isVerified === 'true',
        isLocked: false,
        isDisabled: false
      });
    } catch {
      console.warn('Invalid token — clearing...');
      this.tokenService.clearTokens();
    }
  }

  setUserFromToken(token: string) {
    const decoded: any = jwtDecode(token);
    this._user.set({
      id: decoded.id || '',
      username: decoded.name || decoded.username || '',
      email: decoded.email || '',
      role: decoded.role || '',
      avatarUrl: decoded.avatar || '',
      phone: '',
      status: '',
      createdAt: '',
      updatedAt: '',
      lastLoginAt: '',
      isVerified: decoded.isVerified === 'true',
      isLocked: false,
      isDisabled: false
    });
  }

  setUser(profile: UserProfileDto) {
    this._user.set(profile);
  }

  updateUser(updates: Partial<UserProfileDto>) {
    const current = this._user();
    if (current) {
      const newUser = { ...current, ...updates };
      this._user.set(newUser);
      
      // Notify avatar change if avatarUrl was updated
      if (updates.avatarUrl !== undefined) {
        this.notifyAvatarChanged();
      }
    }
  }

  // New method to specifically update and notify avatar changes
  updateAvatar(avatarUrl: string) {
    this.updateUser({ avatarUrl });
  }

  // New method to notify avatar has changed
  notifyAvatarChanged() {
    this._avatarChanged.update(value => value + 1);
  }

  clearUser() {
    this._user.set(null);
    this.tokenService.clearTokens();
  }

  getUser(): UserProfileDto | null {
    return this._user();
  }
}