import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../../core/services/domain.services';
import { DashboardStats, Schedule } from '../../../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterLink],
  template: `
<div class="dashboard">
  <!-- KPI Cards -->
  <section class="kpi-grid" *ngIf="stats()">
    <div class="kpi-card accent-green">
      <div class="kpi-icon">📅</div>
      <div class="kpi-body">
        <div class="kpi-value">{{ stats()!.kpis.interventions_today }}</div>
        <div class="kpi-label">Interventions aujourd'hui</div>
      </div>
    </div>
    <div class="kpi-card accent-yellow">
      <div class="kpi-icon">⏳</div>
      <div class="kpi-body">
        <div class="kpi-value">{{ stats()!.kpis.interventions_pending }}</div>
        <div class="kpi-label">En attente</div>
      </div>
    </div>
    <div class="kpi-card accent-blue">
      <div class="kpi-icon">👥</div>
      <div class="kpi-body">
        <div class="kpi-value">{{ stats()!.kpis.clients_active }}</div>
        <div class="kpi-label">Clients actifs</div>
      </div>
    </div>
    <div class="kpi-card accent-purple">
      <div class="kpi-icon">👷</div>
      <div class="kpi-body">
        <div class="kpi-value">{{ stats()!.kpis.staff_active }}</div>
        <div class="kpi-label">Agents actifs</div>
      </div>
    </div>
    <div class="kpi-card accent-green">
      <div class="kpi-icon">💶</div>
      <div class="kpi-body">
        <div class="kpi-value">{{ stats()!.kpis.revenue_month | currency:'EUR':'symbol':'1.0-0' }}</div>
        <div class="kpi-label">CA ce mois</div>
      </div>
    </div>
    <div class="kpi-card" [class.accent-red]="stats()!.kpis.invoices_overdue > 0">
      <div class="kpi-icon">⚠️</div>
      <div class="kpi-body">
        <div class="kpi-value">{{ stats()!.kpis.invoices_overdue }}</div>
        <div class="kpi-label">Factures en retard</div>
      </div>
    </div>
  </section>

  <!-- Loading skeleton -->
  <section class="kpi-grid" *ngIf="!stats() && loading()">
    <div class="kpi-card skeleton" *ngFor="let i of [1,2,3,4,5,6]"></div>
  </section>

  <div class="dashboard-bottom">
    <!-- Upcoming schedules -->
    <section class="card upcoming">
      <div class="card-header">
        <h2>Prochaines interventions</h2>
        <a routerLink="/schedules" class="link-more">Voir tout →</a>
      </div>
      <div class="schedule-list" *ngIf="stats()">
        <div class="schedule-item" *ngFor="let s of stats()!.upcoming_schedules">
          <div class="schedule-date">
            <span class="day">{{ s.scheduled_start | date:'d' }}</span>
            <span class="month">{{ s.scheduled_start | date:'MMM':'':'fr' }}</span>
          </div>
          <div class="schedule-info">
            <div class="schedule-name">{{ s.property?.name }}</div>
            <div class="schedule-sub">{{ s.property?.client?.display_name }} · {{ s.service?.name }}</div>
          </div>
          <div class="schedule-time">{{ s.scheduled_start | date:'HH:mm' }}</div>
          <span class="badge" [ngClass]="'badge-' + s.status">{{ statusLabel(s.status) }}</span>
        </div>
        <div class="empty" *ngIf="!stats()!.upcoming_schedules.length">
          Aucune intervention planifiée
        </div>
      </div>
    </section>

    <!-- Status breakdown -->
    <section class="card status-card">
      <div class="card-header">
        <h2>Statuts du mois</h2>
      </div>
      <div class="status-bars" *ngIf="stats()">
        <div class="status-row" *ngFor="let s of stats()!.schedules_by_status">
          <span class="status-name">{{ statusLabel(s.status) }}</span>
          <div class="bar-track">
            <div class="bar-fill" [style.width.%]="barWidth(s.total)"
                 [ngClass]="'bar-' + s.status"></div>
          </div>
          <span class="status-count">{{ s.total }}</span>
        </div>
      </div>

      <!-- Overdue invoices -->
      <div class="card-header mt" *ngIf="stats()?.overdue_invoices?.length">
        <h2>Factures en retard</h2>
        <a routerLink="/invoices" class="link-more">Voir →</a>
      </div>
      <div class="overdue-list" *ngIf="stats()">
        <div class="overdue-item" *ngFor="let inv of stats()!.overdue_invoices">
          <span class="overdue-num">{{ inv.invoice_number }}</span>
          <span class="overdue-client">{{ inv.client?.display_name }}</span>
          <span class="overdue-amount">{{ inv.total | currency:'EUR':'symbol':'1.2-2' }}</span>
        </div>
      </div>
    </section>
  </div>
</div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 28px; }

    /* KPI */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .kpi-card {
      background: #13151f; border: 1px solid rgba(255,255,255,.06);
      border-radius: 14px; padding: 20px;
      display: flex; align-items: center; gap: 16px;
      transition: transform .2s, border-color .2s;
    }
    .kpi-card:hover { transform: translateY(-2px); }
    .kpi-icon { font-size: 28px; }
    .kpi-value { font-size: 28px; font-weight: 800; color: #fff; line-height: 1; }
    .kpi-label { font-size: 12px; color: #5a5f72; margin-top: 4px; }
    .accent-green { border-left: 3px solid #4fffb0; }
    .accent-blue  { border-left: 3px solid #00cfff; }
    .accent-yellow{ border-left: 3px solid #ffd54f; }
    .accent-purple{ border-left: 3px solid #b388ff; }
    .accent-red   { border-left: 3px solid #ff4f6a; }
    .kpi-card.skeleton { height: 88px; animation: pulse 1.5s ease infinite; }
    @keyframes pulse {
      0%,100% { background: #13151f; }
      50%      { background: #1a1d2a; }
    }

    /* Bottom grid */
    .dashboard-bottom { display: grid; grid-template-columns: 1fr 380px; gap: 20px; }
    @media (max-width: 900px) { .dashboard-bottom { grid-template-columns: 1fr; } }

    .card {
      background: #13151f; border: 1px solid rgba(255,255,255,.06);
      border-radius: 14px; padding: 24px;
    }
    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
    }
    .card-header h2 { font-size: 15px; font-weight: 700; color: #e8eaf0; margin: 0; }
    .card-header.mt { margin-top: 28px; }
    .link-more { font-size: 12px; color: #4fffb0; text-decoration: none; }
    .link-more:hover { text-decoration: underline; }

    /* Schedule list */
    .schedule-list { display: flex; flex-direction: column; gap: 2px; }
    .schedule-item {
      display: flex; align-items: center; gap: 14px; padding: 10px 12px;
      border-radius: 8px; transition: background .2s;
    }
    .schedule-item:hover { background: rgba(255,255,255,.03); }
    .schedule-date {
      display: flex; flex-direction: column; align-items: center;
      width: 36px; flex-shrink: 0;
    }
    .day   { font-size: 18px; font-weight: 800; color: #4fffb0; line-height: 1; }
    .month { font-size: 10px; color: #5a5f72; text-transform: uppercase; }
    .schedule-info { flex: 1; min-width: 0; }
    .schedule-name { font-size: 14px; font-weight: 600; color: #e8eaf0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .schedule-sub  { font-size: 12px; color: #5a5f72; }
    .schedule-time { font-size: 13px; color: #8b90a0; flex-shrink: 0; }
    .empty { text-align: center; color: #3a3f52; padding: 24px; font-size: 14px; }

    /* Badges */
    .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .3px; flex-shrink: 0; }
    .badge-pending     { background: rgba(255,213,79,.15);  color: #ffd54f; }
    .badge-confirmed   { background: rgba(0,207,255,.15);   color: #00cfff; }
    .badge-in_progress { background: rgba(179,136,255,.15); color: #b388ff; }
    .badge-completed   { background: rgba(79,255,176,.15);  color: #4fffb0; }
    .badge-cancelled   { background: rgba(255,79,106,.15);  color: #ff4f6a; }
    .badge-rescheduled { background: rgba(255,152,0,.15);   color: #ff9800; }

    /* Status bars */
    .status-bars { display: flex; flex-direction: column; gap: 12px; }
    .status-row  { display: flex; align-items: center; gap: 10px; }
    .status-name { font-size: 12px; color: #8b90a0; width: 90px; flex-shrink: 0; }
    .bar-track   { flex: 1; height: 6px; background: rgba(255,255,255,.06); border-radius: 3px; overflow: hidden; }
    .bar-fill    { height: 100%; border-radius: 3px; transition: width .5s ease; }
    .bar-pending     { background: #ffd54f; }
    .bar-confirmed   { background: #00cfff; }
    .bar-in_progress { background: #b388ff; }
    .bar-completed   { background: #4fffb0; }
    .bar-cancelled   { background: #ff4f6a; }
    .status-count { font-size: 12px; font-weight: 700; color: #e8eaf0; width: 28px; text-align: right; }

    /* Overdue */
    .overdue-list { display: flex; flex-direction: column; gap: 8px; }
    .overdue-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.04); }
    .overdue-num { font-size: 12px; color: #5a5f72; width: 100px; flex-shrink: 0; }
    .overdue-client { flex: 1; font-size: 13px; color: #e8eaf0; }
    .overdue-amount { font-size: 13px; font-weight: 700; color: #ff4f6a; }
  `]
})
export class DashboardComponent implements OnInit {
  stats   = signal<DashboardStats | null>(null);
  loading = signal(true);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: data => { this.stats.set(data); this.loading.set(false); },
      error: ()   => this.loading.set(false),
    });
  }

  statusLabel(status: string): string {
    const map: Record<string,string> = {
      pending: 'En attente', confirmed: 'Confirmé', in_progress: 'En cours',
      completed: 'Terminé', cancelled: 'Annulé', rescheduled: 'Reprogrammé',
    };
    return map[status] ?? status;
  }

  barWidth(total: number): number {
    const max = Math.max(...(this.stats()?.schedules_by_status.map(s => s.total) ?? [1]));
    return max ? (total / max) * 100 : 0;
  }
}
