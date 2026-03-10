import { Component, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
<div class="login-page">
  <div class="login-card">
    <div class="login-brand">
      <div class="brand-icon">✦</div>
      <h1>CleanPro</h1>
      <p>Gestion des interventions de nettoyage</p>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
      <div class="form-group">
        <label>Email</label>
        <input type="email" formControlName="email" placeholder="admin@cleanapp.com"
               [class.error]="form.get('email')?.invalid && form.get('email')?.touched" />
      </div>

      <div class="form-group">
        <label>Mot de passe</label>
        <div class="password-field">
          <input [type]="showPassword() ? 'text' : 'password'" formControlName="password"
                 placeholder="••••••••"
                 [class.error]="form.get('password')?.invalid && form.get('password')?.touched" />
          <button type="button" class="toggle-pw" (click)="showPassword.set(!showPassword())">
            {{ showPassword() ? '🙈' : '👁️' }}
          </button>
        </div>
      </div>

      <div class="error-msg" *ngIf="errorMsg()">{{ errorMsg() }}</div>

      <button type="submit" class="btn-login" [disabled]="loading() || form.invalid">
        <span *ngIf="!loading()">Se connecter</span>
        <span *ngIf="loading()" class="spinner">⟳</span>
      </button>
    </form>

    <div class="login-hint">
      <span>Demo : admin&#64;cleanapp.com / password</span>
    </div>
  </div>

  <div class="login-bg">
    <div class="bg-circle c1"></div>
    <div class="bg-circle c2"></div>
    <div class="bg-circle c3"></div>
  </div>
</div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #0f1117; position: relative; overflow: hidden;
    }
    .login-bg { position: absolute; inset: 0; pointer-events: none; }
    .bg-circle {
      position: absolute; border-radius: 50%;
      background: radial-gradient(circle, rgba(79,255,176,.15), transparent 70%);
    }
    .c1 { width: 600px; height: 600px; top: -200px; right: -100px; }
    .c2 { width: 400px; height: 400px; bottom: -150px; left: -100px;
          background: radial-gradient(circle, rgba(0,207,255,.1), transparent 70%); }
    .c3 { width: 300px; height: 300px; top: 50%; left: 50%;
          background: radial-gradient(circle, rgba(79,255,176,.05), transparent 70%); }

    .login-card {
      background: #13151f; border: 1px solid rgba(255,255,255,.08);
      border-radius: 20px; padding: 48px 40px;
      width: 100%; max-width: 420px; position: relative; z-index: 1;
      box-shadow: 0 24px 80px rgba(0,0,0,.5);
    }
    .login-brand { text-align: center; margin-bottom: 36px; }
    .brand-icon {
      width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 16px;
      background: linear-gradient(135deg, #4fffb0, #00cfff);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
    }
    .login-brand h1 { font-size: 28px; font-weight: 800; color: #fff; margin: 0 0 6px; letter-spacing: -1px; }
    .login-brand p  { font-size: 14px; color: #5a5f72; margin: 0; }

    .login-form { display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 13px; font-weight: 600; color: #8b90a0; text-transform: uppercase; letter-spacing: .5px; }
    .form-group input {
      background: #1a1d2a; border: 1px solid rgba(255,255,255,.08);
      border-radius: 10px; padding: 12px 16px; color: #e8eaf0;
      font-size: 15px; outline: none; transition: border-color .2s;
      font-family: inherit; width: 100%; box-sizing: border-box;
    }
    .form-group input:focus { border-color: #4fffb0; }
    .form-group input.error { border-color: #ff4f6a; }
    .password-field { position: relative; }
    .password-field input { padding-right: 48px; }
    .toggle-pw {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 16px;
    }
    .error-msg { color: #ff4f6a; font-size: 13px; text-align: center; }
    .btn-login {
      background: linear-gradient(135deg, #4fffb0, #00cfff);
      border: none; border-radius: 10px; padding: 14px;
      font-size: 15px; font-weight: 700; color: #000;
      cursor: pointer; transition: opacity .2s, transform .2s;
      font-family: inherit;
    }
    .btn-login:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
    .btn-login:disabled { opacity: .5; cursor: not-allowed; }
    .spinner { display: inline-block; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .login-hint { text-align: center; margin-top: 20px; font-size: 12px; color: #3a3f52; }
  `]
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
