import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyService, ClientService } from '../../../../../core/services/domain.services';
import { Client } from '../../../../../core/models';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="page">
  <div class="page-header">
    <a routerLink="/properties" class="back-link">← Propriétés</a>
    <h1>{{ isEdit ? 'Modifier la propriété' : 'Nouvelle propriété' }}</h1>
  </div>

  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-layout">

    <div class="form-cols">
      <!-- Colonne gauche -->
      <div class="form-col">
        <div class="form-card">
          <h3>Informations générales</h3>

          <div class="form-group">
            <label>Client *</label>
            <select formControlName="client_id">
              <option value="">Sélectionner un client</option>
              <option *ngFor="let c of clients()" [value]="c.id">
                {{ c.display_name || c.company_name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Nom de la propriété *</label>
            <input formControlName="name" placeholder="Ex: Siège social Lyon" />
          </div>

          <div class="form-group">
            <label>Type *</label>
            <div class="type-grid">
              <label *ngFor="let t of propertyTypes" class="type-opt"
                     [class.selected]="form.get('type')?.value === t.value">
                <input type="radio" formControlName="type" [value]="t.value" hidden />
                <span class="type-icon">{{ t.icon }}</span>
                <span>{{ t.label }}</span>
              </label>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Surface (m²)</label>
              <input type="number" formControlName="area_sqm" placeholder="150" />
            </div>
            <div class="form-group">
              <label>Nombre d'étages</label>
              <input type="number" formControlName="floors" placeholder="1" min="1" />
            </div>
          </div>

          <div class="form-group">
            <label>Statut</label>
            <div class="radio-group">
              <label class="radio-opt" [class.selected]="form.get('status')?.value === 'active'">
                <input type="radio" formControlName="status" value="active" hidden />
                <span class="dot dot-green"></span> Actif
              </label>
              <label class="radio-opt" [class.selected]="form.get('status')?.value === 'inactive'">
                <input type="radio" formControlName="status" value="inactive" hidden />
                <span class="dot dot-red"></span> Inactif
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne droite -->
      <div class="form-col">
        <div class="form-card">
          <h3>Adresse</h3>
          <div class="form-group">
            <label>Adresse *</label>
            <input formControlName="address" placeholder="15 rue de la Paix" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Code postal *</label>
              <input formControlName="postal_code" placeholder="75001" />
            </div>
            <div class="form-group">
              <label>Ville *</label>
              <input formControlName="city" placeholder="Paris" />
            </div>
          </div>
          <div class="form-group">
            <label>Pays</label>
            <input formControlName="country" placeholder="France" />
          </div>
        </div>

        <div class="form-card">
          <h3>Accès</h3>
          <div class="form-group">
            <label>Code d'accès</label>
            <input formControlName="access_code" placeholder="1234#" />
          </div>
          <div class="form-group">
            <label>Emplacement des clés</label>
            <input formControlName="key_location" placeholder="Boîte à clé — code: 5678" />
          </div>
          <div class="form-group">
            <label>Instructions d'accès</label>
            <textarea formControlName="access_instructions" rows="3"
                      placeholder="Entrer par la porte de service, 2ème bâtiment à gauche..."></textarea>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea formControlName="notes" rows="2" placeholder="Informations complémentaires..."></textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <a routerLink="/properties" class="btn-cancel">Annuler</a>
      <button type="submit" class="btn-submit" [disabled]="form.invalid || saving()">
        {{ saving() ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer la propriété') }}
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
    .form-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 900px) { .form-cols { grid-template-columns: 1fr; } }
    .form-col { display: flex; flex-direction: column; gap: 20px; }
    .form-card { background: #13151f; border: 1px solid rgba(255,255,255,.06); border-radius: 14px; padding: 24px; }
    .form-card h3 { font-size: 13px; font-weight: 700; color: #8b90a0; margin: 0 0 20px; text-transform: uppercase; letter-spacing: .5px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
    .form-group label { font-size: 12px; font-weight: 600; color: #5a5f72; text-transform: uppercase; letter-spacing: .5px; }
    .form-group input, .form-group select, .form-group textarea { background: #1a1d2a; border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 10px 14px; color: #e8eaf0; font-size: 14px; outline: none; font-family: inherit; transition: border-color .2s; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #4fffb0; }
    .form-group textarea { resize: vertical; }

    .type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .type-opt { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px; border-radius: 8px; border: 1px solid rgba(255,255,255,.06); cursor: pointer; font-size: 12px; color: #5a5f72; transition: all .2s; text-align: center; }
    .type-opt.selected { border-color: #4fffb0; color: #4fffb0; background: rgba(79,255,176,.08); }
    .type-icon { font-size: 20px; }

    .radio-group { display: flex; gap: 8px; }
    .radio-opt { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,.06); cursor: pointer; font-size: 13px; color: #8b90a0; transition: all .2s; }
    .radio-opt.selected { border-color: #4fffb0; color: #e8eaf0; background: rgba(79,255,176,.08); }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot-green { background: #4fffb0; }
    .dot-red   { background: #ff4f6a; }

    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .btn-cancel { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); color: #8b90a0; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; }
    .btn-submit { background: linear-gradient(135deg, #4fffb0, #00cfff); border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 700; color: #000; cursor: pointer; font-family: inherit; }
    .btn-submit:disabled { opacity: .5; cursor: not-allowed; }
  `]
})
export class PropertyFormComponent implements OnInit {
  form = this.fb.group({
    client_id:            ['', Validators.required],
    name:                 ['', Validators.required],
    type:                 ['office', Validators.required],
    address:              ['', Validators.required],
    postal_code:          ['', Validators.required],
    city:                 ['', Validators.required],
    country:              ['France'],
    area_sqm:             [null],
    floors:               [1],
    access_code:          [''],
    key_location:         [''],
    access_instructions:  [''],
    notes:                [''],
    status:               ['active'],
  });

  clients  = signal<Client[]>([]);
  saving   = signal(false);
  isEdit   = false;

  propertyTypes = [
    { value: 'office',      label: 'Bureau',      icon: '🏢' },
    { value: 'residential', label: 'Résidentiel', icon: '🏠' },
    { value: 'industrial',  label: 'Industriel',  icon: '🏭' },
    { value: 'retail',      label: 'Commerce',    icon: '🏪' },
    { value: 'healthcare',  label: 'Santé',       icon: '🏥' },
    { value: 'school',      label: 'École',       icon: '🏫' },
    { value: 'other',       label: 'Autre',       icon: '🏗️' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private clientService: ClientService,
  ) {}

  ngOnInit(): void {
    this.clientService.getAll({ per_page: 100 }).subscribe((res: any) => {
      this.clients.set(res.data);
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.propertyService.getById(+id).subscribe(p => {
        this.form.patchValue({ ...p, client_id: String(p.client_id) } as any);
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const id = this.route.snapshot.paramMap.get('id');
    const req = id
      ? this.propertyService.update(+id, this.form.value as any)
      : this.propertyService.create(this.form.value as any);

    req.subscribe({
      next: () => this.router.navigate(['/properties']),
      error: () => this.saving.set(false),
    });
  }
}
