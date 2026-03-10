import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { IncidentService } from '../../../../core/services/domain.services';
import { Incident } from '../../../../core/models';

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ReactiveFormsModule],
  template: `
<div class="page">
  <div class="page-header">
    <div>
      <h1>Incidents</h1>
      <p class="subtitle">{{ total() }} incidents enregistrés</p>
    </div>
    <button class="btn-primary" (click)="showForm.set(!showForm())">
      {{ showForm() ? '✕ Fermer' : '+ Signaler un incident' }}
    </button>
  </div>

  <!-- Formulaire rapide -->
  <div class="quick-form" *ngIf="showForm()">
    <h3>Signaler un incident</h3>
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
      <div class="form-group span-2">
        <label>Titre *</label>
        <input formControlName="title" placeholder="Résumé de l'incident" />
      </div>
      <div class="form-group">
        <label>Sévérité *</label>
        <select formControlName="severity">
          <option value="low">Faible</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="critical">Critique</option>
        </select>
      </div>
      <div class="form-group">
        <label>Type *</label>
        <select formControlName="type">
          <option value="damage">Dommage</option>
          <option value="theft">Vol</option>
          <option value="injury">Blessure</option>
          <option value="complaint">Réclamation</option>
          <option value="equipment_failure">Panne matériel</option>
          <option value="other">Autre</option>
        </select>
      </div>
      <div class="form-group span-2">
        <label>Description *</label>
        <textarea formControlName="description" rows="3" placeholder="Décrivez l'incident en détail..."></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-cancel" (click)="showForm.set(false)">Annuler</button>
        <button type="submit" class="btn-submit" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Envoi...' : 'Signaler' }}
        </button>
      </div>
    </form>
  </div>

  <!-- Filters -->
  <div class="filters">
    <button *ngFor="let f of severityFilters" class="qf-btn"
            [class.active]="severityFilter === f.value"
            (click)="setSeverity(f.value)">
      <span [ngClass]="'dot-' + f.value">●</span> {{ f.label }}
    </button>
    <div class="spacer"></div>
    <select [(ngModel)]="statusFilter" (ngModelChange)="load()" class="filter-select">
      <option value="">Tous les statuts</option>
      <option value="open">Ouvert</option>
      <option value="in_review">En examen</option>
      <option value="resolved">Résolu</option>
      <option value="closed">Fermé</option>
    </select>
  </div>

  <!-- Table -->
  <div class="table-card">
    <div class="loading-bar" *ngIf="loading()"></div>
    <table>
      <thead>
        <tr>
          <th>Incident</th>
          <th>Sévérité</th>
          <th>Type</th>
          <th>Propriété</th>
          <th>Date</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let inc of incidents()">
          <td>
            <div class="incident-title">{{ inc.title }}</div>
            <div class="incident-desc">{{ inc.description | slice:0:60 }}{{ inc.description.length > 60 ? '...' : '' }}</div>
          </td>
          <td>
            <span class="severity-badge" [ngClass]="'sev-' + inc.severity">
              {{ severityLabel(inc.severity) }}
            </span>
          </td>
          <td>
            <span class="type-tag">{{ typeLabel(inc.type) }}</span>
          </td>
          <td>{{ inc.property?.name || '—' }}</td>
          <td>{{ inc.created_at | date:'dd/MM/yyyy' }}</td>
          <td>
            <span class="badge" [ngClass]="'badge-' + inc.status">
              {{ statusLabel(inc.status) }}
            </span>
          </td>
          <td>
            <div class="actions">
              <button *ngIf="inc.status === 'open' || inc.status === 'in_review'"
                      class="btn-resolve" (click)="resolve(inc)">✓ Résoudre</button>
            </div>
          </td>
        </tr>
        <tr *ngIf="!loading() && !incidents().length">
          <td colspan="7" class="empty">Aucun incident trouvé ✅</td>
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
    .btn-primary { background: linear-gradient(135deg, #4fffb0, #00cfff); color: #000; font-weight: 700; font-size: 14px; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-family: inherit; white-space: nowrap; }

    /* Quick form */
    .quick-form { background: #13151f; border: 1px solid rgba(79,255,176,.2); border-radius: 14px; padding: 24px; }
    .quick-form h3 { font-size: 14px; font-weight: 700; color: #4fffb0; margin: 0 0 20px; text-transform: uppercase; letter-spacing: .5px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 7px; }
    .form-group.span-2 { grid-column: 1/-1; }
    .form-group label { font-size: 12px; font-weight: 600; color: #5a5f72; text-transform: uppercase; letter-spacing: .5px; }
    .form-group input, .form-group select, .form-group textarea { background: #1a1d2a; border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 10px 14px; color: #e8eaf0; font-size: 14px; outline: none; font-family: inherit; transition: border-color .2s; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #4fffb0; }
    .form-group textarea { resize: vertical; }
    .form-actions { grid-column: 1/-1; display: flex; gap: 12px; justify-content: flex-end; }
    .btn-cancel { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); color: #8b90a0; padding: 9px 18px; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 13px; }
    .btn-submit { background: linear-gradient(135deg, #4fffb0, #00cfff); border: none; border-radius: 8px; padding: 9px 20px; font-size: 13px; font-weight: 700; color: #000; cursor: pointer; font-family: inherit; }
    .btn-submit:disabled { opacity: .5; cursor: not-allowed; }

    /* Filters */
    .filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .spacer { flex: 1; }
    .qf-btn { background: #13151f; border: 1px solid rgba(255,255,255,.08); color: #5a5f72; padding: 7px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; font-family: inherit; transition: all .2s; display: flex; align-items: center; gap: 6px; }
    .qf-btn.active { border-color: #4fffb0; color: #e8eaf0; }
    .dot-low      { color: #4fffb0; }
    .dot-medium   { color: #ffd54f; }
    .dot-high     { color: #ff9800; }
    .dot-critical { color: #ff4f6a; }
    .filter-select { background: #13151f; border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 9px 12px; color: #e8eaf0; font-size: 14px; outline: none; font-family: inherit; }

    /* Table */
    .table-card { background: #13151f; border: 1px solid rgba(255,255,255,.06); border-radius: 14px; overflow: hidden; position: relative; }
    .loading-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #4fffb0, #00cfff); animation: slide 1.5s linear infinite; }
    @keyframes slide { 0%{transform:translateX(-100%)}100%{transform:translateX(100%)} }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 14px 16px; font-size: 11px; font-weight: 700; color: #5a5f72; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid rgba(255,255,255,.06); }
    td { padding: 12px 16px; font-size: 14px; color: #c8cad4; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,.02); }
    .incident-title { font-weight: 600; color: #e8eaf0; margin-bottom: 2px; }
    .incident-desc  { font-size: 12px; color: #5a5f72; }
    .severity-badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .sev-low      { background: rgba(79,255,176,.1);  color: #4fffb0; }
    .sev-medium   { background: rgba(255,213,79,.1);  color: #ffd54f; }
    .sev-high     { background: rgba(255,152,0,.1);   color: #ff9800; }
    .sev-critical { background: rgba(255,79,106,.15); color: #ff4f6a; }
    .type-tag { font-size: 12px; color: #8b90a0; }
    .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge-open      { background: rgba(255,79,106,.15);  color: #ff4f6a; }
    .badge-in_review { background: rgba(255,213,79,.15);  color: #ffd54f; }
    .badge-resolved  { background: rgba(79,255,176,.15);  color: #4fffb0; }
    .badge-closed    { background: rgba(255,255,255,.05);  color: #3a3f52; }
    .actions { display: flex; gap: 6px; }
    .btn-resolve { background: rgba(79,255,176,.1); border: 1px solid rgba(79,255,176,.2); color: #4fffb0; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-family: inherit; transition: all .2s; white-space: nowrap; }
    .btn-resolve:hover { background: rgba(79,255,176,.2); }
    .empty { text-align: center; color: #3a3f52; padding: 40px; font-size: 14px; }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
    .pagination button { background: #13151f; border: 1px solid rgba(255,255,255,.08); color: #e8eaf0; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: inherit; }
    .pagination button:disabled { opacity: .3; cursor: not-allowed; }
    .pagination span { font-size: 14px; color: #5a5f72; }
  `]
})
export class IncidentListComponent implements OnInit {
  incidents      = signal<Incident[]>([]);
  loading        = signal(false);
  saving         = signal(false);
  showForm       = signal(false);
  total          = signal(0);
  page           = signal(1);
  lastPage       = signal(1);
  severityFilter = '';
  statusFilter   = '';

