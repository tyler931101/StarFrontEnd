// Auto-refresh expired tokens

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { TokenService } from '../../features/auth/services/token.service';

@Injectable()
export class TokenRefreshInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private auth: AuthService, private tokenService: TokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !this.isRefreshing) {
          this.isRefreshing = true;
          return this.auth.refresh().pipe(
            switchMap(() => {
              this.isRefreshing = false;
              const newToken = this.tokenService.getAccessToken();
              const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
              return next.handle(cloned);
            }),
            catchError(refreshErr => {
              this.isRefreshing = false;
              return throwError(() => refreshErr);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}