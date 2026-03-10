import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../../../core/services/domain.services';
import { Invoice } from '../../../../../core/models';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterLink, FormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>Factures</h1>
      <p class="subtitle">{{ total() }} factures · {{ totalRevenue() | currency:'EUR':'symbol':'1.2-2' }} total</p>
    </div>
    <a routerLink="/invoices/new" class="btn-primary">+ Nouvelle facture</a>
  </div>

  <div class="filters">
    <button *ngFor="let f of statusFilters" class="qf-btn"
            [class.active]="statusFilter === f.value" (click)="setStatus(f.value)">
      {{ f.icon }} {{ f.label }}
    </button>
  </div>

  <div class="table-card">
    <div class="loading-bar" *ngIf="loading()"></div>
    <table>
      <thead>
        <tr>
          <th>N° Facture</th>
          <th>Client</th>
          <th>Émission</th>
          <th>Échéance</th>
          <th>Montant HT</th>
          <th>TVA</th>
          <th>Total TTC</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let inv of invoices()" [class.overdue-row]="inv.is_overdue">
          <td class="mono">{{ inv.invoice_number }}</td>
          <td>
            <div class="client-name">{{ inv.client?.display_name }}</div>
          </td>
          <td>{{ inv.issued_at | date:'dd/MM/yyyy' }}</td>
          <td [class.overdue-date]="inv.is_overdue">
            {{ inv.due_date | date:'dd/MM/yyyy' }}
            <span *ngIf="inv.is_overdue" class="overdue-tag">En retard</span>
          </td>
          <td>{{ inv.subtotal | currency:'EUR':'symbol':'1.2-2' }}</td>
          <td class="secondary">{{ inv.tax_amount | currency:'EUR':'symbol':'1.2-2' }}</td>
          <td class="amount-total">{{ inv.total | currency:'EUR':'symbol':'1.2-2' }}</td>
          <td>
            <span class="badge" [ngClass]="'badge-' + inv.status">{{ statusLabel(inv.status) }}</span>
          </td>
          <td>
            <div class="actions">
              <button *ngIf="inv.status !== 'paid'" class="btn-pay"
                      (click)="markPaid(inv)">✓ Payer</button>
              <button class="btn-icon danger" (click)="deleteInvoice(inv)">🗑️</button>
            </div>
          </td>
        </tr>
        <tr *ngIf="!loading() && !invoices().length">
          <td colspan="9" class="empty">Aucune facture trouvée</td>
        </tr>
      </tbody>
    </table>
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
    .btn-primary { background: linear-gradient(135deg, #4fffb0, #00cfff); color: #000; font-weight: 700; font-size: 14px; padding: 10px 20px; border-radius: 8px; text-decoration: none; }
    .filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .qf-btn { background: #13151f; border: 1px solid rgba(255,255,255,.08); color: #8b90a0; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-family: inherit; transition: all .2s; }
    .qf-btn.active { border-color: #4fffb0; color: #4fffb0; }
    .table-card { background: #13151f; border: 1px solid rgba(255,255,255,.06); border-radius: 14px; overflow: hidden; position: relative; }
    .loading-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #4fffb0, #00cfff); animation: slide 1.5s linear infinite; }
    @keyframes slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 14px 16px; font-size: 11px; font-weight: 700; color: #5a5f72; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid rgba(255,255,255,.06); }
    td { padding: 14px 16px; font-size: 14px; color: #c8cad4; border-bottom: 1px solid rgba(255,255,255,.04); }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,.02); }
    tr.overdue-row td { background: rgba(255,79,106,.03); }
    td.mono { font-family: monospace; font-size: 13px; }
    td.secondary { color: #5a5f72; }
    td.amount-total { font-weight: 700; color: #e8eaf0; }
    .client-name { font-weight: 600; color: #e8eaf0; }
    .overdue-date { color: #ff4f6a; }
    .overdue-tag { font-size: 10px; background: rgba(255,79,106,.15); color: #ff4f6a; padding: 2px 6px; border-radius: 3px; margin-left: 6px; }
    .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-draft    { background: rgba(255,255,255,.07);  color: #8b90a0; }
    .badge-sent     { background: rgba(0,207,255,.15);    color: #00cfff; }
    .badge-paid     { background: rgba(79,255,176,.15);   color: #4fffb0; }
    .badge-overdue  { background: rgba(255,79,106,.15);   color: #ff4f6a; }
    .badge-cancelled{ background: rgba(255,255,255,.05);  color: #3a3f52; }
    .actions { display: flex; gap: 8px; align-items: center; }
    .btn-pay { background: rgba(79,255,176,.15); border: 1px solid rgba(79,255,176,.3); color: #4fffb0; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-family: inherit; transition: all .2s; }
    .btn-pay:hover { background: rgba(79,255,176,.25); }
    .btn-icon { background: none; border: 1px solid rgba(255,255,255,.08); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 13px; transition: border-color .2s; }
    .btn-icon.danger:hover { border-color: #ff4f6a; }
    .empty { text-align: center; color: #3a3f52; padding: 40px; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
    .pagination button { background: #13151f; border: 1px solid rgba(255,255,255,.08); color: #e8eaf0; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: inherit; }
    .pagination button:disabled { opacity: .3; cursor: not-allowed; }
    .pagination span { font-size: 14px; color: #5a5f72; }
  `]
})
export class InvoiceListComponent implements OnInit {
  invoices     = signal<Invoice[]>([]);
  loading      = signal(false);
  total        = signal(0); lastPage = signal(1); page = signal(1);
  statusFilter = '';

  statusFilters = [
    { value: '', icon: '📋', label: 'Toutes' },
    { value: 'draft',   icon: '✏️',  label: 'Brouillon' },
    { value: 'sent',    icon: '📤', label: 'Envoyées' },
    { value: 'paid',    icon: '✅', label: 'Payées' },
    { value: 'overdue', icon: '⚠️', label: 'En retard' },
  ];

  get totalRevenue(): any {
    return () => this.invoices().reduce((sum, i) => sum + +i.total, 0);
  }

  constructor(private invoiceService: InvoiceService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.invoiceService.getAll({
      page: this.page(),
      status: this.statusFilter !== 'overdue' ? this.statusFilter : '',
      overdue: this.statusFilter === 'overdue' ? 1 : '',
    }).subscribe({
      next: (res: any) => {
        this.invoices.set(res.data);
        this.total.set(res.total);
        this.lastPage.set(res.last_page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setStatus(v: string): void { this.statusFilter = v; this.page.set(1); this.load(); }
  goPage(p: number): void    { this.page.set(p); this.load(); }

  markPaid(inv: Invoice): void {
    const method = prompt('Moyen de paiement (bank_transfer, check, cash, card) :', 'bank_transfer');
    if (!method) return;
    this.invoiceService.markAsPaid(inv.id, { payment_method: method }).subscribe(() => this.load());
  }

  deleteInvoice(inv: Invoice): void {
    if (!confirm(`Supprimer la facture ${inv.invoice_number} ?`)) return;
    this.invoiceService.remove(inv.id).subscribe(() => this.load());
  }

  statusLabel(s: string): string {
    const map: Record<string,string> = { draft:'Brouillon', sent:'Envoyée', paid:'Payée', overdue:'En retard', cancelled:'Annulée' };
    return map[s] ?? s;
  }
}
