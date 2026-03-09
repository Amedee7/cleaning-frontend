import { DatePipe, NgForOf, NgIf, NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Owner, OwnersService } from '../owners/owners.service';
import { Tenant, TenantsService } from '../tenants/tenants.service';
import { House, HousesService } from './houses.service';
import {NumberSpacePipe} from "../../shared/number-space.pipe";
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-houses',
    standalone: true,
    imports: [
        ButtonModule,
        TableModule,
        PaginatorModule,
        ConfirmDialogModule,
        DatePipe,
        ToastModule,
        InputTextModule,
        CardModule,
        NgIf,
        ReactiveFormsModule,
        InputNumberModule,
        DropdownModule,
        DialogModule,
        NgStyle,
        BadgeModule,
        InputTextareaModule,
        CheckboxModule,
        CalendarModule,
        NgForOf,
        MessageModule,
        NumberSpacePipe,
    ],
    providers: [DialogService, MessageService, ConfirmationService],
    templateUrl: './houses.component.html',
    styleUrl: './houses.component.scss',
})
export class HousesComponent implements OnInit {
    houses: House[] = [];
    totalRecords: number = 0;
    pageSize = 10;
    houseModal: any;
    owners: Owner[] = [];
    displayDialog: boolean = false;
    displayViewMode: boolean = false;
    isViewMode: boolean = false;
    tenants: Tenant[] = [];
    isLoading: boolean = false;
    houseForm: FormGroup = this.fb.group({});
    photosBase64: string[] = [];
    selectedHouses: House[] = [];
    selectedHouse: House | null = null;


    houseFeatures = [
        { key: 'garage', label: 'Garage' },
        { key: 'jardin', label: 'Jardin' },
        { key: 'cuisine', label: 'Cuisine' },
        { key: 'salle_de_bain', label: 'Salle de bain' },
        { key: 'parking', label: 'Parking' },
        { key: 'climatisation', label: 'Climatisation' },
        { key: 'wifi', label: 'Wi-Fi' },
        { key: 'plafond', label: 'Plafond' },
        { key: 'ascenseur', label: 'Ascenseur' },
    ];

    type_de_contrat = [
        { value: 'Prépayée', label: 'Prépayée' },
        { value: 'Postpayée', label: 'Postpayée' },
    ];

    type_de_plafond = [
        { value: 'platre', label: 'Platre' },
        { value: 'faux_plafond', label: 'Faux plafond' },
        { value: 'contre_plaqué', label: 'Contre plaqué' },
    ];

    constructor(
        private houseService: HousesService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private ownersService: OwnersService,
        private tenantService: TenantsService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {}

    onPageChange(event: any) {
        this.pageSize = event.rows;
    }

    ngOnInit() {
        this.initForm();
        this.loadHouses();
        this.loadOwners();
        this.loadTenants();
    }


initForm() {
    // Tous les contrôles enabled par défaut
    this.houseForm = this.fb.group({
        id: new FormControl(null),
        adresse: new FormControl('', Validators.required),
        ville: new FormControl('', Validators.required),
        quartier: new FormControl('', Validators.required),
        pays: new FormControl('', Validators.required),
        nombre_pieces: new FormControl(0, [Validators.required, Validators.min(1)]),
        surface: new FormControl(0, Validators.required),
        prix: new FormControl(0, Validators.required),
        caution: new FormControl(0),
        annee_construction: new FormControl(0),
        type_de_maison: new FormControl('', Validators.required),
        type_de_contrat: new FormControl('', Validators.required),
        plafond: new FormControl(''),
        status: new FormControl('disponible'),
        proprietaire_id: new FormControl(null, Validators.required),
        disponible_a_partir_de: new FormControl(new Date(), Validators.required),
        description: new FormControl(''),
        photos: new FormControl(''),
        garage: new FormControl(false),
        jardin: new FormControl(false),
        cuisine: new FormControl(false),
        salle_de_bain: new FormControl(false),
        parking: new FormControl(false),
        climatisation: new FormControl(false),
        wifi: new FormControl(false),
        ascenseur: new FormControl(false),
    });
}

// Méthode utilitaire pour activer/désactiver le form
private setFormMode(disabled: boolean) {
    if (disabled) {
        this.houseForm.disable();
    } else {
        this.houseForm.enable();
    }
}


loadOwners() {
    this.ownersService.getOwners().subscribe({
        next: (data) => {
            this.owners = data.map((owner) => ({
                ...owner,
                label: `${owner.nom} ${owner.prenom} - ${owner.telephone}`,
            }));
            this.cdr.markForCheck();
        }
    });
}

    getStatus(status: string) {
        return status === 'disponible' ? 'success' : 'danger';
    }

    loadTenants() {
        this.tenantService.getTenants().subscribe({
            next: (data) => {
                this.tenants = data;
            },
            error: (error) => {
                console.error('Error loading locataires:', error);
            },
        });
    }

    loadHouses() {
        this.houseService.getHouses().subscribe({
            next: (data) => {
                this.houses = data;
                this.houses = data.map((house) => ({
                    ...house,
                    updated_at: new Date(house.updated_at),
                }));

                this.houses.sort(
                    (a, b) => b.updated_at.getTime() - a.updated_at.getTime()
                );
                this.totalRecords = this.houses.length;
                this.cdr.markForCheck();
            },
            error: (error) => {
                console.error('Error fetching houses:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des maisons',
                });
            },
        });
    }

