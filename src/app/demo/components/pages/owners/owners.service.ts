import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Owner {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    sexe: string;
    email: string;
    adresse: string;
    numero_cni: string;
    date_creation_cni: Date;
    date_expiration_cni: Date;
    ville: string;
    quartier: string;
    pays: string;
    photos: string;
    description: string;
    profession: string;
    nationalite: string;
    created_at: Date;
    updated_at: Date;
}

@Injectable({
    providedIn: 'root',
})
export class OwnersService {
    private apiUrl = 'http://127.0.0.1:8000/api/proprietaires';

    constructor(private http: HttpClient) {}

    getOwners(): Observable<Owner[]> {
        return this.http.get<Owner[]>(this.apiUrl);
    }

    getOwner(id: string): Observable<Owner> {
        return this.http.get<Owner>(`${this.apiUrl}/${id}`);
    }

    createOwner(owner: Owner): Observable<Owner> {
        return this.http.post<Owner>(this.apiUrl, owner);
    }


    updateOwner(id: string, owner: Owner): Observable<Owner> {
        return this.http.put<Owner>(`${this.apiUrl}/${id}`, owner);
    }

    deleteOwner(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    searchOwners(search: string): Observable<Owner[]> {
        return this.http.get<Owner[]>(`${this.apiUrl}/search?search=${search}`);
    }
}
