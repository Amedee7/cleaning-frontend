import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Owner {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
}

export interface House {
    id: string;
    adresse: string;
    type_de_maison: string;
    proprietaire_id: string;
}

export interface ContratGestion {
    id: string;
    proprietaire_id: string;
    maison_id: string;
    date_debut: string;
    date_fin?: string | null;
    honoraires_agence?: number | null;
    type_honoraires?: 'pourcentage_loyer' | 'montant_fixe' | null;
    modalites_paiement?: string | null;
    responsabilites_agence?: string | null;
    responsabilites_proprietaire?: string | null;
    conditions_resiliation?: string | null;
    autres_conditions?: string | null;
    status: 'actif' | 'terminé' | 'en_attente' | 'suspendu';
    proprietaire?: Owner;
    maison?: House;
    created_at: Date;
    updated_at: Date;
    facture_contrat_gestion?: {
        id: string;
        est_signee: boolean;
        chemin: string;
    } | null;
}

@Injectable({
    providedIn: 'root',
})
export class ContratsGestionService {
    private apiUrl = 'http://localhost:8000/api/contrat-gestions';
    private apiUrlContratGestion = 'http://localhost:8000/api/facture-contrat-gestions';

    constructor(private http: HttpClient) {}

    getAllContrats(): Observable<any> {
        // Ou Observable<ContratGestion[]> si tu n'as pas de pagination
        return this.http.get<any>(this.apiUrl);
    }

    getById(id: string): Observable<ContratGestion> {
        return this.http.get<ContratGestion>(`${this.apiUrl}/${id}`);
    }

    create(contrat: ContratGestion): Observable<ContratGestion> {
        return this.http.post<ContratGestion>(this.apiUrl, contrat);
    }

    update(id: string, contrat: ContratGestion): Observable<ContratGestion> {
        return this.http.put<ContratGestion>(`${this.apiUrl}/${id}`, contrat);
    }

    deleteContratGestion(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    getFormData(): Observable<{
        proprietaires: Owner[];
        maisons: House[];
    }> {
        return this.http.get<{
            proprietaires: Owner[];
            maisons: House[];
        }>(`${this.apiUrl}/create`);
    }

    getEditFormData(
        id: string
    ): Observable<{
        contrat: ContratGestion;
        proprietaires: Owner[];
        maisons: House[];
    }> {
        return this.http.get<{
            contrat: ContratGestion;
            proprietaires: Owner[];
            maisons: House[];
        }>(`${this.apiUrl}/${id}/edit`);
    }

    generateContratGestion(contratId: string, payload: { est_signee: boolean }): Observable<{ message: string, contrat_gestion_url: string, id: number }> {
        return this.http.post<{ message: string, contrat_gestion_url: string, id: number }>(
            `${this.apiUrlContratGestion}/${contratId}/generer-contrat-gestion`,
            payload
        );
    }

getContratGestion(contratId: string): Observable<{ contrat_gestion_url: string }> {
    return this.http.get<{ contrat_gestion_url: string }>(
        `${this.apiUrlContratGestion}/contrat/${contratId}`
    );
}

    marquerContratGestionCommeSignee(contratId: string, payload: { est_signee: boolean }) {
        return this.http.put(`${this.apiUrlContratGestion}/${contratId}/signer`, payload)
    }
}
