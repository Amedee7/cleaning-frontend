import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {DailyReport} from "../../../../../core/models/pressing.models";
import {DailyReportService} from "../../../../../core/services/pressing.services";

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
@Component({
  selector: 'app-report-list',
  standalone: true,
    imports: [CommonModule, DatePipe, FormsModule, ConfirmDialogModule],
    providers: [ConfirmationService],
  templateUrl: './report-list.component.html',
    styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit {
    todayReport = signal<DailyReport | null>(null);
    reports     = signal<DailyReport[]>([]);
    loading     = signal(false);
    generating  = signal(false);
    closing     = signal(false);
    dateFrom    = '';
    dateTo      = '';

    constructor(
        private reportService: DailyReportService,
        private confirmationService: ConfirmationService

    ) {}

    ngOnInit(): void {
        // 1. D'abord charger le rapport du jour s'il existe
        this.loadTodayReport();
        // 2. Charger l'historique
        this.loadHistory();
    }

    // ── Charge le rapport du jour depuis l'historique ──────────────────────────
    loadTodayReport(): void {
        const today = new Date().toISOString().split('T')[0];
        this.reportService.getByDate(today).subscribe({
            next: (r) => this.todayReport.set(r),
            error: () => this.todayReport.set(null), // pas de rapport aujourd'hui
        });
    }

    // ── Génère le rapport du jour (ou rafraîchit s'il existe) ──────────────────
    generateToday(): void {
        this.confirmationService.confirm({
            message: 'Voulez-vous générer ou rafraîchir le rapport de caisse pour aujourd\'hui ?',
            header: 'Génération du rapport',
            icon: 'pi pi-info-circle',
            acceptLabel: 'Confirmer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-info',
            rejectButtonStyleClass: 'p-button-outlined',

            accept: () => {
                this.generating.set(true);
                this.reportService.generate().subscribe({
                    next: (r) => {
                        this.todayReport.set(r);
                        this.generating.set(false);
                        this.loadHistory();
                    },
                    error: (err) => {
                        console.error('Erreur lors de la génération :', err);
                        this.generating.set(false);
                    },
                });
            }
        });
    }

    // ── Charge l'historique ────────────────────────────────────────────────────
    loadHistory(): void {
        this.loading.set(true);
        this.reportService.getAll({
            date_from: this.dateFrom,
            date_to:   this.dateTo,
        }).subscribe({
            next: (res: any) => {
                this.reports.set(res.data ?? res);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    // ── Clôture la caisse ──────────────────────────────────────────────────────
    closeReport(date: string): void {

        this.confirmationService.confirm({
            message: 'Clôturer la caisse de ce jour ? Cette action est irréversible.',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, Cloturer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'btn btn-success',
            rejectButtonStyleClass: 'btn btn-outlined',

            accept: () => {
                this.closing.set(true);

                this.reportService.close(date).subscribe({
                    next: (r) => {
                        this.todayReport.set(r);
                        this.closing.set(false);
                        this.loadHistory();
                    },
                    error: () => this.closing.set(false),
                });
            }
        });

    }

    // ── Pourcentage pour les barres ────────────────────────────────────────────
    pct(value: number | string, total: number | string): number {
        const v = +value;
        const t = +total;
        return t > 0 ? Math.round((v / t) * 100) : 0;
    }

    // ── Méthodes de paiement pour le template ─────────────────────────────────
    paymentMethods() {
        const r = this.todayReport()!;
        return [
            { icon: '💵', label: 'Espèces',      amount: +r.revenue_cash,   cls: 'cash'   },
            { icon: '💳', label: 'Carte',         amount: +r.revenue_card,   cls: 'card'   },
            { icon: '📱', label: 'Mobile Money',  amount: +r.revenue_mobile, cls: 'mobile' },
            { icon: '🏦', label: 'Autres',        amount: +r.revenue_other,  cls: 'other'  },
        ];
    }
}
