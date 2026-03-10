import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../../core/services/domain.services';

@Component({
  selector: 'app-staff-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="page">
  <div class="page-header">
    <a routerLink="/staff" class="back-link">← Personnel</a>
    <h1>{{ isEdit ? 'Modifier l\'agent' : 'Nouvel agent' }}</h1>
  </div>

  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-layout">

    <!-- Infos personnelles -->
    <div class="form-card">
      <h3>Informations personnelles</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Prénom *</label>
          <input formControlName="first_name" placeholder="Jean" />
        </div>
        <div class="form-group">
          <label>Nom *</label>
          <input formControlName="last_name" placeholder="Dupont" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Email *</label>
          <input type="email" formControlName="email" placeholder="jean@example.com" />
        </div>
        <div class="form-group">
          <label>Téléphone</label>
          <input formControlName="phone" placeholder="06 00 00 00 00" />
        </div>
      </div>
      <div class="form-group" *ngIf="!isEdit">
        <label>Mot de passe *</label>
        <input type="password" formControlName="password" placeholder="Minimum 8 caractères" />
      </div>
      <div class="form-group">
        <label>Statut</label>
        <div class="radio-group">
          <label class="radio-opt" *ngFor="let s of statusOptions"
                 [class.selected]="form.get('status')?.value === s.value">
            <input type="radio" formControlName="status" [value]="s.value" hidden />
            <span class="radio-dot" [ngClass]="'dot-' + s.value"></span>
            {{ s.label }}
          </label>
        </div>
      </div>
    </div>

    <!-- Profil professionnel -->
    <div class="form-card">
      <h3>Profil professionnel</h3>
      <div formGroupName="staffProfile">
        <div class="form-row">
          <div class="form-group">
            <label>N° Employé</label>
            <input formControlName="employee_number" placeholder="EMP-001" />
          </div>
          <div class="form-group">
            <label>Date d'embauche</label>
            <input type="date" formControlName="hire_date" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Poste / Titre</label>
            <input formControlName="position" placeholder="Chef d'équipe" />
          </div>
          <div class="form-group">
            <label>Zone géographique</label>
            <input formControlName="zone" placeholder="Lyon Centre, Paris Nord..." />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Taux horaire (€)</label>
            <input type="number" formControlName="hourly_rate" placeholder="12.50" step="0.50" />
          </div>
          <div class="form-group">
            <label>Heures hebdo</label>
            <input type="number" formControlName="weekly_hours" placeholder="35" />
          </div>
        </div>
        <div class="form-group">
          <label>Compétences</label>
          <textarea formControlName="skills" rows="2"
                    placeholder="Nettoyage industriel, désinfection, travaux en hauteur..."></textarea>
        </div>
        <div class="form-group">
          <label>Certifications</label>
          <textarea formControlName="certifications" rows="2"
                    placeholder="CACES, habilitation électrique..."></textarea>
        </div>

        <!-- Disponibilités -->
        <div class="form-group">
          <label>Disponibilités</label>
          <div class="days-grid">
            <label *ngFor="let d of days" class="day-opt"
                   [class.selected]="isDaySelected(d.key)">
              <input type="checkbox" [checked]="isDaySelected(d.key)"
                     (change)="toggleDay(d.key)" hidden />
              {{ d.label }}
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact urgence -->
    <div class="form-card">
      <h3>Contact d'urgence</h3>
      <div formGroupName="staffProfile">
        <div class="form-row">
          <div class="form-group">
            <label>Nom du contact</label>
            <input formControlName="emergency_contact_name" placeholder="Marie Dupont" />
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input formControlName="emergency_contact_phone" placeholder="06 00 00 00 00" />
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <a routerLink="/staff" class="btn-cancel">Annuler</a>
      <button type="submit" class="btn-submit" [disabled]="form.invalid || saving()">
        {{ saving() ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer l\'agent') }}
      </button>
    </div>
  </form>
</div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 8px; }
    .back-link { font-size: 13px; color: #4fffb0; text-decoration: none; display: block; margin-bottom: 4px; }
    .back-link:hover { text-decoration: underline; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 20px; }

    .form-layout { display: flex; flex-direction: column; gap: 20px; }
    .form-card { background: #13151f; border: 1px solid rgba(255,255,255,.06); border-radius: 14px; padding: 24px; }
    .form-card h3 { font-size: 13px; font-weight: 700; color: #8b90a0; margin: 0 0 20px; text-transform: uppercase; letter-spacing: .5px; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }

    .form-group { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
    .form-group label { font-size: 12px; font-weight: 600; color: #5a5f72; text-transform: uppercase; letter-spacing: .5px; }
    .form-group input, .form-group textarea, .form-group select {
      background: #1a1d2a; border: 1px solid rgba(255,255,255,.08);
      border-radius: 8px; padding: 10px 14px; color: #e8eaf0;
      font-size: 14px; outline: none; font-family: inherit; transition: border-color .2s;
    }
    .form-group input:focus, .form-group textarea:focus { border-color: #4fffb0; }
    .form-group textarea { resize: vertical; }

    .radio-group { display: flex; gap: 8px; }
    .radio-opt { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,.06); cursor: pointer; font-size: 13px; color: #8b90a0; transition: all .2s; }
    .radio-opt.selected { border-color: #4fffb0; color: #e8eaf0; background: rgba(79,255,176,.08); }
    .radio-dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot-active   { background: #4fffb0; }
    .dot-inactive { background: #ff4f6a; }
    .dot-suspended{ background: #ffd54f; }

    .days-grid { display: flex; gap: 8px; flex-wrap: wrap; }
    .day-opt { padding: 7px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,.06); cursor: pointer; font-size: 13px; color: #5a5f72; transition: all .2s; }
    .day-opt.selected { border-color: #4fffb0; color: #4fffb0; background: rgba(79,255,176,.08); }

    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .btn-cancel { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); color: #8b90a0; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; }
    .btn-submit { background: linear-gradient(135deg, #4fffb0, #00cfff); border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 700; color: #000; cursor: pointer; font-family: inherit; }
    .btn-submit:disabled { opacity: .5; cursor: not-allowed; }
  `]
})
export class StaffFormComponent implements OnInit {
  form = this.fb.group({
    first_name: ['', Validators.required],
    last_name:  ['', Validators.required],
    email:      ['', [Validators.required, Validators.email]],
    phone:      [''],
    password:   ['', Validators.minLength(8)],
    status:     ['active'],
    staffProfile: this.fb.group({
      employee_number:         [''],
      hire_date:               [''],
      position:                [''],
      zone:                    [''],
      hourly_rate:             [null],
      weekly_hours:            [35],
      skills:                  [''],
      certifications:          [''],
      emergency_contact_name:  [''],
      emergency_contact_phone: [''],
    }),
  });

  isEdit   = false;
  saving   = signal(false);
  selectedDays = signal<string[]>([]);

  days = [
    { key: 'mon', label: 'Lun' },
    { key: 'tue', label: 'Mar' },
    { key: 'wed', label: 'Mer' },
    { key: 'thu', label: 'Jeu' },
    { key: 'fri', label: 'Ven' },
    { key: 'sat', label: 'Sam' },
    { key: 'sun', label: 'Dim' },
  ];

  statusOptions = [
    { value: 'active',    label: 'Actif' },
    { value: 'inactive',  label: 'Inactif' },
    { value: 'suspended', label: 'Suspendu' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.form.get('password')?.clearValidators();
      this.userService.getById(+id).subscribe(u => {
        this.form.patchValue({
          first_name: u.first_name,
          last_name:  u.last_name,
          email:      u.email,
          phone:      u.phone ?? '',
          status:     u.status,
        });
        if (u.staff_profile) {
          this.form.get('staffProfile')?.patchValue(u.staff_profile as any);
          const avail = u.staff_profile.availability as Record<string, boolean> ?? {};
          this.selectedDays.set(Object.keys(avail).filter(k => avail[k]));
        }
      });
    }
  }

  isDaySelected(key: string): boolean { return this.selectedDays().includes(key); }

  toggleDay(key: string): void {
    const d = this.selectedDays();
    this.selectedDays.set(d.includes(key) ? d.filter(k => k !== key) : [...d, key]);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const avail: Record<string, boolean> = {};
    this.days.forEach(d => { avail[d.key] = this.selectedDays().includes(d.key); });

    const payload: any = {
      ...this.form.value,
      staffProfile: { ...this.form.value.staffProfile, availability: avail },
    };

    const id = this.route.snapshot.paramMap.get('id');
    const req = id
      ? this.userService.update(+id, payload)
      : this.userService.create(payload);

    req.subscribe({
      next: () => this.router.navigate(['/staff']),
      error: () => this.saving.set(false),
    });
  }
}
