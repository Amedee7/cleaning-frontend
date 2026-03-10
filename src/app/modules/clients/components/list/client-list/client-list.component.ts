import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../../../core/services/domain.services';
import { Client, Paginated } from '../../../../../core/models';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>Clients</h1>
      <p class="subtitle">{{ total() }} clients enregistrés</p>
    </div>
    <a routerLink="/clients/new" class="btn-primary">+ Nouveau client</a>
  </div>

  <!-- Filters -->
  <div class="filters">
    <input class="search-input" [(ngModel)]="search" (ngModelChange)="onSearch()"
           placeholder="🔍 Rechercher un client..." />
    <select [(ngModel)]="statusFilter" (ngModelChange)="load()" class="filter-select">
      <option value="">Tous les statuts</option>
      <option value="active">Actif</option>
      <option value="inactive">Inactif</option>
    </select>
    <select [(ngModel)]="typeFilter" (ngModelChange)="load()" class="filter-select">
      <option value="">Tous les types</option>
      <option value="company">Entreprise</option>
      <option value="individual">Particulier</option>
    </select>
  </div>

  <!-- Table -->
  <div class="table-card">
    <div class="loading-bar" *ngIf="loading()"></div>
    <table>
      <thead>
        <tr>
          <th>Client</th>
          <th>Contact</th>
          <th>Ville</th>
          <th>Type</th>
          <th>Propriétés</th>
          <th>Contrats</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of clients()">
          <td>
            <div class="client-name">{{ c.display_name || c.company_name }}</div>
            <div class="client-email">{{ c.email }}</div>
          </td>
          <td>{{ c.contact_first_name }} {{ c.contact_last_name }}</td>
          <td>{{ c.city }}</td>
          <td>
            <span class="tag" [class.tag-company]="c.type === 'company'">
              {{ c.type === 'company' ? 'Entreprise' : 'Particulier' }}
            </span>
          </td>
          <td class="center">{{ c.properties_count ?? '—' }}</td>
          <td class="center">{{ c.contracts_count ?? '—' }}</td>
          <td>
            <span class="badge" [class.badge-active]="c.status === 'active'"
                  [class.badge-inactive]="c.status !== 'active'">
              {{ c.status === 'active' ? 'Actif' : 'Inactif' }}
            </span>
          </td>
          <td>
            <div class="actions">
              <a [routerLink]="['/clients', c.id, 'edit']" class="btn-icon" title="Modifier">✏️</a>
              <button class="btn-icon danger" (click)="deleteClient(c)" title="Supprimer">🗑️</button>
            </div>
          </td>
        </tr>
        <tr *ngIf="!loading() && !clients().length">
          <td colspan="8" class="empty">Aucun client trouvé</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  <div class="pagination" *ngIf="lastPage() > 1">
    <button [disabled]="page() === 1" (click)="goPage(page() - 1)">← Précédent</button>
    <span>Page {{ page() }} / {{ lastPage() }}</span>
    <button [disabled]="page() === lastPage()" (click)="goPage(page() + 1)">Suivant →</button>
  </div>
</div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: #5a5f72; margin: 0; }
    .btn-primary {
      background: linear-gradient(135deg, #4fffb0, #00cfff);
      color: #000; font-weight: 700; font-size: 14px;
      padding: 10px 20px; border-radius: 8px; text-decoration: none;
      border: none; cursor: pointer; white-space: nowrap;
    }
    .filters { display: flex; gap: 12px; flex-wrap: wrap; }
    .search-input, .filter-select {
      background: #13151f; border: 1px solid rgba(255,255,255,.08);
      border-radius: 8px; padding: 10px 14px; color: #e8eaf0;
      font-size: 14px; outline: none; font-family: inherit;
    }
    .search-input { flex: 1; min-width: 240px; }
    .search-input:focus, .filter-select:focus { border-color: #4fffb0; }

    .table-card {
      background: #13151f; border: 1px solid rgba(255,255,255,.06);
      border-radius: 14px; overflow: hidden; position: relative;
    }
    .loading-bar {
      position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, #4fffb0, #00cfff);
      animation: slide 1.5s linear infinite;
    }
    @keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; padding: 14px 16px;
      font-size: 11px; font-weight: 700; color: #5a5f72;
      text-transform: uppercase; letter-spacing: .5px;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }
    td { padding: 14px 16px; font-size: 14px; color: #c8cad4; border-bottom: 1px solid rgba(255,255,255,.04); }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,.02); }
    td.center { text-align: center; }
    .client-name { font-weight: 600; color: #e8eaf0; }
    .client-email { font-size: 12px; color: #5a5f72; margin-top: 2px; }
    .tag { font-size: 11px; padding: 3px 8px; border-radius: 4px; background: rgba(255,255,255,.07); color: #8b90a0; }
    .tag-company { background: rgba(0,207,255,.1); color: #00cfff; }
    .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge-active   { background: rgba(79,255,176,.15); color: #4fffb0; }
    .badge-inactive { background: rgba(255,79,106,.15);  color: #ff4f6a; }
    .actions { display: flex; gap: 8px; }
    .btn-icon { background: none; border: 1px solid rgba(255,255,255,.08); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 14px; text-decoration: none; color: inherit; transition: border-color .2s; }
    .btn-icon:hover { border-color: rgba(255,255,255,.2); }
    .btn-icon.danger:hover { border-color: #ff4f6a; }
    .empty { text-align: center; color: #3a3f52; padding: 40px; font-size: 14px; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
    .pagination button { background: #13151f; border: 1px solid rgba(255,255,255,.08); color: #e8eaf0; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: inherit; }
    .pagination button:disabled { opacity: .3; cursor: not-allowed; }
    .pagination span { font-size: 14px; color: #5a5f72; }
  `]
})
export class ClientListComponent implements OnInit {
  clients    = signal<Client[]>([]);
  loading    = signal(false);
  total      = signal(0);
  page       = signal(1);
  lastPage   = signal(1);
  search     = '';
  statusFilter = '';
  typeFilter   = '';
  private searchTimer: any;

  constructor(private clientService: ClientService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.clientService.getAll({
      page: this.page(), search: this.search,
      status: this.statusFilter, type: this.typeFilter,
    }).subscribe({
      next: (res: any) => {
        this.clients.set(res.data);
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

  deleteClient(client: Client): void {
    if (!confirm(`Supprimer ${client.display_name} ?`)) return;
    this.clientService.remove(client.id).subscribe(() => this.load());
  }
}
