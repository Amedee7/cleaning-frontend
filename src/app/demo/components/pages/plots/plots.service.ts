import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Plot {
    id: string;
    vendeur_nom: string;
    vendeur_prenom: string;
    vendeur_telephone: string;
    type_de_piece_vendeur: string;
    numero_cni_vendeur: string;
    date_creation_cni_vendeur: string;
    date_expiration_cni_vendeur: string;
    vendeur_adresse: [''];

    acheteur_prenom: string;
    acheteur_nom: string;
    acheteur_telephone: string;
    type_de_piece_acheteur: string;
    numero_cni_acheteur: string;
    date_creation_cni_acheteur: string;
    date_expiration_cni_acheteur: string;
    acheteur_adresse: string;

    temoin_nom_1: string;
    temoin_prenom_1: string;
    temoin_telephone_1: string;
    type_de_piece_temoin_1: string;
    numero_cni_temoin_1: string;
    date_creation_cni_temoin_1: string;
    date_expiration_cni_temoin_1: string;
    temoin_adresse_1: string;

    temoin_nom_2: string;
    temoin_prenom_2: string;
    temoin_telephone_2: string;
    type_de_piece_temoin_2: string;
    numero_cni_temoin_2: string;
    date_creation_cni_temoin_2: string;
    date_expiration_cni_temoin_2: string;
    temoin_adresse_2: string;

    temoin_nom_3: string;
    temoin_prenom_3: string;
    temoin_telephone_3: string;
    type_de_piece_temoin_3: string;
    numero_cni_temoin_3: string;
    date_creation_cni_temoin_3: string;
    date_expiration_cni_temoin_3: string;
    temoin_adresse_3: string;

    type_parcelle: string;
    usage_prevu: string;
    description_parcelle: string;
    montant_parcelle: string;
    montant_parcelle_en_lettre: string;
    mode_paiement: string;
    date_achat: Date;
    superficie: string;
    situation_geographique: string;
    numero_parcelle: string;
    lot: string;
    quartier: string;
    commune: string;
    departement: string;
    region_ville: string;
    pays: string;
    latitude: string;
    longitude: string;
    // image_parcelle: string;
    // image_carte: string;
    // image_titre_foncier: string;
    // image_plan_cadastral: string;
    // image_plan_d_amendement: string;
    // image_plan_d_amendement_2: string;
    // image_plan_d_amendement_3: string;
    // image_plan_d_amendement_4: string;
    // image_plan_d_amendement_5: string;
}

@Injectable({
    providedIn: 'root',
})
export class PlotsService {
    private apiUrl = 'http://127.0.0.1:8000/api/parcelles';
    private apiUrlDecharge = 'http://127.0.0.1:8000/api/decharge';

    constructor(private http: HttpClient) {}

    getPlots(): Observable<Plot[]> {
        return this.http.get<Plot[]>(this.apiUrl);
    }

    getPlot(id: string): Observable<Plot> {
        return this.http.get<Plot>(`${this.apiUrl}/${id}`);
    }

    createPlot(plot: Plot): Observable<Plot> {
        return this.http.post<Plot>(this.apiUrl, plot);
    }

    updatePlot(id: string, plot: Plot): Observable<Plot> {
        return this.http.put<Plot>(`${this.apiUrl}/${id}`, plot);
    }

    deletePlot(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    generateDecharge(plotId: string, payload: { est_signee: boolean }): Observable<{ message: string, decharge_url: string, id: number }> {
        return this.http.post<{ message: string, decharge_url: string, id: number }>(
            `${this.apiUrlDecharge}/${plotId}`,
            payload
        );
    }

    getDecharge(plotId: string): Observable<{ decharge_url: string }> {
        return this.http.get<{ decharge_url: string }>(
            `${this.apiUrlDecharge}/parcelle/${plotId}`
        );
    }

    marquerDechargeCommeSignee(factureId: string, payload: { est_signee: boolean }) {
        return this.http.put(`${this.apiUrlDecharge}/facture-decharge/${factureId}/signer`, payload)
    }



}
