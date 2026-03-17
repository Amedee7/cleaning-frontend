import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppUser } from '../models/user.models';

export interface LoginPayload  { email: string; password: string; }
export interface LoginResponse {
    token:       string;
    user:        AppUser;
    permissions: string[];   // permissions effectives retournées par le backend
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly TOKEN_KEY = 'pressing_token';
    private readonly USER_KEY  = 'pressing_user';
    private readonly PERMS_KEY = 'pressing_permissions';

    private _user        = signal<AppUser | null>(this.loadUser());
    private _permissions = signal<string[]>(this.loadPermissions());

    readonly user        = this._user.asReadonly();
    readonly permissions = this._permissions.asReadonly();
    readonly isLoggedIn  = computed(() => !!this._user());

    // Raccourcis rôles — basés sur role.name (pas slug)
    readonly isSuperAdmin = computed(() => this._user()?.role?.name === 'super_admin');
    readonly isAdmin      = computed(() => ['super_admin','admin'].includes(this._user()?.role?.name ?? ''));
    readonly isManager    = computed(() => ['super_admin','admin','manager'].includes(this._user()?.role?.name ?? ''));
    readonly isCashier    = computed(() => this._user()?.role?.name === 'cashier');
    readonly isOperator   = computed(() => this._user()?.role?.name === 'operator');

    constructor(private http: HttpClient, private router: Router) {}

    login(payload: LoginPayload): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, payload).pipe(
            tap(res => {
                localStorage.setItem(this.TOKEN_KEY, res.token);
                localStorage.setItem(this.USER_KEY,  JSON.stringify(res.user));
                localStorage.setItem(this.PERMS_KEY, JSON.stringify(res.permissions ?? []));
                this._user.set(res.user);
                this._permissions.set(res.permissions ?? []);
            })
        );
    }

    logout(): void {
        this.http.post(`${environment.apiUrl}/logout`, {}).subscribe();
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.PERMS_KEY);
        this._user.set(null);
        this._permissions.set([]);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    // Vérifier une permission
    can(key: string): boolean {
        // Super admin a tout
        if (this.isSuperAdmin()) return true;
        return this._permissions().includes(key);
    }

    canAny(...keys: string[]): boolean {
        return keys.some(k => this.can(k));
    }

    canAll(...keys: string[]): boolean {
        return keys.every(k => this.can(k));
    }

    // Nom complet — méthode appelable avec ()
    fullName(): string {
        const u = this._user();
        if (!u) return '';
        return `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim();
    }

    initials(): string {
        return this.fullName().split(' ').map((n: string) => n[0] ?? '').join('').toUpperCase().slice(0, 2);
    }

    roleName(): string {
        return this._user()?.role?.name ?? '';
    }

    private loadUser(): AppUser | null {
        try {
            const raw = localStorage.getItem(this.USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    private loadPermissions(): string[] {
        try {
            const raw = localStorage.getItem(this.PERMS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    }
}
