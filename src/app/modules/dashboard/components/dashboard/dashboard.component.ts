import {Component, HostListener, OnInit, signal} from '@angular/core';
import {CommonModule, CurrencyPipe, DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {DashboardPressingService} from '../../../../core/services/pressing.services';
import {PressingDashboard, Order} from '../../../../core/models/pressing.models';
import {AuthService} from "../../../../core/services/auth.service";

@Component({
    selector: 'app-pressing-dashboard',
    standalone: true,
    imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class PressingDashboardComponent implements OnInit {
    stats = signal<PressingDashboard | null>(null);
    loading = signal<boolean>(false);
    error = signal<string | null>(null);
    today = new Date();
    total = signal(0);

    constructor(
        private dashboardService: DashboardPressingService,
        public auth: AuthService
    ) {}

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.loading.set(true);
        this.error.set(null);

        this.dashboardService.getStats().subscribe({
            next: (data) => {
                this.stats.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Erreur chargement dashboard:', err);
                this.error.set('Impossible de charger les données. Veuillez réessayer.');
                this.loading.set(false);
            }
        });
    }

    retry(): void {
        this.loadDashboardData();
    }

    barPct(amount: number): number {
        const total = this.stats()?.revenue_today ?? 0;
        return total > 0 ? Math.round((amount / total) * 100) : 0;
    }
}
