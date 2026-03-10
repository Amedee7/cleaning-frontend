import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../../../../core/services/domain.services';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="page">
  <div class="page-header">
    <a routerLink="/clients" class="back-link">← Clients</a>
    <h1>{{ isEdit ? 'Modifier le client' : 'Nouveau client' }}</h1>
  </div>

  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-layout">

    <!-- Type de client -->
    <div class="form-card">
      <h3>Type de client</h3>
      <div class="type-toggle">
        <label class="toggle-opt" [class.selected]="form.get('type')?.value === 'company'">
          <input type="radio" formControlName="type" value="company" hidden />
          🏢 Entreprise
        </label>
        <label class="toggle-opt" [class.selected]="form.get('type')?.value === 'individual'">
          <input type="radio" formControlName="type" value="individual" hidden />
          👤 Particulier
        </label>
      </div>
    </div>

    <div class="form-cols">
      <div class="form-col">
        <div class="form-card">
          <h3>Informations du contact</h3>

          <div class="form-group" *ngIf="form.get('type')?.value === 'company'">
            <label>Raison sociale</label>
            <input formControlName="company_name" placeholder="ACME Corporation" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Prénom *</label>
              <input formControlName="contact_first_name" placeholder="Jean" />
            </div>
            <div class="form-group">
              <label>Nom *</label>
              <input formControlName="contact_last_name" placeholder="Dupont" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Email *</label>
              <input type="email" formControlName="email" placeholder="contact@acme.fr" />
            </div>
            <div class="form-group">
              <label>Téléphone *</label>
              <input formControlName="phone" placeholder="01 23 45 67 89" />
            </div>
          </div>

          <div class="form-group">
            <label>Mobile</label>
            <input formControlName="mobile" placeholder="06 00 00 00 00" />
          </div>

          <div class="form-group" *ngIf="form.get('type')?.value === 'company'">
            <label>Numéro TVA</label>
            <input formControlName="tax_number" placeholder="FR 00 000000000" />
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

      <div class="form-col">
        <div class="form-card">
          <h3>Adresse de facturation</h3>
          <div class="form-group">
            <label>Adresse *</label>
            <input formControlName="billing_address" placeholder="15 rue de la Paix" />
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
          <h3>Notes</h3>
          <div class="form-group">
            <textarea formControlName="notes" rows="4"
                      placeholder="Informations complémentaires, préférences, historique..."></textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <a routerLink="/clients" class="btn-cancel">Annuler</a>
      <button type="submit" class="btn-submit" [disabled]="form.invalid || saving()">
        {{ saving() ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer le client') }}
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

    .type-toggle { display: flex; gap: 12px; }
    .toggle-opt { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 10px; border: 2px solid rgba(255,255,255,.06); cursor: pointer; font-size: 15px; font-weight: 600; color: #5a5f72; transition: all .2s; flex: 1; justify-content: center; }
    .toggle-opt.selected { border-color: #4fffb0; color: #4fffb0; background: rgba(79,255,176,.08); }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
    .form-group label { font-size: 12px; font-weight: 600; color: #5a5f72; text-transform: uppercase; letter-spacing: .5px; }
    .form-group input, .form-group textarea { background: #1a1d2a; border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 10px 14px; color: #e8eaf0; font-size: 14px; outline: none; font-family: inherit; transition: border-color .2s; }
    .form-group input:focus, .form-group textarea:focus { border-color: #4fffb0; }
    .form-group textarea { resize: vertical; }

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
export class ClientFormComponent implements OnInit {
  form = this.fb.group({
    type:                 ['company'],
    company_name:         [''],
    contact_first_name:   ['', Validators.required],
    contact_last_name:    ['', Validators.required],
    email:                ['', [Validators.required, Validators.email]],
    phone:                ['', Validators.required],
    mobile:               [''],
    billing_address:      ['', Validators.required],
    postal_code:          ['', Validators.required],
    city:                 ['', Validators.required],
    country:              ['France'],
    tax_number:           [''],
    status:               ['active'],
    notes:                [''],
  });

  isEdit = false;
  saving = signal(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.clientService.getById(+id).subscribe(c => {
        this.form.patchValue(c as any);
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const id = this.route.snapshot.paramMap.get('id');
    const req = id
      ? this.clientService.update(+id, this.form.value as any)
      : this.clientService.create(this.form.value as any);

    req.subscribe({
      next: () => this.router.navigate(['/clients']),
      error: () => this.saving.set(false),
    });
  }
}
