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
  templateUrl: 'shell.component.html',
    styleUrls: ['shell.component.scss'],
})
export class ShellComponent {
  sidebarCollapsed = signal(false);
  today = new Date();

  navItems = [
    { route: '/dashboard', icon: '📊', label: 'Tableau de bord' },
    { route: '/orders',    icon: '🧾', label: 'Commandes' },
    { route: '/articles',  icon: '👔', label: 'Articles' },
      { route: '/clients',   icon: '👥', label: 'Clients' },
      { route: '/reports',   icon: '📈', label: 'Rapports' },
      { route: '/users',     icon: '🔑', label: 'Utilisateurs' },
      { route: '/settings',  icon: '⚙️',  label: 'Paramètres' },
  ];

  constructor(public auth: AuthService) {}

  initials(): string {
    const name = this.auth.user()?.full_name ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
