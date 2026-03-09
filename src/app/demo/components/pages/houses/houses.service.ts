import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Owner } from '../owners/owners.service';

export interface House {
    id: string;
    status: string;
    adresse: string;
    surface: number;
    prix: number;
    photos: string;
    description: string;
    ville: string;
    quartier: string;
    pays: string;
    disponible_a_partir_de: Date;
    annee_construction: number;
    type_de_maison: string;
    type_de_contrat: string;
    nombre_pieces: number;
    caution: number;
    garage: boolean;
    jardin: boolean;
    cuisine: boolean;
    salle_de_bain: boolean;
    parking: boolean;
    climatisation: boolean;
    wifi: boolean;
    plafond: boolean;
    ascenseur: boolean;
    created_at: Date;
    updated_at: Date;

    proprietaire_id: string;
    proprietaire?: Owner;
}


@Injectable({
    providedIn: 'root'
})
export class HousesService {
    private apiUrl = 'http://127.0.0.1:8000/api/maisons';

    constructor(private http: HttpClient) {}

    // get all houses
    getHouses(): Observable<House[]> {
        return this.http.get<House[]>(this.apiUrl);
    }

    // get house by id
    getHouse(id: string): Observable<House> {
        return this.http.get<House>(`${this.apiUrl}/${id}/maison`);
    }

    // get available houses
    getMaisonsDisponibles() {
        return this.http.get<House[]>(`${this.apiUrl}/disponibles`);
    }

    // get available houses for contract
    getMaisonsDisponiblesPourContrat(): Observable<House[]> {
        return this.http.get<House[]>(`${this.apiUrl}/disponibles-pour-contrat`);
    }

    // create house
    createHouse(house: House): Observable<House> {
        return this.http.post<House>(this.apiUrl, house);
    }

    // update house
    updateHouse(id: string, house: House): Observable<House> {
        return this.http.put<House>(`${this.apiUrl}/${id}`, house);
    }

    // delete house
    deleteHouse(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // get house by user id
    getHouseByUserId(userId: string): Observable<House[]> {
        return this.http.get<House[]>(`${this.apiUrl}/user/${userId}`);
    }

    // get house by id
    getHouseById(id: string): Observable<House> {
        return this.http.get<House>(`${this.apiUrl}/${id}`);
    }
}
