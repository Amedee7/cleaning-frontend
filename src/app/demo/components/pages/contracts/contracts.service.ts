import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {Tenant} from "../tenants/tenants.service";
import {House} from "../houses/houses.service";
import {Plot} from "../plots/plots.service";
import {Owner} from "../owners/owners.service";
import {Paiement} from "../payments/payments.service";

export interface Contract {
    id: string;
    configuration_id: string;
    type_contrat: string;
    maison_id: string;
    locataire_id: string;
    parcelle_id: string;
    date_de_debut: string;
    date_de_fin: string;
    renouvelable: boolean;
    montant_mensuel: number;
    nombre_de_mois_de_caution: number;
    montant_caution: number;
    nombre_de_mois_d_avance: number;
    montant_avance_de_loyer: number;
    status: string;
    description: string;
    nom_de_la_personne_a_contacter: string;
    prenom_de_la_personne_a_contacter: string;
    numero_cni_de_la_personne_a_contacter: string;
    telephone_de_la_personne_a_contacter: string;
    lieu_de_residence_de_la_personne_a_contacter: string;
    motif_de_suspension: string;
    date_de_suspension: string;
}

export interface Configuration {
    id: string;
    cle: string;
    valeur: string;
    description: string;
}

@Injectable({
    providedIn: 'root',
})
export class ContractsService {
    private apiUrl = 'http://127.0.0.1:8000/api/contrats';
    private apiUrlConfigurations = 'http://127.0.0.1:8000/api/configurations';

    constructor(private http: HttpClient) {}

    getContracts(): Observable<Contract[]> {
        return this.http.get<Contract[]>(this.apiUrl);
    }

    getContract(id: string): Observable<Contract> {
        return this.http.get<Contract>(`${this.apiUrl}/${id}`);
    }

    createContract(contract: Contract): Observable<Contract> {
        return this.http.post<Contract>(this.apiUrl, contract);
    }

    updateContract(id: string, contract: Contract): Observable<Contract> {
        return this.http.put<Contract>(`${this.apiUrl}/${id}`, contract);
    }

    deleteContract(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    searchContracts(query: string): Observable<Contract[]> {
        return this.http.get<Contract[]>(`${this.apiUrl}/search?search=${query}`);
    }

    getConfigurations(): Observable<Configuration[]> {
        return this.http.get<Configuration[]>(this.apiUrlConfigurations);
    }

    updateStatus(id: string, status: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
      }
    genererContratPDF(contratId: number) {
        return this.http.get<{ message: string, contrat_url: string }>(
            `${this.apiUrl}/${contratId}/pdf`
        );
    }


}
