import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../../../core/services/domain.services';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import {AuthService} from "../../../../../core/services/auth.service";

@Component({
    selector: 'app-client-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogModule, ToastModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './client-list.component.html',
    styleUrl: './client-list.component.scss',
})
export class ClientListComponent implements OnInit {
    clients    = signal<any[]>([]);
    loading    = signal(false);
    total      = signal(0);
    page       = signal(1);
    lastPage   = signal(1);

    search       = '';
    statusFilter = '';
    typeFilter   = '';
    private searchTimer: any;

    constructor(
        private clientService: ClientService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        public auth: AuthService,
    ) {}

    ngOnInit(): void { this.load(); }

    load(): void {
        this.loading.set(true);
        this.clientService.getAll({
            page: this.page(),
            search: this.search,
            status: this.statusFilter,
            type: this.typeFilter,
        }).subscribe({
            next: (res: any) => {
                this.clients.set(res.data);
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

    goPage(p: number): void { this.page.set(p); this.load(); }

    fullName(c: any): string {
        const n = [c.contact_first_name, c.contact_last_name].filter(Boolean).join(' ');
        return c.company_name ? `${c.company_name} (${n})` : n;
    }

    initials(c: any): string {
        return ((c.contact_first_name?.[0] ?? '') + (c.contact_last_name?.[0] ?? '')).toUpperCase();
    }

    deleteClient(client: any): void {
        this.confirmationService.confirm({
            message: `Supprimer <b>${this.fullName(client)}</b> ? Cette action est irréversible.`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-trash',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-secondary p-button-text',
            accept: () => {
                this.clientService.delete(client.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Supprimé', detail: 'Client supprimé.', life: 3000 });
                        this.load();
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer.' }),
                });
            },
        });
    }
}
