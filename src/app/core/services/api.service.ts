import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl || 'http://localhost:5155/api';

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  private createHeaders(extraHeaders?: Record<string, string>): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...extraHeaders
    });
  }

  private handleError(error: any) {
    const message =
      error?.error?.message ||
      error?.message ||
      'Something went wrong. Please try again later.';

    // Show different messages based on status code
    switch (error.status) {
      case 0:
        this.toastr.error('Server unreachable. Check your connection.', 'Network Error');
        break;
      case 400:
        this.toastr.warning(message, 'Bad Request');
        break;
      case 401:
        this.toastr.error('You’re not authorized. Please log in again.', 'Unauthorized');
        break;
      case 403:
        this.toastr.error('Access denied. You do not have permission.', 'Forbidden');
        break;
      case 404:
        this.toastr.warning('The requested resource was not found.', 'Not Found');
        break;
      case 500:
        this.toastr.error('Internal server error occurred.', 'Server Error');
        break;
      default:
        this.toastr.error(message, `Error ${error.status}`);
    }

    console.error('API Error:', error);
    return throwError(() => error);
  }

  get<T>(endpoint: string, params?: HttpParams, extraHeaders?: Record<string, string>): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}`, {
        headers: this.createHeaders(extraHeaders),
        params
      })
      .pipe(catchError((e) => this.handleError(e)));
  }

  post<T>(endpoint: string, body: any, extraHeaders?: Record<string, string>): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, body, {
        headers: this.createHeaders(extraHeaders),
        withCredentials: true
      })
      .pipe(catchError((e) => this.handleError(e)));
  }

  put<T>(endpoint: string, body: any, extraHeaders?: Record<string, string>): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}/${endpoint}`, body, {
        headers: this.createHeaders(extraHeaders),
        withCredentials: true
      })
      .pipe(catchError((e) => this.handleError(e)));
  }

  patch<T>(endpoint: string, body: any, extraHeaders?: Record<string, string>): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}/${endpoint}`, body, {
        headers: this.createHeaders(extraHeaders),
        withCredentials: true
      })
      .pipe(catchError((e) => this.handleError(e)));
  }

  delete<T>(endpoint: string, extraHeaders?: Record<string, string>): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}/${endpoint}`, {
        headers: this.createHeaders(extraHeaders),
        withCredentials: true
      })
      .pipe(catchError((e) => this.handleError(e)));
  }
}