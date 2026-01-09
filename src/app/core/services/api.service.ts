import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl || 'http://localhost:5155/api';

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  private createHeaders(extraHeaders?: Record<string, string>, isFormData: boolean = false): HttpHeaders {
    let headers: Record<string, string> = {};
    
    // Get token from wherever you store it
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Adding Authorization header with token');
    } else {
        console.warn('No access token found in localStorage');
    }
    
    // Don't set Content-Type for FormData
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    
    // Add extra headers
    if (extraHeaders) {
        headers = { ...headers, ...extraHeaders };
    }
    
    return new HttpHeaders(headers);
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Something went wrong. Please try again later.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      message = error.error.message;
    } else if (error.error?.message) {
      // Server-side error with message
      message = error.error.message;
    } else if (error.message) {
      // HttpErrorResponse message
      message = error.message;
    }

    // Show different messages based on status code
    switch (error.status) {
      case 0:
        this.toastr.error('Server unreachable. Check your connection.', 'Network Error');
        break;
      case 400:
        this.toastr.warning(message, 'Bad Request');
        break;
      case 401:
        this.toastr.error('You\'re not authorized. Please log in again.', 'Unauthorized');
        break;
      case 403:
        this.toastr.error('Access denied. You do not have permission.', 'Forbidden');
        break;
      case 404:
        this.toastr.warning('The requested resource was not found.', 'Not Found');
        break;
      case 409:
        this.toastr.warning(message, 'Conflict');
        break;
      case 413:
        this.toastr.error('File too large. Please upload a smaller file.', 'File Too Large');
        break;
      case 422:
        this.toastr.warning(message, 'Validation Error');
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
        params,
        withCredentials: true
      })
      .pipe(catchError((e) => this.handleError(e)));
  }

  getBlob(endpoint: string, params?: HttpParams, extraHeaders?: Record<string, string>): Observable<Blob> {
    return this.http
      .get(`${this.baseUrl}/${endpoint}`, {
        headers: this.createHeaders(extraHeaders),
        params,
        withCredentials: true,
        responseType: 'blob'
      })
      .pipe(
        catchError((e: HttpErrorResponse) => {
          // For avatar requests that legitimately return 404 (no avatar stored),
          // don't show a toast or log an API error here. Let callers decide
          // how to handle the "no avatar" case.
          if (e.status === 404 && endpoint.includes('/avatar')) {
            return throwError(() => e);
          }

          return this.handleError(e);
        })
      );
  }

  post<T>(endpoint: string, body: any, extraHeaders?: Record<string, string>): Observable<T> {
    const isFormData = body instanceof FormData;
    
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, body, {
        headers: this.createHeaders(extraHeaders, isFormData),
        withCredentials: true
      })
      .pipe(catchError((e) => this.handleError(e)));
  }

  put<T>(endpoint: string, body: any, extraHeaders?: Record<string, string>): Observable<T> {
    const isFormData = body instanceof FormData;
    
    return this.http
      .put<T>(`${this.baseUrl}/${endpoint}`, body, {
        headers: this.createHeaders(extraHeaders, isFormData),
        withCredentials: true
      })
      .pipe(catchError((e) => this.handleError(e)));
  }

  patch<T>(endpoint: string, body: any, extraHeaders?: Record<string, string>): Observable<T> {
    const isFormData = body instanceof FormData;
    
    return this.http
      .patch<T>(`${this.baseUrl}/${endpoint}`, body, {
        headers: this.createHeaders(extraHeaders, isFormData),
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

  // Special method for file uploads with progress reporting
  uploadWithProgress<T>(endpoint: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/${endpoint}`, formData, {
      reportProgress: true,
      observe: 'events',
      withCredentials: true
    }).pipe(catchError((e) => this.handleError(e)));
  }
}