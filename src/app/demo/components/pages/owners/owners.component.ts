import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Owner, OwnersService } from './owners.service';
import {InputTextareaModule} from "primeng/inputtextarea";
import {CalendarModule} from "primeng/calendar";
import { DropdownModule } from 'primeng/dropdown';

@Component({
    selector: 'app-owners',
    standalone: true,
    imports: [
        CommonModule,
        ToggleButtonModule,
        TableModule,
        FormsModule,
        HttpClientModule,
        ButtonModule,
        DialogModule,
        ConfirmDialogModule,
        PaginatorModule,
        ToastModule,
        InputTextModule,
        InputTextareaModule,
        CalendarModule,
        DropdownModule
    ],
    providers: [DialogService, MessageService, ConfirmationService],
    templateUrl: './owners.component.html',
    styleUrl: './owners.component.scss',
})
export class OwnersComponent implements OnInit {
    idFrozen: boolean = false;
    owners: Owner[] = [];
    loading: boolean = true;
    selectedOwner: Owner | null = null;
    ownerModal: any;
    totalRecords: number = 0;
    pageSize = 10;

    displayDialog: boolean = false;
    isEditing: boolean = false;
    isViewMode: boolean = false;
    photosPreview: string | ArrayBuffer | null = null;
    photos: File | null = null;


    ownerForm: Owner = {
        id: '',
        nom: '',
        prenom: '',
        telephone: '',
        sexe: '',
        email: '',
        adresse: '',
        numero_cni: '',
        date_creation_cni: new Date(),
        date_expiration_cni: new Date(),
        ville: '',
        quartier: '',
        pays: '',
        photos: '',
        description: '',
        profession: '',
        nationalite: '',
        created_at: new Date(),
        updated_at: new Date(),
    };

    constructor(
        private ownersService: OwnersService,
        private dialog: DialogService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadOwners();
    }

    closeOwnerModal() {
    this.selectedOwner = null;
    this.displayDialog = false; // ← au lieu de this.ownerModal.hide()
}

    loadOwners() {
        this.loading = true;
        this.ownersService.getOwners().subscribe({
            next: (data) => {
                this.owners = data;
                this.owners = data.map((owner) => ({
                    ...owner,
                    updated_at: new Date(owner.updated_at),
                }));

                this.owners.sort(
                    (a, b) => b.updated_at.getTime() - a.updated_at.getTime()
                );
                this.totalRecords = this.owners.length;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error fetching owners:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des propriétaires',
                });
            },
        });
    }

    onPageChange(event: any) {
        this.pageSize = event.rows;
    }

    // Voir les détails du propriétaire / doit griser les boutons de modification et de suppression
    viewsDetails(owner: Owner) {
        this.ownersService.getOwner(owner.id).subscribe({
            next: (data) => {
                this.selectedOwner = data;
                this.openOwnerModal(this.selectedOwner);
            },
            error: (error) => {
                console.error('Error fetching owner details:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des détails du propriétaire',
                });
            },
        });
    }

    deleteOwner(id: string) {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer ce propriétaire ?',
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => {
                this.ownersService.deleteOwner(id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Propriétaire supprimé avec succès',
                        });
                        this.loadOwners();
                    },
                    error: (error) => {
                        const message =
                            error?.error?.message ||
                            'Erreur lors de la suppression du propriétaire';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: message,
                        });
                    },
                });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Annulation',
                    detail: 'Suppression du propriétaire annulée',
                });
            },
        });
    }

    updateOwner(id: string, owner: Owner) {
        this.ownersService.updateOwner(id, owner).subscribe({
            next: () => {
                this.loadOwners();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Propriétaire modifié avec succès',
                });
                this.closeOwnerModal();
            },
            error: (error) => {
                console.error('Error updating owner:', error);
            },
        });
    }

    createOwner(owner: Owner) {
        this.ownersService.createOwner(owner).subscribe({
            next: () => {
                this.loadOwners();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Propriétaire créé avec succès',
                });
                this.closeOwnerModal();
            },
            error: (error) => {
                console.error('Error creating owner:', error);
            },
        });
    }
    

openOwnerModal(owner?: Owner, viewOnly: boolean = false) {
    this.isEditing = !!owner && !viewOnly;
    this.isViewMode = viewOnly;

    if (owner && !viewOnly) {
        this.isViewMode = false;
        this.isEditing = true;
    }

    this.ownerForm = owner ? { ...owner } : {
        id: '', nom: '', prenom: '', email: '', telephone: '',
        adresse: '', sexe: '', numero_cni: '',
        date_creation_cni: new Date(), date_expiration_cni: new Date(),
        ville: '', quartier: '', pays: '', photos: '',
        description: '', profession: '', nationalite: '',
        created_at: new Date(), updated_at: new Date(),
    };
    this.displayDialog = true;
}

    saveOwner() {
        if (this.isEditing && this.ownerForm.id) {
            this.updateOwner(this.ownerForm.id, this.ownerForm);
        } else {
            this.createOwner(this.ownerForm);
        }
        this.displayDialog = false;
    }


    getOwner(id: string) {
        this.ownersService.getOwner(id).subscribe({
            next: (data) => {
                this.selectedOwner = data;
            },
            error: (error) => {
                console.error('Error fetching owner:', error);
            },
        });
    }

    searchOwners(event: any) {
        const searchTerm = event?.target?.value || '';
        if (!searchTerm) {
            this.loadOwners();
            return;
        }

        this.ownersService.searchOwners(searchTerm).subscribe({
            next: (data) => {
                this.owners = data;
                this.totalRecords = data.length;
            },
            error: (error) => {
                console.error('Error searching owners:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la recherche des propriétaires',
                });
                this.loadOwners();
            },
        });
    }
}
