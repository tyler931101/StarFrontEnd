import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { RegisterUser } from '../models/register.model';
import { jwtDecode } from "jwt-decode";
import {Router} from '@angular/router'

interface JwtPayload {
    id: string;
    role: string;
    exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:5155/api/auth';
    constructor(private http: HttpClient, private router: Router) {}

    register(user: RegisterUser): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, user, { withCredentials: true });
    }

    verifyEmail(token: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/verify-email?token=${token}`);
    }

    login(credentials: {email: string, password: string}): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
            tap((res: any) => {
                localStorage.setItem('token', res.token);
                localStorage.setItem('refreshToken', res.refreshToken);
                const decoded = jwtDecode<JwtPayload>(res.token);
                this.redirectByRole(decoded.role);
            })
        );
    }

    redirectByRole(role: string){
        if(role == 'Admin') {
            this.router.navigate(['/admin']);
        } else {
            this.router.navigate(['/tickets']);
        }
    }
    
    refresh(): Observable<any> {
        const refreshToken = localStorage.getItem('refreshToken');
        return this.http.post(`${this.apiUrl}/refresh`, refreshToken).pipe(
            tap((res: any) => {
                localStorage.setItem('token', res.token);
                localStorage.setItem('refreshToken', res.refreshToken);
            })
        )
    }

    logout(): Observable<any> {
        return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
        // localStorage.removeItem('token');
    }

    get isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    get role(): string | null {
        const token = localStorage.getItem('token');
        if(!token) return null;
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            return decoded.role;
        } catch (error) {
            console.error('Error decoding token', error);
            return null;
        }
    }
}