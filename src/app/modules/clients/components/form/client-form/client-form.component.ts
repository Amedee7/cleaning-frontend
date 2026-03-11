import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../../../../core/services/domain.services';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
templateUrl: './client-form.component.html',
    styleUrls: ['./client-form.component.scss']
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
