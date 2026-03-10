import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string; icon: string; route: string; roles?: string[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
<div class="shell">
  <!-- Sidebar -->
  <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">✦</span>
        <span class="logo-text">CleanPro</span>
      </div>
      <button class="collapse-btn" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
        {{ sidebarCollapsed() ? '→' : '←' }}
      </button>
    </div>

    <nav class="sidebar-nav">
      <ng-container *ngFor="let item of navItems">
        <a [routerLink]="item.route" routerLinkActive="active"
           class="nav-item" [title]="item.label">
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      </ng-container>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">{{ initials() }}</div>
        <div class="user-details">
          <span class="user-name">{{ auth.user()?.full_name }}</span>
          <span class="user-role">{{ auth.user()?.role }}</span>
        </div>
      </div>
      <button class="logout-btn" (click)="auth.logout()" title="Déconnexion">⏻</button>
    </div>
  </aside>

  <!-- Main content -->
  <main class="main-content">
    <header class="topbar">
      <div class="topbar-left">
        <h1 class="page-title">Cleaning Management</h1>
      </div>
      <div class="topbar-right">
        <span class="topbar-date">{{ today | date:'EEEE d MMMM yyyy':'' }}</span>
      </div>
    </header>
    <div class="content-area">
      <router-outlet />
    </div>
  </main>
</div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }

    .shell {
      display: flex; height: 100vh;
      background: #0f1117; color: #e8eaf0;
      font-family: 'DM Sans', sans-serif;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 260px; min-height: 100vh;
      background: #13151f;
      border-right: 1px solid rgba(255,255,255,.06);
      display: flex; flex-direction: column;
      transition: width .3s ease;
      position: relative; z-index: 10;
    }
    .sidebar.collapsed { width: 72px; }
    .sidebar.collapsed .logo-text,
    .sidebar.collapsed .nav-label,
    .sidebar.collapsed .user-details { display: none; }

    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 24px 20px 20px;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #4fffb0, #00cfff);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; color: #000; font-weight: 700; flex-shrink: 0;
    }
    .logo-text { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -.5px; }
    .collapse-btn {
      background: none; border: 1px solid rgba(255,255,255,.1); color: #888;
      border-radius: 6px; width: 28px; height: 28px; cursor: pointer;
      font-size: 12px; display: flex; align-items: center; justify-content: center;
    }
    .collapse-btn:hover { color: #fff; border-color: rgba(255,255,255,.3); }

    .sidebar-nav {
      flex: 1; padding: 12px 12px; display: flex; flex-direction: column; gap: 2px;
      overflow-y: auto;
    }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 8px;
      color: #8b90a0; text-decoration: none; font-size: 14px; font-weight: 500;
      transition: all .2s;
    }
    .nav-item:hover { background: rgba(255,255,255,.05); color: #e8eaf0; }
    .nav-item.active {
      background: rgba(79,255,176,.1); color: #4fffb0;
      border-left: 3px solid #4fffb0; padding-left: 9px;
    }
    .nav-icon { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
    .nav-label { white-space: nowrap; overflow: hidden; }

    .sidebar-footer {
      padding: 16px; border-top: 1px solid rgba(255,255,255,.06);
      display: flex; align-items: center; gap: 10px;
    }
    .user-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #4fffb0, #00cfff);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: #000; flex-shrink: 0;
    }
    .user-details { min-width: 0; }
    .user-name { display: block; font-size: 13px; font-weight: 600; color: #e8eaf0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { display: block; font-size: 11px; color: #4fffb0; text-transform: uppercase; letter-spacing: .5px; }
    .logout-btn {
      background: none; border: none; color: #555; cursor: pointer;
      font-size: 18px; padding: 4px; transition: color .2s; flex-shrink: 0;
    }
    .logout-btn:hover { color: #ff4f6a; }

    /* ── Main ── */
    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 32px; height: 64px;
      background: #13151f; border-bottom: 1px solid rgba(255,255,255,.06);
      flex-shrink: 0;
    }
    .page-title { font-size: 16px; font-weight: 600; color: #e8eaf0; margin: 0; }
    .topbar-date { font-size: 13px; color: #555; }
    .content-area { flex: 1; overflow-y: auto; padding: 32px; }
  `]
})
export class ShellComponent {
  sidebarCollapsed = signal(false);
  today = new Date();

  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: '⬛', route: '/dashboard' },
    { label: 'Clients',         icon: '👥', route: '/clients' },
    { label: 'Propriétés',      icon: '🏢', route: '/properties' },
    { label: 'Interventions',   icon: '📅', route: '/schedules' },
    { label: 'Personnel',       icon: '👷', route: '/staff' },
    { label: 'Rapports',        icon: '📋', route: '/reports' },
    { label: 'Factures',        icon: '💶', route: '/invoices' },
    { label: 'Incidents',       icon: '⚠️',  route: '/incidents' },
  ];

  constructor(public auth: AuthService) {}

  initials(): string {
    const name = this.auth.user()?.full_name ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
