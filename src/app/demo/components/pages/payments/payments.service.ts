import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Paiement {
    id: string;
    contrat_id: string;
    locataire_id?: string;
    montant: number;
    status: 'en_attente' | 'paye' | 'en_retard' | 'annule';
    mode_de_paiement?: string;
    date_de_paiement?: Date | null;
    date_normale_de_paiement: Date;
    description?: string;
    penalite?: number;
    created_at: Date;
    updated_at: Date;
    contrat?: {
        id: string;
        status?: string;
        date_de_debut?: string;
        date_de_fin?: string;
        montant_mensuel?: number;
        locataire?: {
            id: string;
            nom: string;
            prenom: string;
            telephone?: string;
        };
        maison?: {
            id: string;
            adresse: string;
            type_de_contrat?: string;
        };
    };
}

@Injectable({ providedIn: 'root' })
export class PaymentsService {
    private apiUrl = 'http://localhost:8000/api/paiements';

    constructor(private http: HttpClient) {}

    getPayments(): Observable<Paiement[]> {
        return this.http.get<Paiement[]>(this.apiUrl);
    }

    getPayment(id: string): Observable<Paiement> {
        return this.http.get<Paiement>(`${this.apiUrl}/${id}`);
    }

    createPayment(payment: Partial<Paiement>): Observable<Paiement> {
        return this.http.post<Paiement>(this.apiUrl, payment);
    }

    updatePayment(id: string, data: Partial<Paiement>): Observable<Paiement> {
        return this.http.put<Paiement>(`${this.apiUrl}/${id}`, data);
    }

    deletePayment(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getPaymentsByContrat(contratId: string): Observable<Paiement[]> {
        return this.http.get<Paiement[]>(`${this.apiUrl}/contrat/${contratId}`);
    }

    getFacturePaiement(paiementId: string): Observable<{ facture_url: string }> {
        return this.http.get<{ facture_url: string }>(`${this.apiUrl}/${paiementId}/facture`);
    }

    marquerCommePaye(id: string): Observable<{ message: string; facture_url: string }> {
        return this.http.post<{ message: string; facture_url: string }>(
            `${this.apiUrl}/${id}/marquer-comme-paye`, {}
        );
    }

    getPaymentsLate(): Observable<Paiement[]> {
        return this.http.get<Paiement[]>(`${this.apiUrl}/paiement-en-retard`);
    }

    searchPayments(params: {
        status?: string;
        dateDebut?: string;
        dateFin?: string;
    }): Observable<Paiement[]> {
        let httpParams = new HttpParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val != null) httpParams = httpParams.set(key, val);
        });
        return this.http.get<Paiement[]>(`${this.apiUrl}/paiement-search-date`, { params: httpParams });
    }

    exportExcel(params: {
        status?: string;
        dateDebut?: string;
        dateFin?: string;
    }): Observable<Blob> {
        let httpParams = new HttpParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val != null) httpParams = httpParams.set(key, val);
        });
        return this.http.get(`${this.apiUrl}/export-excel`, {
            params: httpParams,
            responseType: 'blob',
        });
    }

    //get facture by id of paiement loyer
    getFature(id: string) {
        return this.http.get<any>(`${this.apiUrl}/${id}/facture`);
    }
}