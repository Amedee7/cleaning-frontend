import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScheduleService } from '../../../../../core/services/domain.services';
import { Schedule } from '../../../../../core/models';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>Interventions</h1>
      <p class="subtitle">{{ total() }} interventions au total</p>
    </div>
    <a routerLink="/schedules/new" class="btn-primary">+ Planifier</a>
  </div>

  <!-- Quick filters -->
  <div class="quick-filters">
    <button *ngFor="let f of quickFilters" class="qf-btn"
            [class.active]="statusFilter === f.value"
            (click)="setStatus(f.value)">
      <span>{{ f.icon }}</span> {{ f.label }}
    </button>
  </div>

  <!-- Filters row -->
  <div class="filters">
    <input type="date" [(ngModel)]="dateFrom" (ngModelChange)="load()" class="filter-input" />
    <input type="date" [(ngModel)]="dateTo"   (ngModelChange)="load()" class="filter-input" />
    <select [(ngModel)]="priorityFilter" (ngModelChange)="load()" class="filter-select">
      <option value="">Toutes priorités</option>
      <option value="urgent">Urgent</option>
      <option value="high">Haute</option>
      <option value="normal">Normale</option>
      <option value="low">Basse</option>
    </select>
  </div>

  <!-- Cards grid -->
  <div class="schedules-grid" *ngIf="!loading()">
    <div class="schedule-card" *ngFor="let s of schedules()"
         [routerLink]="['/schedules', s.id]">
      <div class="sc-header">
        <span class="sc-ref">{{ s.reference }}</span>
        <span class="badge" [ngClass]="'badge-' + s.status">{{ statusLabel(s.status) }}</span>
      </div>
      <div class="sc-property">{{ s.property?.name }}</div>
      <div class="sc-client">{{ s.property?.client?.display_name }}</div>
      <div class="sc-service">🧹 {{ s.service?.name }}</div>
      <div class="sc-footer">
        <div class="sc-time">
          <span class="sc-date">{{ s.scheduled_start | date:'dd/MM' }}</span>
          <span class="sc-hour">{{ s.scheduled_start | date:'HH:mm' }} → {{ s.scheduled_end | date:'HH:mm' }}</span>
        </div>
        <div class="sc-staff">
          <span class="avatar-stack" *ngFor="let u of (s.staff ?? []).slice(0,3)">
            {{ initials(u.full_name) }}
          </span>
          <span class="more" *ngIf="(s.staff?.length ?? 0) > 3">+{{ (s.staff?.length ?? 0) - 3 }}</span>
        </div>
      </div>
      <div class="priority-bar" [ngClass]="'p-' + s.priority"></div>
    </div>

    <div class="empty-state" *ngIf="!schedules().length">
      <div class="empty-icon">📅</div>
      <p>Aucune intervention trouvée</p>
      <a routerLink="/schedules/new" class="btn-primary">Planifier une intervention</a>
    </div>
  </div>

  <!-- Loading skeleton -->
  <div class="schedules-grid" *ngIf="loading()">
    <div class="schedule-card skeleton" *ngFor="let i of [1,2,3,4,5,6]"></div>
  </div>

  <!-- Pagination -->
  <div class="pagination" *ngIf="lastPage() > 1">
    <button [disabled]="page() === 1" (click)="goPage(page()-1)">← Précédent</button>
    <span>Page {{ page() }} / {{ lastPage() }}</span>
    <button [disabled]="page() === lastPage()" (click)="goPage(page()+1)">Suivant →</button>
  </div>
