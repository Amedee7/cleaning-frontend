import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface GroupeTarifaire {
    id: number;
    name: string;
    description: string;
    default_discount: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    clients_count?: number; // Pour afficher le nombre de clients
}

@Injectable({ providedIn: 'root' })
export class GroupeTarifaireService extends ApiService {
    getAll(params: any = {}): Observable<{ data: GroupeTarifaire[] }> {
        return this.get<any>('client-groups', params);
    }

    getById(id: number): Observable<GroupeTarifaire> {
        return this.get<GroupeTarifaire>(`client-groups/${id}`);
    }

    create(data: Partial<GroupeTarifaire>): Observable<GroupeTarifaire> {
        return this.post<GroupeTarifaire>('client-groups', data);
    }

    update(id: number, data: Partial<GroupeTarifaire>): Observable<GroupeTarifaire> {
        return this.put<GroupeTarifaire>(`client-groups/${id}`, data);
    }

    deleteGroupeT(id: number): Observable<any> {
        return this.delete<any>(`client-groups/${id}`);
    }

    getStats(): Observable<any> {
        return this.get<any>('client-groups/stats');
    }
}
