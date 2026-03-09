import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {House} from "../houses/houses.service";
import {Plot} from "../plots/plots.service";

export interface Tenant {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse: string;
    sexe: string;
    numero_cni: string;
    date_creation_cni: Date;
    date_expiration_cni: Date;
    photo: string;
    description: string;
    profession: string;
    nationalite: string;
    situation_matrimoniale: string;
    nombre_de_personnes: number;
    nom_de_la_personne_a_contacter: string;
    telephone_de_la_personne_a_contacter: string;
    email_de_la_personne_a_contacter: string;
    numero_cni_de_la_personne_a_contacter: string;
    date_creation_cni_de_la_personne_a_contacter: Date;
    date_expiration_cni_de_la_personne_a_contacter: Date;
    photo_de_la_personne_a_contacter: string;
    created_at: Date;
    updated_at: Date;
}

@Injectable({
    providedIn: 'root',
})
export class TenantsService {
    private apiUrl = 'http://127.0.0.1:8000/api/locataires';

    constructor(private http: HttpClient) {}

    getTenants(): Observable<Tenant[]> {
        return this.http.get<Tenant[]>(this.apiUrl);
    }

    getTenant(id: string): Observable<Tenant> {
        return this.http.get<Tenant>(`${this.apiUrl}/${id}`);
    }

    createTenant(tenant: Tenant): Observable<Tenant> {
        return this.http.post<Tenant>(this.apiUrl, tenant);
    }

    updateTenant(id: string, tenant: Tenant): Observable<Tenant> {
        return this.http.put<Tenant>(`${this.apiUrl}/${id}`, tenant);
    }

    deleteTenant(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getTenantHouses(id: string): Observable<House[]> {
        return this.http.get<House[]>(`${this.apiUrl}/${id}/maisons`);
    }

    getTenantPlots(id: string): Observable<Plot[]> {
        return this.http.get<Plot[]>(`${this.apiUrl}/${id}/parcelles`);
    }

    // getTenantContracts(id: string): Observable<Contract[]> {
    //     return this.http.get<Contract[]>(`${this.apiUrl}/${id}/contrats`);
    // }
    //
    // getTenantPayments(id: string): Observable<Paiement[]> {
    //     return this.http.get<Paiement[]>(`${this.apiUrl}/${id}/paiements`);
    // }

    getTenantDocuments(id: string): Observable<Document[]> {
        return this.http.get<Document[]>(`${this.apiUrl}/${id}/documents`);
    }

    searchTenants(searchTerm: string): Observable<Tenant[]> {
        return this.http.get<Tenant[]>(`${this.apiUrl}/search?search=${searchTerm}`);
    }

}