    getHouses() {
        this.houseService.getHouses().subscribe((houses) => {
            this.houses = houses;
            this.totalRecords = houses.length;
            this.cdr.markForCheck();
        });
    }

    addHouse(house: House) {
        const payload = this.prepareHousePayload(house);

        this.houseService.createHouse(payload).subscribe({
            next: (newHouse) => {
                this.houses.push(newHouse);
                this.totalRecords = this.houses.length;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Maison ajoutée avec succès',
                });
                this.loadHouses();
                this.displayDialog = false;
            },
            error: (error) => {
                console.error('Error creating house:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Erreur lors de l'ajout de la maison",
                });
            },
        });
    }

    updateHouse() {
        if (this.houseForm.invalid) {
            this.houseForm.markAllAsTouched();
            return;
        }

        const house = this.houseForm.value;

        const houseToUpdate = {
            ...house,
            id: this.houseForm.get('id')?.value, // si l'id est stocké dans le FormGroup
            proprietaire_id:
                typeof house.proprietaire_id === 'object'
                    ? house.proprietaire_id.id
                    : house.proprietaire_id,
        };

        this.houseService
            .updateHouse(houseToUpdate.id, houseToUpdate)
            .subscribe({
                next: (updatedHouse) => {
                    const index = this.houses.findIndex(
                        (h) => h.id === updatedHouse.id
                    );
                    if (index !== -1) {
                        this.houses[index] = updatedHouse;
                    }
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Maison mise à jour avec succès',
                    });
                    this.loadHouses();
                    this.displayDialog = false;
                },
                error: (error) => {
                    console.error('Error updating house:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Erreur lors de la mise à jour de la maison',
                    });
                },
            });
    }

    openHouseModal(house?: House) {
        this.isViewMode = false;
        this.initForm();
        this.setFormMode(false); // enable

        if (house?.id) {
            this.houseService.getHouse(house.id).subscribe({
                next: (houseData) => {
                    this.houseForm.patchValue({ ...houseData, id: houseData.id });
                    this.displayDialog = true;
                    this.cdr.markForCheck();
                }
            });
        } else {
            this.displayDialog = true;
            this.cdr.markForCheck();
        }
    }

viewsDetails(house: House) {
    this.isViewMode = true;
    this.selectedHouse = house; // ← AJOUTER
    this.initForm();

    this.houseService.getHouse(house.id).subscribe({
        next: (houseData) => {
            this.houseForm.patchValue({
                ...houseData,
                disponible_a_partir_de: houseData.disponible_a_partir_de
                    ? new Date(houseData.disponible_a_partir_de)
                    : null,
            });
            this.setFormMode(true);
            this.displayViewMode = true;
            this.cdr.markForCheck();
        }
    });
}

    onSubmit() {
        if (this.houseForm.invalid) {
            this.houseForm.markAllAsTouched();
            return;
        }

        const payload = this.prepareHousePayload(this.houseForm.value);

        if (this.houseForm.get('id')?.value) {
            this.updateHouse();
        } else {
            this.addHouse(payload);
        }
    }

    prepareHousePayload(formValue: any): any {
        return {
            ...formValue,
            photos: JSON.stringify(this.photosBase64), // ici c’est crucial
            proprietaire_id:
                typeof formValue.proprietaire_id === 'object'
                    ? formValue.proprietaire_id.id
                    : formValue.proprietaire_id,
        };
    }

    private openModal() {
        this.displayDialog = true;
    }

    private openViewModal() {
        this.displayViewMode = true;
    }

    onPhotosSelected(event: any) {
        const files: FileList = event.target.files;
        this.photosBase64 = []; // Réinitialiser les anciennes images

        if (files && files.length > 0) {
            Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64String = (reader.result as string).split(
                        ','
                    )[1]; // enlever le header
                    this.photosBase64.push(base64String);
                };
                reader.readAsDataURL(file);
            });
        }
    }

    deleteHouse(id: string) {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer cette maison ?',
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => {
                this.houseService.deleteHouse(id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Maison supprimée avec succès',
                        });
                        this.loadHouses();
                    },
                    error: (error) => {
                        const message =
                            error?.error?.message ||
                            'Erreur lors de la suppression de la maison';
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
                    detail: 'Suppression de la maison annulée',
                });
            },
        });
    }


deleteSelectedHouses() {
    if (this.selectedHouses.length === 0) return;

    this.confirmationService.confirm({
        message: `Êtes-vous sûr de vouloir supprimer ${this.selectedHouses.length} maison(s) ?`,
        header: 'Confirmation de suppression',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui',
        rejectLabel: 'Non',
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-secondary',
        accept: () => {
            const deleteRequests = this.selectedHouses.map(house =>
                this.houseService.deleteHouse(house.id)
            );

            forkJoin(deleteRequests).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: `${this.selectedHouses.length} maison(s) supprimée(s) avec succès`,
                    });
                    this.selectedHouses = [];
                    this.loadHouses();
                },
                error: (error) => {
                    const message = error?.error?.message || 'Erreur lors de la suppression';
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
                detail: 'Suppression annulée',
            });
        },
    });
}
}
