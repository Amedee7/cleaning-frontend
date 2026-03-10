import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReportService } from '../../../../../core/services/domain.services';
import { Report } from '../../../../../core/models';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>Rapports d'intervention</h1>
      <p class="subtitle">{{ total() }} rapports enregistrés</p>
    </div>
  </div>

  <div class="filters">
    <input type="date" [(ngModel)]="dateFrom" (ngModelChange)="load()" class="filter-input" placeholder="Date début" />
    <input type="date" [(ngModel)]="dateTo"   (ngModelChange)="load()" class="filter-input" placeholder="Date fin" />
  </div>

  <!-- Cards -->
  <div class="reports-grid" *ngIf="!loading()">
    <div class="report-card" *ngFor="let r of reports()">
      <div class="report-header">
        <div class="report-meta">
          <span class="report-ref">{{ r.schedule?.reference }}</span>
          <span class="report-date">{{ r.submitted_at | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
        <div class="report-score" *ngIf="r.quality_score">
          <span *ngFor="let s of [1,2,3,4,5]"
                [class.filled]="s <= (r.quality_score || 0)">★</span>
        </div>
      </div>

      <div class="report-property">
        🏢 {{ r.schedule?.property?.name }}
      </div>
      <div class="report-client">
        {{ r.schedule?.property?.client?.display_name }}
      </div>

      <div class="report-summary">{{ r.summary }}</div>

      <div class="report-issues" *ngIf="r.issues_found">
        <span class="issues-label">⚠️ Problèmes</span>
        <p>{{ r.issues_found }}</p>
      </div>

      <div class="report-footer">
        <div class="report-by">
          Par <strong>{{ r.submitted_by_user?.full_name || '—' }}</strong>
        </div>
        <div class="report-flags">
          <span class="flag flag-signed" *ngIf="r.client_signed" title="Signé par le client">✍️ Signé</span>
          <span class="flag flag-notified" *ngIf="r.client_notified" title="Client notifié">📧 Notifié</span>
          <span class="flag flag-photos" *ngIf="r.photos && r.photos.length"
                title="{{ r.photos.length }} photos">
            📷 {{ r.photos.length }}
          </span>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="!reports().length">
      <div class="empty-icon">📋</div>
      <p>Aucun rapport trouvé</p>
    </div>
  </div>

  <!-- Skeleton -->
  <div class="reports-grid" *ngIf="loading()">
    <div class="report-card skeleton" *ngFor="let i of [1,2,3,4,5,6]"></div>
  </div>

  <div class="pagination" *ngIf="lastPage() > 1">
    <button [disabled]="page()===1" (click)="goPage(page()-1)">← Précédent</button>
    <span>Page {{ page() }} / {{ lastPage() }}</span>
    <button [disabled]="page()===lastPage()" (click)="goPage(page()+1)">Suivant →</button>
  </div>
</div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: #5a5f72; margin: 0; }

    .filters { display: flex; gap: 12px; }
    .filter-input { background: #13151f; border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 10px 14px; color: #e8eaf0; font-size: 14px; outline: none; font-family: inherit; }
    .filter-input:focus { border-color: #4fffb0; }

    .reports-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }

    .report-card { background: #13151f; border: 1px solid rgba(255,255,255,.06); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 12px; transition: border-color .2s; }
    .report-card:hover { border-color: rgba(79,255,176,.2); }

    .report-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .report-meta { display: flex; flex-direction: column; gap: 2px; }
    .report-ref  { font-family: monospace; font-size: 12px; color: #4fffb0; }
    .report-date { font-size: 12px; color: #5a5f72; }

    .report-score span { font-size: 16px; color: #3a3f52; }
    .report-score span.filled { color: #ffd54f; }

    .report-property { font-size: 15px; font-weight: 700; color: #e8eaf0; }
    .report-client   { font-size: 12px; color: #5a5f72; margin-top: -8px; }
    .report-summary  { font-size: 13px; color: #8b90a0; line-height: 1.5; border-left: 2px solid rgba(255,255,255,.06); padding-left: 12px; }

    .report-issues { background: rgba(255,213,79,.06); border: 1px solid rgba(255,213,79,.15); border-radius: 8px; padding: 10px 12px; }
    .issues-label  { font-size: 12px; font-weight: 700; color: #ffd54f; display: block; margin-bottom: 4px; }
    .report-issues p { font-size: 13px; color: #8b90a0; margin: 0; }

    .report-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid rgba(255,255,255,.06); }
    .report-by { font-size: 12px; color: #5a5f72; }
    .report-by strong { color: #8b90a0; }
    .report-flags { display: flex; gap: 6px; }
    .flag { font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: 600; }
    .flag-signed   { background: rgba(79,255,176,.1);  color: #4fffb0; }
    .flag-notified { background: rgba(0,207,255,.1);   color: #00cfff; }
    .flag-photos   { background: rgba(179,136,255,.1); color: #b388ff; }

    .report-card.skeleton { height: 200px; animation: pulse 1.5s ease infinite; }
    @keyframes pulse { 0%,100%{background:#13151f}50%{background:#1a1d2a} }

    .empty-state { grid-column: 1/-1; text-align: center; padding: 60px 20px; }
    .empty-icon  { font-size: 48px; margin-bottom: 12px; }
    .empty-state p { color: #3a3f52; font-size: 14px; }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
    .pagination button { background: #13151f; border: 1px solid rgba(255,255,255,.08); color: #e8eaf0; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: inherit; }
    .pagination button:disabled { opacity: .3; cursor: not-allowed; }
    .pagination span { font-size: 14px; color: #5a5f72; }
  `]
})
export class ReportListComponent implements OnInit {
  reports  = signal<Report[]>([]);
  loading  = signal(false);
  total    = signal(0);
  page     = signal(1);
  lastPage = signal(1);
  dateFrom = ''; dateTo = '';

  constructor(private reportService: ReportService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.reportService.getAll({
      page: this.page(),
      date_from: this.dateFrom,
      date_to: this.dateTo,
    }).subscribe({
      next: (res: any) => {
        this.reports.set(res.data);
        this.total.set(res.total);
        this.lastPage.set(res.last_page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goPage(p: number): void { this.page.set(p); this.load(); }
}
