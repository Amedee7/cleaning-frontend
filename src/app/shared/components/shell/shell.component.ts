import { Component, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem  { label: string; icon: string; route: string; permission?: string; roles?: string[]; }
interface NavLabel { type: 'label'; label: string; }
type NavEntry = NavItem | NavLabel;

@Component({
    selector: 'app-shell',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
    templateUrl: 'shell.component.html',
    styleUrl: 'shell.component.scss',
})
export class ShellComponent {
    sidebarCollapsed = signal(false);
    today = new Date();

    constructor(public auth: AuthService) {}

    private readonly ALL_NAV: NavEntry[] = [
        { type: 'label', label: 'Principal' },
        { route: '/dashboard', icon: '📊', label: 'Tableau de bord' },
        { route: '/orders',    icon: '🧾', label: 'Commandes',    permission: 'orders.view'   },
        { route: '/articles',  icon: '👔', label: 'Articles',     permission: 'articles.view' },
        { type: 'label', label: 'Gestion' },
        { route: '/clients',   icon: '👥', label: 'Clients',      permission: 'orders.view'   },
        { route: '/reports',   icon: '📈', label: 'Rapports',     permission: 'reports.view'  },
        { type: 'label', label: 'Administration' },
        { route: '/users',    icon: '🔑', label: 'Utilisateurs',  roles: ['super_admin', 'admin', 'manager'] },
        { route: '/settings', icon: '⚙️', label: 'Paramètres',    roles: ['super_admin', 'admin']            },
    ];

    // computed() — à appeler avec navItems() dans le template
    navItems = computed((): NavEntry[] => {
        const result: NavEntry[] = [];
        let pendingLabel: NavLabel | null = null;

        for (const entry of this.ALL_NAV) {
            if ('type' in entry) { pendingLabel = entry; continue; }

            if (entry.roles?.length && !entry.roles.includes(this.auth.roleName())) continue;
            if (entry.permission   && !this.auth.can(entry.permission))             continue;

            if (pendingLabel) { result.push(pendingLabel); pendingLabel = null; }
            result.push(entry);
        }
        return result;
    });

    isLabel(e: NavEntry): e is NavLabel { return 'type' in e; }

    initials(): string { return this.auth.initials(); }

    // Nom affiché dans la sidebar
    displayName(): string { return this.auth.fullName(); }

    // Rôle affiché dans la sidebar
    displayRole(): string {
        const role = this.auth.user()?.role;
        return role?.label ?? role?.name ?? '';
    }
}
