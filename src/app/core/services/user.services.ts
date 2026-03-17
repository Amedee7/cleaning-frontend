import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AppUser, UserPermissionsDetail, Role, Permission } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService extends ApiService {
  getAll(filters = {}): Observable<any>                    { return this.get<any>('users', filters); }
  getById(id: number): Observable<AppUser>                 { return this.get<AppUser>(`users/${id}`); }
  create(data: any): Observable<AppUser>                   { return this.post<AppUser>('users', data); }
  update(id: number, data: any): Observable<AppUser>       { return this.put<AppUser>(`users/${id}`, data); }
  remove(id: number): Observable<any>                      { return this.delete<any>(`users/${id}`); }

  getPermissions(id: number): Observable<UserPermissionsDetail> {
    return this.get<UserPermissionsDetail>(`users/${id}/permissions`);
  }

  updatePermissions(id: number, overrides: Record<string, boolean>): Observable<any> {
    return this.put<any>(`users/${id}/permissions`, { overrides });
  }

  getRoles(): Observable<Role[]>                           { return this.get<Role[]>('roles'); }
  getAllPermissions(): Observable<Record<string, Permission[]>> {
    return this.get<Record<string, Permission[]>>('permissions');
  }
}

// ─── CurrentUserService — permissions de l'utilisateur connecté ───────────────
@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private _permissions = signal<string[]>([]);
  private _user        = signal<AppUser | null>(null);

  readonly permissions = this._permissions.asReadonly();
  readonly user        = this._user.asReadonly();

  // Vérifie une permission
  can(key: string): boolean {
    const user = this._user();
    if (user?.role?.name === 'super_admin') return true;
    return this._permissions().includes(key);
  }

  // Vérifie plusieurs permissions (toutes requises)
  canAll(...keys: string[]): boolean {
    return keys.every(k => this.can(k));
  }

  // Vérifie au moins une permission
  canAny(...keys: string[]): boolean {
    return keys.some(k => this.can(k));
  }

  setUser(user: AppUser, permissions: string[]): void {
    this._user.set(user);
    this._permissions.set(permissions);
  }

  clear(): void {
    this._user.set(null);
    this._permissions.set([]);
  }
}

// ─── PermissionDirective (optionnel) — *appCan="'orders.cancel'" ──────────────
// Utilisation dans template : <button *ngIf="currentUser.can('orders.cancel')">