</div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: #5a5f72; margin: 0; }
    .btn-primary { background: linear-gradient(135deg, #4fffb0, #00cfff); color: #000; font-weight: 700; font-size: 14px; padding: 10px 20px; border-radius: 8px; text-decoration: none; white-space: nowrap; }

    .quick-filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .qf-btn { background: #13151f; border: 1px solid rgba(255,255,255,.08); color: #8b90a0; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-family: inherit; transition: all .2s; display: flex; align-items: center; gap: 6px; }
    .qf-btn:hover, .qf-btn.active { border-color: #4fffb0; color: #4fffb0; }

    .filters { display: flex; gap: 12px; flex-wrap: wrap; }
    .filter-input, .filter-select { background: #13151f; border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 9px 12px; color: #e8eaf0; font-size: 14px; outline: none; font-family: inherit; }
    .filter-input:focus, .filter-select:focus { border-color: #4fffb0; }

    /* Cards */
    .schedules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .schedule-card {
      background: #13151f; border: 1px solid rgba(255,255,255,.06);
      border-radius: 14px; padding: 18px; cursor: pointer;
      transition: transform .2s, border-color .2s; position: relative; overflow: hidden;
    }
    .schedule-card:hover { transform: translateY(-2px); border-color: rgba(79,255,176,.3); }
    .sc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .sc-ref { font-size: 11px; color: #3a3f52; font-family: monospace; }
    .sc-property { font-size: 16px; font-weight: 700; color: #e8eaf0; margin-bottom: 2px; }
    .sc-client  { font-size: 12px; color: #5a5f72; margin-bottom: 8px; }
    .sc-service { font-size: 13px; color: #8b90a0; margin-bottom: 14px; }
    .sc-footer  { display: flex; align-items: center; justify-content: space-between; }
    .sc-time    { display: flex; flex-direction: column; }
    .sc-date    { font-size: 15px; font-weight: 700; color: #4fffb0; }
    .sc-hour    { font-size: 12px; color: #5a5f72; }
    .sc-staff   { display: flex; align-items: center; gap: -4px; }
    .avatar-stack {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, #4fffb0, #00cfff);
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; color: #000;
      border: 2px solid #13151f; margin-left: -4px;
    }
    .more { font-size: 11px; color: #5a5f72; margin-left: 6px; }
    .priority-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; }
    .p-urgent { background: #ff4f6a; }
    .p-high   { background: #ff9800; }
    .p-normal { background: #4fffb0; }
    .p-low    { background: #3a3f52; }

    .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-pending     { background: rgba(255,213,79,.15);  color: #ffd54f; }
    .badge-confirmed   { background: rgba(0,207,255,.15);   color: #00cfff; }
    .badge-in_progress { background: rgba(179,136,255,.15); color: #b388ff; }
    .badge-completed   { background: rgba(79,255,176,.15);  color: #4fffb0; }
    .badge-cancelled   { background: rgba(255,79,106,.15);  color: #ff4f6a; }
    .badge-rescheduled { background: rgba(255,152,0,.15);   color: #ff9800; }

    .schedule-card.skeleton { height: 180px; animation: pulse 1.5s ease infinite; }
    @keyframes pulse { 0%,100% { background: #13151f; } 50% { background: #1a1d2a; } }

    .empty-state { grid-column: 1/-1; text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 48px; margin-bottom: 12px; }
    .empty-state p { color: #3a3f52; margin-bottom: 20px; }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
    .pagination button { background: #13151f; border: 1px solid rgba(255,255,255,.08); color: #e8eaf0; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: inherit; }
    .pagination button:disabled { opacity: .3; cursor: not-allowed; }
    .pagination span { font-size: 14px; color: #5a5f72; }
  `]
})
export class ScheduleListComponent implements OnInit {
  schedules    = signal<Schedule[]>([]);
  loading      = signal(false);
  total        = signal(0);
  page         = signal(1);
  lastPage     = signal(1);
  statusFilter = '';
  priorityFilter = '';
  dateFrom = ''; dateTo = '';

  quickFilters = [
    { label: 'Tous',        value: '', icon: '📋' },
    { label: 'Aujourd\'hui',value: 'today', icon: '🌅' },
    { label: 'En attente',  value: 'pending', icon: '⏳' },
    { label: 'Confirmés',   value: 'confirmed', icon: '✅' },
    { label: 'En cours',    value: 'in_progress', icon: '🔄' },
    { label: 'Terminés',    value: 'completed', icon: '🏁' },
  ];

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.scheduleService.getAll({
      page: this.page(),
      status: this.statusFilter !== 'today' ? this.statusFilter : '',
      today: this.statusFilter === 'today' ? 1 : '',
      priority: this.priorityFilter,
      date_from: this.dateFrom,
      date_to: this.dateTo,
    }).subscribe({
      next: (res: any) => {
        this.schedules.set(res.data);
        this.total.set(res.total);
        this.lastPage.set(res.last_page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setStatus(v: string): void { this.statusFilter = v; this.page.set(1); this.load(); }
  goPage(p: number): void    { this.page.set(p); this.load(); }

  statusLabel(s: string): string {
    const map: Record<string,string> = {
      pending:'En attente', confirmed:'Confirmé', in_progress:'En cours',
      completed:'Terminé', cancelled:'Annulé', rescheduled:'Reprogrammé',
    };
    return map[s] ?? s;
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
