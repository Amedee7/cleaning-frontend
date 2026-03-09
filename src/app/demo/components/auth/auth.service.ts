// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private apiUrl = 'http://localhost:8000/api'; // ton backend Laravel
//   private tokenKey = 'auth_token';

//   constructor(private http: HttpClient) {}

//   login(credentials: { email: string; password: string }) {
//     return this.http.post(`${this.apiUrl}/login`, credentials);
//   }

//   setToken(token: string) {
//     localStorage.setItem(this.tokenKey, token);
//   }

//   getToken(): string | null {
//     return localStorage.getItem(this.tokenKey);
//   }

//   logout() {
//     localStorage.removeItem(this.tokenKey);
//   }

//   isLoggedIn(): boolean {
//     return !!this.getToken();
//   }
// }


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {Router} from "@angular/router";
import {tap} from "rxjs/operators";

interface AuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:8000/api';
    private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
    public token$ = this.tokenSubject.asObservable();
    private tokenKey = 'auth_token';

    constructor(
      private http: HttpClient,
      private router: Router
    ) {}

    register(credentials: any): Observable<AuthResponse> {
      return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials).pipe(
        tap((response) => this.saveToken(response.access_token))
      );
    }

    login(credentials: any): Observable<AuthResponse> {
      return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
        tap((response) => this.saveToken(response.access_token))
      );
    }

    logout(): Observable<any> {
      localStorage.removeItem('auth_token');
      this.tokenSubject.next(null);
      return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
        tap(() => {
          this.router.navigate(['auth/login']);
        })
      );
    }

    getToken(): string | null {
      return localStorage.getItem(this.tokenKey);
    }

    saveToken(token: string): void {
      localStorage.setItem(this.tokenKey, token);
      this.tokenSubject.next(token);
    }

    setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

    isAuthenticated(): boolean {
      return !!this.getToken();
    }

    getUserProfile(): Observable<any> {
      const token = this.getToken();
      if (!token) {
        return new Observable((subscriber) => subscriber.error('No token available'));
      }
      return this.http.post<any>(`${this.apiUrl}/user-profile`, {}).pipe(
        // Vous pourriez vouloir décoder le token côté client pour obtenir des infos sans requête supplémentaire
      );
    }
}
