// components/groupes-tarifaires/groupes-tarifaires-list.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import {GroupeTarifaire, GroupeTarifaireService} from "../../../../core/services/groupes-tarifaires.service";

@Component({
    selector: 'app-groupes-tarifaires-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogModule, ToastModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './groupes-tarifaires-list.component.html',
    styleUrls: ['./groupes-tarifaires-list.component.scss']
})
export class GroupesTarifairesListComponent implements OnInit {
    groupes = signal<GroupeTarifaire[]>([]);
    loading = signal(false);
    total = signal(0);
    totalClients = signal(0);
    stats = signal<any>({});

    search = '';
    statusFilter = '';
    showModal = false;
    editingGroupe: GroupeTarifaire | null = null;

    formData: Partial<GroupeTarifaire> = {
        name: '',
        description: '',
        default_discount: 0,
        is_active: true
    };

    private searchTimer: any;

    constructor(
        private groupeService: GroupeTarifaireService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.load();
        this.loadStats();
    }

    load(): void {
        this.loading.set(true);
        this.groupeService.getAll({
            search: this.search,
            status: this.statusFilter
        }).subscribe({
            next: (res: any) => {
                this.groupes.set(res.data);
                this.total.set(res.total || res.data.length);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    loadStats(): void {
        this.groupeService.getStats().subscribe({
            next: (stats) => {
                this.stats.set(stats);
                this.totalClients.set(stats.total_clients || 0);
            }
        });
    }

    onSearch(): void {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.load(), 300);
    }

    openCreateModal(): void {
        this.editingGroupe = null;
        this.formData = {
            name: '',
            description: '',
            default_discount: 0,
            is_active: true
        };
        this.showModal = true;
    }

    openEditModal(groupe: GroupeTarifaire): void {
        this.editingGroupe = groupe;
        this.formData = { ...groupe };
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.editingGroupe = null;
    }

    isFormValid(): boolean {
        return !!this.formData.name?.trim();
    }

    saveGroupe(): void {
        if (!this.isFormValid()) return;

        const request = this.editingGroupe
            ? this.groupeService.update(this.editingGroupe.id, this.formData)
            : this.groupeService.create(this.formData);

        request.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.editingGroupe ? 'Groupe modifié' : 'Groupe créé',
                    detail: `Le groupe ${this.formData.name} a été ${this.editingGroupe ? 'modifié' : 'créé'} avec succès.`
                });
                this.closeModal();
                this.load();
                this.loadStats();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: err?.error?.message || 'Une erreur est survenue'
                });
            }
        });
    }

    deleteGroupe(groupe: GroupeTarifaire): void {
        this.confirmationService.confirm({
            message: `Supprimer le groupe <b>${groupe.name}</b> ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                this.groupeService.deleteGroupeT(groupe.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Groupe supprimé',
                            detail: `${groupe.name} a été supprimé.`
                        });
                        this.load();
                        this.loadStats();
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: err?.error?.message || 'Impossible de supprimer ce groupe'
                        });
                    }
                });
            }
        });
    }
}
