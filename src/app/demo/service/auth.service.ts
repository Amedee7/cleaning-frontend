import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: any; // Vous pouvez créer une interface User
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api'; // Remplacez par l'URL de votre API Laravel
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

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
    return localStorage.getItem('auth_token');
  }

  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.tokenSubject.next(token);
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