import { Component, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
 templateUrl: 'login.component.html',
    styleUrl: 'login.component.scss'
})
export class LoginComponent {
  form = this.fb.group({
    email:    ['admin@cleanapp.com', [Validators.required, Validators.email]],
    password: ['password', Validators.required],
  });

  loading      = signal(false);
  errorMsg     = signal('');
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Identifiants incorrects.');
        this.loading.set(false);
      },
    });
  }
}
