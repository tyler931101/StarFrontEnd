
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'app/features/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AvatarService implements OnDestroy {
  private userAvatars: Map<string, BehaviorSubject<string>> = new Map();
  private defaultAvatarUrl = 'assets/default-avatar.png';

  constructor(private authService: AuthService) {}

  getAvatar(userId: string): Observable<string> {
    if (!this.userAvatars.has(userId)) {
      this.userAvatars.set(userId, new BehaviorSubject<string>(this.defaultAvatarUrl));
      this.loadAvatar(userId).subscribe();
    }
    return this.userAvatars.get(userId)!.asObservable();
  }

  loadAvatar(userId: string): Observable<string> {
    const timestamp = new Date().getTime();
    return this.authService.getUserAvatar(userId, timestamp).pipe(
      switchMap(blob => this.createImageFromBlob(blob)),
      tap(url => {
        this.updateAvatarUrl(userId, url);
      }),
      catchError(err => {
        this.updateAvatarUrl(userId, this.defaultAvatarUrl);
        return of(this.defaultAvatarUrl);
      })
    );
  }

  private updateAvatarUrl(userId: string, url: string): void {
    if (this.userAvatars.has(userId)) {
      const subject = this.userAvatars.get(userId)!;
      const oldUrl = subject.getValue();
      if (oldUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldUrl);
      }
      subject.next(url);
    } else {
      this.userAvatars.set(userId, new BehaviorSubject<string>(url));
    }
  }

  private createImageFromBlob(blob: Blob): Observable<string> {
    if (!blob || blob.size === 0) {
      return of(this.defaultAvatarUrl);
    }
    const url = URL.createObjectURL(blob);
    return of(url);
  }

  clearAvatars(): void {
    this.userAvatars.forEach(subject => {
      const url = subject.getValue();
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      subject.complete();
    });
    this.userAvatars.clear();
  }

  ngOnDestroy(): void {
    this.clearAvatars();
  }
}
