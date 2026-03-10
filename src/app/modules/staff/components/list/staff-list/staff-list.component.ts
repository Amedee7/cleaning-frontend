import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../../core/services/domain.services';
import { User } from '../../../../../core/models';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>Personnel</h1>
      <p class="subtitle">{{ total() }} agents enregistrés</p>
    </div>
    <a routerLink="/staff/new" class="btn-primary">+ Nouvel agent</a>
  </div>

  <div class="filters">
    <input class="search-input" [(ngModel)]="search" (ngModelChange)="onSearch()"
           placeholder="🔍 Rechercher un agent..." />
    <select [(ngModel)]="statusFilter" (ngModelChange)="load()" class="filter-select">
      <option value="">Tous les statuts</option>
      <option value="active">Actif</option>
      <option value="inactive">Inactif</option>
      <option value="suspended">Suspendu</option>
    </select>
  </div>

  <!-- Cards grid -->
  <div class="staff-grid" *ngIf="!loading()">
    <div class="staff-card" *ngFor="let u of staff()">
      <div class="card-top">
        <div class="avatar">{{ initials(u.full_name) }}</div>
        <span class="status-dot" [class.active]="u.status === 'active'"
              [class.inactive]="u.status !== 'active'"></span>
      </div>
      <div class="card-body">
        <div class="staff-name">{{ u.full_name }}</div>
        <div class="staff-position">{{ u.staff_profile?.position || 'Agent de nettoyage' }}</div>
        <div class="staff-zone" *ngIf="u.staff_profile?.zone">
          📍 {{ u.staff_profile?.zone }}
        </div>
        <div class="staff-meta">
          <span class="meta-item">📧 {{ u.email }}</span>
          <span class="meta-item" *ngIf="u.phone">📞 {{ u.phone }}</span>
          <span class="meta-item" *ngIf="u.staff_profile?.hire_date">
            📅 Depuis {{ u.staff_profile?.hire_date | date:'MM/yyyy' }}
          </span>
          <span class="meta-item" *ngIf="u.staff_profile?.hourly_rate">
            💶 {{ u.staff_profile?.hourly_rate }}€/h
          </span>
        </div>
      </div>
      <div class="card-footer">
        <span class="badge" [ngClass]="'badge-' + u.status">
          {{ statusLabel(u.status) }}
        </span>
        <div class="card-actions">
          <a [routerLink]="['/staff', u.id, 'edit']" class="btn-icon" title="Modifier">✏️</a>
          <button class="btn-icon danger" (click)="deleteStaff(u)" title="Supprimer">🗑️</button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="!staff().length">
      <div class="empty-icon">👷</div>
      <p>Aucun agent trouvé</p>
      <a routerLink="/staff/new" class="btn-primary">Ajouter un agent</a>
    </div>
  </div>

  <!-- Skeleton -->
  <div class="staff-grid" *ngIf="loading()">
    <div class="staff-card skeleton" *ngFor="let i of [1,2,3,4,5,6]"></div>
  </div>

  <div class="pagination" *ngIf="lastPage() > 1">
    <button [disabled]="page() === 1" (click)="goPage(page()-1)">← Précédent</button>
    <span>Page {{ page() }} / {{ lastPage() }}</span>
    <button [disabled]="page() === lastPage()" (click)="goPage(page()+1)">Suivant →</button>
  </div>
</div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: #5a5f72; margin: 0; }
    .btn-primary { background: linear-gradient(135deg, #4fffb0, #00cfff); color: #000; font-weight: 700; font-size: 14px; padding: 10px 20px; border-radius: 8px; text-decoration: none; white-space: nowrap; }

    .filters { display: flex; gap: 12px; flex-wrap: wrap; }
    .search-input, .filter-select { background: #13151f; border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 10px 14px; color: #e8eaf0; font-size: 14px; outline: none; font-family: inherit; }
    .search-input { flex: 1; min-width: 240px; }
    .search-input:focus, .filter-select:focus { border-color: #4fffb0; }

    .staff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }

    .staff-card {
      background: #13151f; border: 1px solid rgba(255,255,255,.06);
      border-radius: 14px; padding: 20px;
      display: flex; flex-direction: column; gap: 16px;
      transition: transform .2s, border-color .2s;
    }
    .staff-card:hover { transform: translateY(-2px); border-color: rgba(79,255,176,.2); }

    .card-top { display: flex; align-items: center; justify-content: space-between; }
    .avatar {
      width: 52px; height: 52px; border-radius: 50%;
      background: linear-gradient(135deg, #4fffb0, #00cfff);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 800; color: #000;
    }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .status-dot.active   { background: #4fffb0; box-shadow: 0 0 6px #4fffb0; }
    .status-dot.inactive { background: #3a3f52; }

    .staff-name     { font-size: 16px; font-weight: 700; color: #e8eaf0; margin-bottom: 2px; }
    .staff-position { font-size: 13px; color: #4fffb0; margin-bottom: 8px; }
    .staff-zone     { font-size: 12px; color: #5a5f72; margin-bottom: 10px; }

    .staff-meta { display: flex; flex-direction: column; gap: 4px; }
    .meta-item  { font-size: 12px; color: #5a5f72; }

    .card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.06); }
    .card-actions { display: flex; gap: 6px; }
    .btn-icon { background: none; border: 1px solid rgba(255,255,255,.08); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 13px; text-decoration: none; color: inherit; transition: border-color .2s; }
    .btn-icon.danger:hover { border-color: #ff4f6a; }

    .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-active    { background: rgba(79,255,176,.15);  color: #4fffb0; }
    .badge-inactive  { background: rgba(255,79,106,.15);  color: #ff4f6a; }
    .badge-suspended { background: rgba(255,213,79,.15);  color: #ffd54f; }

    .staff-card.skeleton { height: 220px; animation: pulse 1.5s ease infinite; }
    @keyframes pulse { 0%,100%{background:#13151f}50%{background:#1a1d2a} }

    .empty-state { grid-column: 1/-1; text-align: center; padding: 60px 20px; }
    .empty-icon  { font-size: 48px; margin-bottom: 12px; }
    .empty-state p { color: #3a3f52; margin-bottom: 20px; font-size: 14px; }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
    .pagination button { background: #13151f; border: 1px solid rgba(255,255,255,.08); color: #e8eaf0; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: inherit; }
    .pagination button:disabled { opacity: .3; cursor: not-allowed; }
    .pagination span { font-size: 14px; color: #5a5f72; }
  `]
})
export class StaffListComponent implements OnInit {
  staff      = signal<User[]>([]);
  loading    = signal(false);
  total      = signal(0);
  page       = signal(1);
  lastPage   = signal(1);
  search     = '';
  statusFilter = '';
  private searchTimer: any;

  constructor(private userService: UserService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.userService.getAll({
      page: this.page(),
      search: this.search,
      status: this.statusFilter,
      role: 'staff',
    }).subscribe({
      next: (res: any) => {
        this.staff.set(res.data);
        this.total.set(res.total);
        this.lastPage.set(res.last_page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page.set(1); this.load(); }, 400);
  }

  goPage(p: number): void { this.page.set(p); this.load(); }

  deleteStaff(u: User): void {
    if (!confirm(`Supprimer ${u.full_name} ?`)) return;
    this.userService.remove(u.id).subscribe(() => this.load());
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = { active: 'Actif', inactive: 'Inactif', suspended: 'Suspendu' };
    return map[s] ?? s;
  }
}