  form = this.fb.group({
    title:       ['', Validators.required],
    severity:    ['medium', Validators.required],
    type:        ['other', Validators.required],
    description: ['', Validators.required],
  });

  severityFilters = [
    { value: '',         label: 'Tous' },
    { value: 'critical', label: 'Critique' },
    { value: 'high',     label: 'Haute' },
    { value: 'medium',   label: 'Moyenne' },
    { value: 'low',      label: 'Faible' },
  ];

  constructor(private incidentService: IncidentService, private fb: FormBuilder) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.incidentService.getAll({
      page: this.page(), severity: this.severityFilter, status: this.statusFilter,
    }).subscribe({
      next: (res: any) => {
        this.incidents.set(res.data);
        this.total.set(res.total);
        this.lastPage.set(res.last_page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setSeverity(v: string): void { this.severityFilter = v; this.page.set(1); this.load(); }
  goPage(p: number): void      { this.page.set(p); this.load(); }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.incidentService.create(this.form.value as any).subscribe({
      next: () => {
        this.form.reset({ severity: 'medium', type: 'other' });
        this.showForm.set(false);
        this.saving.set(false);
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  resolve(inc: Incident): void {
    const resolution = prompt('Description de la résolution :');
    if (!resolution) return;
    this.incidentService.update(inc.id, { status: 'resolved', resolution }).subscribe(() => this.load());
  }

  severityLabel(s: string): string {
    return { low:'Faible', medium:'Moyenne', high:'Haute', critical:'Critique' }[s] ?? s;
  }
  typeLabel(t: string): string {
    return { damage:'Dommage', theft:'Vol', injury:'Blessure', complaint:'Réclamation', equipment_failure:'Panne', other:'Autre' }[t] ?? t;
  }
  statusLabel(s: string): string {
    return { open:'Ouvert', in_review:'En examen', resolved:'Résolu', closed:'Fermé' }[s] ?? s;
  }
}
