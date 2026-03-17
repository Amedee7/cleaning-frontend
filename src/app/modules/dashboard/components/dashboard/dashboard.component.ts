import {Component, OnInit, signal} from '@angular/core';
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
    today = new Date();

    constructor(
        private dashboardService: DashboardPressingService,
        public auth: AuthService
    ) {
    }

    ngOnInit(): void {
        this.dashboardService.getStats().subscribe(s => this.stats.set(s));
    }

    barPct(amount: number): number {
        const total = this.stats()?.revenue_today ?? 0;
        return total > 0 ? Math.round((amount / total) * 100) : 0;
    }
}
