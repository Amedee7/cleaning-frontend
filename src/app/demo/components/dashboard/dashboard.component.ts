import { Component, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import {NumberSpacePipe} from "../shared/number-space.pipe";
@Component({
  selector: 'app-dashboard',
  standalone: true,
    imports: [CommonModule, FormsModule, ChartModule, MenuModule, TableModule, StyleClassModule, PanelMenuModule, ButtonModule, NumberSpacePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    totalMaisons: number = 0;
    maisonsDisponibles: number = 0;
    maisonsNonDisponibles: number = 0;
    totalLocataires: number = 0;
    locatairesActifs: number = 0;
    locatairesInactifs: number = 0;
    totalProprietaires: number = 0;
    contratsActifs: number = 0;
    contratsTermines: number = 0;
    contratsTotal: number = 0;
    loyersTotal: number = 0;
    nbrPaiementsEnRetard: number = 0;
    sommePaiementRetard: number = 0;
    nouvellesMaisons: number = 0;
    nouveauxLocataires: number = 0;
    tauxVariation: number = 0;
    locatairesEnRetard: number = 0;

    stats: any = {}; // initialisé à un objet vide
    statsList: any[] = [];
    today = new Date();


  constructor(
    private dashboardService: DashboardService,
    private router: Router
) {}




  ngOnInit(): void {
    this.dashboardService.getStats().subscribe((data) => {
        this.stats = data;

        // Construire le tableau SEULEMENT quand les stats sont disponibles
        this.statsList = [
            { label: 'Maisons totales', value: this.stats.totalMaisons },
            { label: 'Maisons disponibles', value: this.stats.maisonsDisponibles },
            { label: 'Maisons non disponibles', value: this.stats.maisonsNonDisponibles },
            { label: 'Locataires totaux', value: this.stats.totalLocataires },
            { label: 'Locataires actifs', value: this.stats.locatairesActifs },
            { label: 'Locataires inactifs', value: this.stats.locatairesInactifs },
            { label: 'Propriétaires', value: this.stats.totalProprietaires },
            { label: 'Contrats actifs', value: this.stats.contratsActifs },
            { label: 'Contrats terminés', value: this.stats.contratsTermines },
            { label: 'Paiements en retard', value: this.stats.paiementsEnRetard },
            { label: 'Montant en retard', value: this.stats.sommePaiementRetard },
            { label: 'Loyers encaissés cette année', value: this.stats.loyersTotal },
            { label: 'Taux variation mensuel', value: this.stats.tauxVariation + '%' }
        ];
    });

    this.dashboardService.getStats().subscribe((data) => {
      this.maisonsDisponibles = data.maisonsDisponibles;
      this.locatairesActifs = data.locatairesActifs;
      this.loyersTotal = data.loyersTotal;
      this.nouvellesMaisons = data.nouvellesMaisons;
      this.nouveauxLocataires = data.nouveauxLocataires;
      this.tauxVariation = data.tauxVariation;
      this.sommePaiementRetard = data.sommePaiementRetard;
      this.nbrPaiementsEnRetard = data.paiementsEnRetard;
      this.totalMaisons = data.totalMaisons;
      this.maisonsNonDisponibles = data.maisonsNonDisponibles;
      this.totalLocataires = data.totalLocataires;
      this.locatairesInactifs = data.locatairesInactifs;
      this.totalProprietaires = data.totalProprietaires;
      this.contratsActifs = data.contratsActifs;
      this.contratsTermines = data.contratsTermines;
      this.contratsTotal = data.contratsTotal;
      this.locatairesEnRetard = data.locatairesEnRetard;
    });
  }

  goToPaiements() {
    this.router.navigate(['pages/payments']);
  }

  goToMaisons() {
    this.router.navigate(['pages/houses']);
  }

  goToLocataires() {
    this.router.navigate(['pages/tenants']);
  }

  goToPaiementsEnRetard() {
    this.router.navigate(['pages/payments-late']);
  }

  goToLocatairesEnRetard() {
    this.router.navigate(['pages/tenants-late']);
  }

}
