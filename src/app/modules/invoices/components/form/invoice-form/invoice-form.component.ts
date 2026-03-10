import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InvoiceService, ClientService, ServiceService } from '../../../../../core/services/domain.services';
import { Client, Service } from '../../../../../core/models';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, RouterLink],
  template: `
<div class="page">
  <div class="page-header">
    <a routerLink="/invoices" class="back-link">← Factures</a>
    <h1>Nouvelle facture</h1>
  </div>

  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-layout">
    <div class="form-cols">
      <!-- Gauche : infos facture -->
      <div class="form-col">
        <div class="form-card">
          <h3>Informations</h3>

          <div class="form-group">
            <label>Client *</label>
            <select formControlName="client_id">
              <option value="">Sélectionner un client</option>
              <option *ngFor="let c of clients()" [value]="c.id">
                {{ c.display_name || c.company_name }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date d'émission *</label>
              <input type="date" formControlName="issued_at" />
            </div>
            <div class="form-group">
              <label>Date d'échéance *</label>
              <input type="date" formControlName="due_date" />
            </div>
          </div>

          <div class="form-group">
            <label>Taux TVA (%)</label>
            <input type="number" formControlName="tax_rate" step="0.5" />
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea formControlName="notes" rows="3" placeholder="Mentions particulières..."></textarea>
          </div>
        </div>
      </div>

      <!-- Droite : résumé -->
      <div class="form-col">
        <div class="form-card summary-card">
          <h3>Récapitulatif</h3>
          <div class="summary-row">
            <span>Sous-total HT</span>
            <span>{{ subtotal() | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
          <div class="summary-row">
            <span>TVA ({{ form.get('tax_rate')?.value }}%)</span>
            <span>{{ taxAmount() | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
          <div class="summary-row total">
            <span>Total TTC</span>
            <span>{{ total() | currency:'EUR':'symbol':'1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Lignes de facturation -->
    <div class="form-card">
      <div class="lines-header">
        <h3>Lignes de facturation</h3>
        <button type="button" class="btn-add-line" (click)="addLine()">+ Ajouter une ligne</button>
      </div>

      <div class="lines-table">
        <div class="lines-head">
          <span>Description</span>
          <span>Service</span>
          <span>Qté</span>
          <span>Prix unitaire</span>
          <span>Total</span>
          <span></span>
        </div>

        <div class="line-row" *ngFor="let line of lines.controls; let i = index" [formGroup]="getLineGroup(i)">
          <div class="form-group">
            <input formControlName="description" placeholder="Description de la prestation" />
          </div>
          <div class="form-group">
            <select formControlName="service_id" (change)="onServiceChange(i)">
              <option value="">—</option>
              <option *ngFor="let s of services()" [value]="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <input type="number" formControlName="quantity" min="1" />
          </div>
          <div class="form-group">
            <input type="number" formControlName="unit_price" step="0.01" min="0" />
          </div>
          <div class="line-total">
            {{ lineTotal(i) | currency:'EUR':'symbol':'1.2-2' }}
          </div>
          <button type="button" class="btn-remove" (click)="removeLine(i)"
                  [disabled]="lines.length === 1">✕</button>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <a routerLink="/invoices" class="btn-cancel">Annuler</a>
      <button type="submit" class="btn-submit" [disabled]="form.invalid || saving() || lines.length === 0">
        {{ saving() ? 'Création...' : 'Créer la facture' }}
      </button>
    </div>
  </form>
</div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 8px; }
    .back-link { font-size: 13px; color: #4fffb0; text-decoration: none; display: block; margin-bottom: 4px; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 20px; }
    .form-layout { display: flex; flex-direction: column; gap: 20px; }
    .form-cols { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
    @media (max-width: 800px) { .form-cols { grid-template-columns: 1fr; } }
    .form-col { display: flex; flex-direction: column; gap: 20px; }
    .form-card { background: #13151f; border: 1px solid rgba(255,255,255,.06); border-radius: 14px; padding: 24px; }
    .form-card h3 { font-size: 13px; font-weight: 700; color: #8b90a0; margin: 0 0 20px; text-transform: uppercase; letter-spacing: .5px; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
    .form-group label { font-size: 12px; font-weight: 600; color: #5a5f72; text-transform: uppercase; letter-spacing: .5px; }
    .form-group input, .form-group select, .form-group textarea { background: #1a1d2a; border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 10px 14px; color: #e8eaf0; font-size: 14px; outline: none; font-family: inherit; transition: border-color .2s; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #4fffb0; }
    .form-group textarea { resize: vertical; }

    /* Summary card */
    .summary-card { background: rgba(79,255,176,.05); border-color: rgba(79,255,176,.15); }
    .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.05); font-size: 14px; color: #8b90a0; }
    .summary-row.total { border-bottom: none; font-size: 18px; font-weight: 800; color: #4fffb0; padding-top: 14px; }

    /* Lines */
    .lines-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-add-line { background: rgba(79,255,176,.1); border: 1px solid rgba(79,255,176,.3); color: #4fffb0; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; font-family: inherit; }
    .btn-add-line:hover { background: rgba(79,255,176,.2); }

    .lines-table { display: flex; flex-direction: column; gap: 8px; }
    .lines-head { display: grid; grid-template-columns: 2fr 1.5fr 80px 120px 120px 36px; gap: 8px; padding: 0 4px 8px; border-bottom: 1px solid rgba(255,255,255,.06); }
    .lines-head span { font-size: 11px; font-weight: 700; color: #5a5f72; text-transform: uppercase; letter-spacing: .5px; }
    .line-row { display: grid; grid-template-columns: 2fr 1.5fr 80px 120px 120px 36px; gap: 8px; align-items: start; padding: 8px 4px; border-radius: 8px; transition: background .2s; }
    .line-row:hover { background: rgba(255,255,255,.02); }
    .line-row .form-group { margin-bottom: 0; }
    .line-total { font-size: 14px; font-weight: 700; color: #4fffb0; display: flex; align-items: center; padding-top: 10px; }
    .btn-remove { background: none; border: 1px solid rgba(255,79,106,.2); color: #ff4f6a; border-radius: 6px; width: 32px; height: 38px; cursor: pointer; font-size: 12px; margin-top: 10px; transition: all .2s; }
    .btn-remove:hover:not(:disabled) { background: rgba(255,79,106,.1); }
    .btn-remove:disabled { opacity: .2; cursor: not-allowed; }

    @media (max-width: 768px) {
      .lines-head { display: none; }
      .line-row { grid-template-columns: 1fr 1fr; }
    }

    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .btn-cancel { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); color: #8b90a0; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; }
    .btn-submit { background: linear-gradient(135deg, #4fffb0, #00cfff); border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 700; color: #000; cursor: pointer; font-family: inherit; }
    .btn-submit:disabled { opacity: .5; cursor: not-allowed; }
  `]
})
export class InvoiceFormComponent implements OnInit {
  form = this.fb.group({
    client_id:  ['', Validators.required],
    issued_at:  [new Date().toISOString().split('T')[0], Validators.required],
    due_date:   ['', Validators.required],
    tax_rate:   [20],
    notes:      [''],
    lines: this.fb.array([this.createLine()]),
  });

