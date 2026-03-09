import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface User {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    roles: { name: string }[];
    created_at: Date;
    updated_at: Date;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
    updated_at: Date;
    created_at: Date;
    permissions: Permission[];
}

interface Permission {
    id: number;
    name: string;
    display_name: string;
    description: string;
    updated_at: Date;
    created_at: Date;
    checked: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private apiUrl = 'http://localhost:8000/api/admin';

    constructor(private http: HttpClient) { }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users`);
    }

    deleteUser(userId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users/${userId}`);
    }

    getUserRoles(userId: number): Observable<{ user: User; roles: Role[] }> {
        return this.http.get<{ user: User; roles: Role[] }>(`${this.apiUrl}/users/${userId}/roles/edit`);
    }

    updateUserRoles(userId: number, roles: number[]): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${userId}/roles`, { roles });
    }

    getRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(`${this.apiUrl}/roles`);
    }

    getRolePermissions(roleId: number): Observable<{ role: Role; permissions: Permission[] }> {
        return this.http.get<{ role: Role; permissions: Permission[] }>(`${this.apiUrl}/roles/${roleId}/permissions/edit`);
    }

    updateRolePermissions(roleId: number, permissions: number[]): Observable<any> {
        return this.http.put(`${this.apiUrl}/roles/${roleId}/permissions`, { permissions });
    }

    createRole(roleData: { name: string; display_name?: string; description?: string }): Observable<Role> {
        return this.http.post<Role>(`${this.apiUrl}/roles`, roleData);
    }

    deleteRole(roleId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/roles/${roleId}`);
    }

    getPermissions(): Observable<Permission[]> {
        return this.http.get<Permission[]>(`${this.apiUrl}/permissions`);
    }
}
