import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Tenant, TenantsService } from './tenants.service';

@Component({
    selector: 'app-tenants',
    providers: [MessageService, ConfirmationService, DialogService],
    standalone: true,
    imports: [
        InputTextModule,
        ConfirmDialogModule,
        ToastModule,
        TableModule,
        DialogModule,
        FormsModule,
        NgIf,
        DatePipe,
        DropdownModule,
        CalendarModule,
    ],
    templateUrl: './tenants.component.html',
    styleUrl: './tenants.component.scss',
})
export class TenantsComponent implements OnInit {
    idFrozen: boolean = false;
    tenants: Tenant[] = [];
    loading: boolean = true;
    selectedTenant: Tenant | null = null;
    tenantModal: any;
    totalRecords: number = 0;
    pageSize = 10;

    displayDialog: boolean = false;
    isEditing: boolean = false;
    isViewMode: boolean = false;
    isLoading: boolean = false;

    situationMatrimoniale: string[] = [
        'Marié(e)',
        'Célibataire',
        'divorcé(e)',
        'Veuf(ve)',
    ];

    isFormValid(): boolean {
        const requiredFields = [
            'nom',
            'prenom',
            'email',
            'telephone',
            'adresse',
            'sexe',
            'profession',
            'nationalite',
            'situation_matrimoniale',
            'numero_cni',
            'date_creation_cni',
            'date_expiration_cni',
        ];

        let valid = true;

        requiredFields.forEach((field) => {
            if (
                this.tenantForm[field as keyof Tenant] === null ||
                this.tenantForm[field as keyof Tenant] === undefined ||
                this.tenantForm[field as keyof Tenant] === ''
            ) {
                valid = false;
            }
        });

        return valid;
    }


    tenantForm: Tenant = {
        id: '',
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        sexe: '',
        numero_cni: '',
        date_creation_cni: new Date(),
        date_expiration_cni: new Date(),
        photo: '',
        description: '',
        profession: '',
        nationalite: '',
        situation_matrimoniale: '',
        nombre_de_personnes: 0,
        nom_de_la_personne_a_contacter: '',
        telephone_de_la_personne_a_contacter: '',
        email_de_la_personne_a_contacter: '',
        numero_cni_de_la_personne_a_contacter: '',
        date_creation_cni_de_la_personne_a_contacter: new Date(),
        date_expiration_cni_de_la_personne_a_contacter: new Date(),
        photo_de_la_personne_a_contacter: '',
        created_at: new Date(),
        updated_at: new Date(),
    };

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private tenantsService: TenantsService,
        private dialogService: DialogService
    ) {}

    ngOnInit() {
        this.loadTenants();
    }

    loadTenants() {
        this.loading = true;
        this.tenantsService.getTenants().subscribe({
            next: (data) => {
                this.tenants = data;
                this.tenants = data.map((tenant) => ({
                    ...tenant,
                    updated_at: new Date(tenant.updated_at),
                }));

                this.tenants.sort(
                    (a, b) => b.updated_at.getTime() - a.updated_at.getTime()
                );
                this.totalRecords = this.tenants.length;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error fetching tenants:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des locataires',
                });
            },
        });
    }

    onPageChange(event: any) {
        this.pageSize = event.rows;
    }

    // Voir les détails du propriétaire / doit griser les boutons de modification et de suppression
    viewsDetails(tenant: Tenant) {
        this.tenantsService.getTenant(tenant.id).subscribe({
            next: (data) => {
                this.selectedTenant = data;
                this.openTenantModal(this.selectedTenant);
            },
            error: (error) => {
                console.error('Error fetching tenant details:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des détails du locataire',
                });
            },
        });
    }

    deleteTenant(id: string) {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer ce locataire ?',
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => {
                this.tenantsService.deleteTenant(id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Locataire supprimé avec succès',
                        });
                        this.loadTenants();
                    },
                    error: (error) => {
                        const message =
                            error?.error?.message ||
                            'Erreur lors de la suppression du locataire';
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
                    detail: 'Suppression du locataire annulée',
                });
            },
        });
    }

    updateTenant(id: string, tenant: Tenant) {
        this.tenantsService.updateTenant(id, tenant).subscribe({
            next: () => {
                this.loadTenants();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Locataire modifié avec succès',
                });
                this.closeTenantModal();
            },
            error: (error) => {
                console.error('Error updating tenant:', error);
            },
        });
    }

    createTenant(tenant: Tenant) {
        this.tenantsService.createTenant(tenant).subscribe({
            next: () => {
                this.loadTenants();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Propriétaire créé avec succès',
                });
                this.closeTenantModal();
            },
            error: (error) => {
                console.error('Error creating tenant:', error);
            },
        });
    }

    openTenantModal(tenant?: Tenant, viewOnly: boolean = false) {
        this.isEditing = !!tenant && !viewOnly;
        this.isViewMode = viewOnly;
        this.tenantForm = tenant
            ? { ...tenant }
            : {
                  id: '',
                  nom: '',
                  prenom: '',
                  email: '',
                  telephone: '',
                  adresse: '',
                  sexe: '',
                  numero_cni: '',
                  date_creation_cni: new Date(),
                  date_expiration_cni: new Date(),
                  photo: '',
                  description: '',
                  profession: '',
                  nationalite: '',
                  situation_matrimoniale: '',
                  nombre_de_personnes: 0,
                  nom_de_la_personne_a_contacter: '',
                  telephone_de_la_personne_a_contacter: '',
                  email_de_la_personne_a_contacter: '',
                  numero_cni_de_la_personne_a_contacter: '',
                  date_creation_cni_de_la_personne_a_contacter: new Date(),
                  date_expiration_cni_de_la_personne_a_contacter: new Date(),
                  photo_de_la_personne_a_contacter: '',
                  created_at: new Date(),
                  updated_at: new Date(),
              };
        this.displayDialog = true;
    }

    saveTenant() {
        if (!this.isFormValid()) {

            this.messageService.add({
                severity: 'warn',
                summary: 'Champs manquants',
                detail: 'Veuillez remplir tous les champs obligatoires.',
            });
            return;
        }

        if (this.isEditing && this.tenantForm.id) {
            this.updateTenant(this.tenantForm.id, this.tenantForm);
        } else {
            this.createTenant(this.tenantForm);
        }
        this.displayDialog = false;
    }


    closeTenantModal() {
        this.selectedTenant = null;
        this.tenantModal.hide();
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Locataire modifié avec succès',
        });
    }

    getTenant(id: string) {
        this.tenantsService.getTenant(id).subscribe({
            next: (data) => {
                this.selectedTenant = data;
            },
            error: (error) => {
                console.error('Error fetching tenant:', error);
            },
        });
    }

    searchTenants(event: any) {
        const searchTerm = event?.target?.value || '';
        if (!searchTerm) {
            this.loadTenants();
            return;
        }

        this.tenantsService.searchTenants(searchTerm).subscribe({
            next: (data) => {
                this.tenants = data;
                this.totalRecords = data.length;
            },
            error: (error) => {
                console.error('Error searching tenants:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la recherche des locataires',
                });
                this.loadTenants();
            },
        });
    }
}
