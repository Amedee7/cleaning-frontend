import { Component, OnInit, signal } from '@angular/core';
import {AppUser, Role, ROLE_COLORS, ROLE_LABELS} from "../../../../core/models/user.models";
import {UserService} from "../../../../core/services/user.services";
import {CommonModule, DatePipe} from "@angular/common";
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {ConfirmationService, MessageService} from "primeng/api";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import {AuthService} from "../../../../core/services/auth.service";


@Component({
  selector: 'app-user-list',
  standalone: true,
    imports: [CommonModule, DatePipe, RouterLink, FormsModule, ToastModule, ConfirmDialogModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
    users      = signal<AppUser[]>([]);
    roles      = signal<Role[]>([]);
    loading    = signal(false);
    total      = signal(0);
    page       = signal(1);
    lastPage   = signal(1);
    search       = '';
    roleFilter: number | null = null;
    activeFilter = '';
    private searchTimer: any;

    readonly ROLE_COLORS = ROLE_COLORS;

    constructor(
        private userService: UserService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        public auth: AuthService,
    ) {}

    ngOnInit(): void {
        this.userService.getRoles().subscribe(r => this.roles.set(r));
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.userService.getAll({
            page: this.page(), search: this.search,
            role_id: this.roleFilter ?? '', status: this.activeFilter,
        }).subscribe({
            next: (res: any) => {
                this.users.set(res.data);
                this.total.set(res.total);
                this.lastPage.set(res.last_page);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    onSearch(): void {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => { this.page.set(1); this.load(); }, 400);
    }

    setRole(id: number | null): void { this.roleFilter = id; this.page.set(1); this.load(); }
    goPage(p: number): void          { this.page.set(p); this.load(); }

    toggleActive(u: AppUser): void {
        const newStatus   = u.status === 'active' ? 'inactive' : 'active';
        const action      = newStatus === 'active' ? 'réactiver' : 'désactiver';
        const fullName    = `${u.first_name} ${u.last_name}`.trim();

        this.confirmationService.confirm({
            message: `Voulez-vous <b>${action}</b> le compte de <b>${fullName}</b> ?`,
            header: newStatus === 'active' ? 'Réactivation du compte' : 'Désactivation du compte',
            icon: newStatus === 'active' ? 'pi pi-check-circle' : 'pi pi-ban',
            acceptLabel: `Oui, ${action}`,
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: newStatus === 'active' ? 'p-button-success p-button-text' : 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-secondary p-button-text',
            accept: () => {
                this.userService.update(u.id, { status: newStatus }).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: newStatus === 'active' ? 'success' : 'warn',
                            summary:  newStatus === 'active' ? 'Compte réactivé' : 'Compte désactivé',
                            detail:   `${fullName} est maintenant ${newStatus === 'active' ? 'actif' : 'inactif'}.`,
                            life: 3000,
                        });
                        this.load();
                    },
                    error: () => this.messageService.add({
                        severity: 'error',
                        summary:  'Erreur',
                        detail:   'Impossible de modifier le statut.',
                    }),
                });
            },
        });
    }

    roleColor(slug: string): string  { return ROLE_COLORS[slug] ?? '#5a5f72'; }
    roleLabel(slug: string): string  { return ROLE_LABELS[slug] ?? slug; }
    avatarBg(u: AppUser): string     { return this.roleColor(u.role?.name ?? ''); }
}
