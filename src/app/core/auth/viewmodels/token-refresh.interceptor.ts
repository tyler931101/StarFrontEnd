import { HttpRequest, HttpInterceptor, HttpClient, HttpEvent, HttpErrorResponse, HttpHandler } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, switchMap, throwError } from "rxjs";
import { AuthService } from "./auth.service";


@Injectable()
export class TokenRefreshInterceptor implements HttpInterceptor {
    constructor(private auth: AuthService) {}
    
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError(err => {
                if(err instanceof HttpErrorResponse && err.status === 401) {
                    return this.auth.refresh().pipe(
                        switchMap(() => next.handle(req.clone({
                            setHeaders: {Authorization: `Bearer ${localStorage.getItem('token')}`}
                        })))
                    );
                }
                return throwError(() => err);
            })
        )
    }
}