  clients  = signal<Client[]>([]);
  services = signal<Service[]>([]);
  saving   = signal(false);

  get lines(): FormArray { return this.form.get('lines') as FormArray; }

  subtotal = computed(() => {
    return this.lines.controls.reduce((sum, ctrl) => {
      const qty   = ctrl.get('quantity')?.value   ?? 0;
      const price = ctrl.get('unit_price')?.value ?? 0;
      return sum + (qty * price);
    }, 0);
  });

  taxAmount = computed(() => this.subtotal() * ((this.form.get('tax_rate')?.value ?? 0) / 100));
  total     = computed(() => this.subtotal() + this.taxAmount());

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private serviceService: ServiceService,
  ) {}

  ngOnInit(): void {
    this.clientService.getAll({ per_page: 100 }).subscribe((r: any) => this.clients.set(r.data));
    this.serviceService.getAll({ per_page: 100 }).subscribe((r: any) => this.services.set(r.data));

    // Set default due date = today + 30 days
    const due = new Date();
    due.setDate(due.getDate() + 30);
    this.form.get('due_date')?.setValue(due.toISOString().split('T')[0]);
  }

  createLine() {
    return this.fb.group({
      description: ['', Validators.required],
      service_id:  [''],
      quantity:    [1, [Validators.required, Validators.min(1)]],
      unit_price:  [0, [Validators.required, Validators.min(0)]],
    });
  }

  getLineGroup(i: number) { return this.lines.at(i) as any; }

  addLine():        void { this.lines.push(this.createLine()); }
  removeLine(i: number): void { if (this.lines.length > 1) this.lines.removeAt(i); }

  lineTotal(i: number): number {
    const ctrl = this.lines.at(i);
    return (ctrl.get('quantity')?.value ?? 0) * (ctrl.get('unit_price')?.value ?? 0);
  }

  onServiceChange(i: number): void {
    const ctrl      = this.lines.at(i);
    const serviceId = ctrl.get('service_id')?.value;
    if (!serviceId) return;
    const svc = this.services().find(s => s.id === +serviceId);
    if (svc) {
      ctrl.patchValue({ description: svc.name, unit_price: svc.base_price });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const payload = {
      ...this.form.value,
      subtotal:   this.subtotal(),
      tax_amount: this.taxAmount(),
      total:      this.total(),
      lines: this.lines.value.map((l: any) => ({
        ...l,
        total: l.quantity * l.unit_price,
      })),
    };

    this.invoiceService.create(payload).subscribe({
      next: () => this.router.navigate(['/invoices']),
      error: () => this.saving.set(false),
    });
  }
}
