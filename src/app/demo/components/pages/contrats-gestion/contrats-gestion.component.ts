import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ContratGestion, ContratsGestionService, House, Owner} from "../contrats-gestion/contrats-gestion.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {OwnersService} from "../owners/owners.service";
import {HousesService} from "../houses/houses.service";
import {TableModule} from "primeng/table";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastModule} from "primeng/toast";
import {DialogModule} from "primeng/dialog";
import {BadgeModule} from "primeng/badge";
import {NumberSpacePipe} from "../../shared/number-space.pipe";
import {MessageService} from "primeng/api";
import {ConfirmationService} from "primeng/api";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {CalendarModule} from "primeng/calendar";
import {InputTextareaModule} from "primeng/inputtextarea";
import { ContractsService } from '../contracts/contracts.service';
@Component({
    selector: 'app-contrats-gestion',
    providers: [MessageService, ConfirmationService,],
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, ConfirmDialogModule, ToastModule, DialogModule, BadgeModule, NumberSpacePipe, InputTextModule, DropdownModule, CalendarModule, InputTextareaModule],
    templateUrl: './contrats-gestion.component.html',
    styleUrls: ['./contrats-gestion.component.scss']
})
export class ContratsGestionComponent implements OnInit {

    contratForm: FormGroup;
    owners: Owner[] = [];
    houses: House[] = [];
    contrats: ContratGestion[] = [];
    totalContrats = 0;
    factureIds = new Map<string, string>();


    typeHonorairesOptions: string[] = ['pourcentage_loyer', 'montant_fixe'];
    statusOptions: string[] = ['actif', 'terminé', 'en_attente', 'suspendu'];
    isEditMode = false;
    displayDialog = false;
    isModalOpen = false;
    pageSize = 10;
    totalRecords = 0;
    loading = false;
    errorMessage = '';
    successMessage = '';
    selectedMaison: House | null = null;
    selectedProprietaire: Owner | null = null;
    filteredHouses: House[] = [];
    configs: any = {};
    usageParcelleOptions: { label: string; value: string }[] = [];
    typeParcelleOptions: { label: string; value: string }[] = [];
    typeDePieceOptions: { label: string; value: string }[] = [];
    paysOptions: { label: string; value: string }[] = [];
    modePaiementOptions: { label: string; value: string }[] = [];
    regionsVillesOptions: { label: string; value: string }[] = [];
    contratsDisponibles = new Set<string>();


    constructor(
        private fb: FormBuilder,
        private ownersService: OwnersService,
        private housesService: HousesService,
        private contratGestionService: ContratsGestionService,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private contractsService: ContractsService
    ) {

    }

    ngOnInit(): void {
        this.initForm();
        this.loadProprietaires();
        this.loadMaisonsDisponibles();
        this.loadContrats();
        this.loadConfigurations();
    }

    initForm() {
        this.contratForm = this.fb.group({
            proprietaire_id: ['', Validators.required],
            maison_id: ['', Validators.required],
            date_debut: ['', Validators.required],
            date_fin: [''],
            honoraires_agence: [''],
            // type_honoraires: ['pourcentage_loyer'],
            modalites_paiement: [''],
            responsabilites_agence: [''],
            responsabilites_proprietaire: [''],
            conditions_resiliation: [''],
            autres_conditions: [''],
        });
    }

    loadContrats() {
        this.loading = true;
        this.contratGestionService.getAllContrats().subscribe({
            next: (data) => {
                this.contrats = data.data.map((contrat) => ({
                    ...contrat,
                    updated_at: new Date(contrat.updated_at),
                }));

                this.totalRecords = data.total; // Utiliser le total fourni par l'API
                this.loading = false;
            },
            error: (error) => {
                console.error('Error fetching contracts:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des contrats',
                });
                this.loading = false;
            },
        });
    }

    onProprietaireChange(event: any): void {
        const selectedProprietaireId = event.value;
        this.filteredHouses = this.houses.filter(house => house.proprietaire_id === selectedProprietaireId);
        this.contratForm.patchValue({ maison_id: '' }); // Réinitialiser la sélection de la maison
      }

      loadMaisonsDisponibles(): void {
        this.housesService.getMaisonsDisponiblesPourContrat().subscribe(houses => {
            this.houses = houses.map(maison => ({
                ...maison,
                label: `${maison.adresse} - ${maison.type_de_maison}`,
                value: maison.id
            }));
            this.filteredHouses = [...this.houses]; // Si tu filtres aussi par propriétaire
        });
    }

      loadProprietaires() {
        this.ownersService.getOwners().subscribe((owners) => {
          this.owners = owners.map((proprietaire) => ({
            ...proprietaire,
            label: `${proprietaire.nom} ${proprietaire.prenom} - ${proprietaire.telephone}`,
            value: proprietaire.id // Assure-toi d'avoir une propriété 'value' pour p-dropdown
          }));
        });
      }


    getMaison(id: string) {
        return this.houses.find((h) => h.id === id);
    }

    getProprietaire(id: string) {
        return this.owners.find((p) => p.id === id);
    }

    getProprietaireLabel(id: string): string {
        const proprietaire = this.owners.find((o) => o.id === id);
        return proprietaire ? `${proprietaire.nom} ${proprietaire.prenom} - ${proprietaire.telephone}` : '';
    }

    getContractSeverity(
        status: string
    ): 'success' | 'info' | 'warning' | 'danger' {
        switch (status) {
            case 'en_cours':
                return 'info';
            case 'termine':
            case 'suspendu':
                return 'danger';
            case 'en_attente':
                return 'warning';
            default:
                return 'info';
        }
    }

    onCreateContratGestion(): void {
        this.loading = true;
        if (this.contratForm.valid) {
            this.contratGestionService.create(this.contratForm.value).subscribe({
                next: (response) => {
                    if (this.messageService) {
                        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Contrat créé avec succès.' });
                    }
                    this.displayDialog = false;
                    this.loadContrats();
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Erreur lors de la création du contrat', error);
                    // Vérifier si la réponse d'erreur contient un message spécifique du serveur
                    if (error?.error?.message) {
                        this.errorMessage = error.error.message;
                        if (this.messageService) {
                            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.errorMessage });
                        }
                    } else {
                        this.errorMessage = 'Une erreur est survenue lors de la création du contrat.';
                        if (this.messageService) {
                            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: this.errorMessage });
                        }
                    }
                    this.loading = false;
                }
            });
        } else {
            this.errorMessage = 'Veuillez vérifier les erreurs dans le formulaire.';
            if (this.messageService) {
                this.messageService.add({ severity: 'warn', summary: 'Attention', detail: this.errorMessage });
            }
        }
    }

    onCancel(): void {
        // Gérer l'annulation (retour à la liste, etc.)
        this.router.navigate(['/contrats']); // Exemple de navigation
        this.displayDialog = false; // Si tu utilises un dialogue modal, le fermer
    }

    onOpenDialog(): void {
        this.displayDialog = true;
        this.isEditMode = false; // S'assurer que le formulaire est en mode création
        this.contratForm.reset(); // Réinitialiser le formulaire pour la création
    }

    onDateDebutChange(dateDebutStr: string) {
        const dateDebut = new Date(dateDebutStr);

        // Ajouter 1 an
        const dateFin = new Date(dateDebut);
        dateFin.setFullYear(dateFin.getFullYear() + 1);

        // Convertir au format 'YYYY-MM-DD'
        this.contratForm.patchValue({ date_fin: dateFin.toISOString().split('T')[0] });
    }

    deleteContratGestion(id: string) {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer ce contrat ?',
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => {
                this.contratGestionService.deleteContratGestion(id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Contrat supprimé avec succès',
                        });
                        setTimeout(() => {
                            this.loadContrats();
                        }, 200); // Délai de 200 millisecondes (ajuste si nécessaire)
                    },
                    error: (error) => {
                        const message =
                            error?.error?.message ||
                            'Erreur lors de la suppression du contrat';
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
                    detail: 'Suppression du contrat annulée',
                });
            },
        });
    }

    loadConfigurations() {
        this.contractsService.getConfigurations().subscribe((data: any[]) => {
            this.configs = {};
            const usageParcelleOptions: { label: string; value: string }[] = [];
            const typeParcelleOptions: { label: string; value: string }[] = [];
            const typeDePieceOptions: { label: string; value: string }[] = [];
            const paysOptions: { label: string; value: string }[] = [];
            const modePaiementOptions: { label: string; value: string }[] = [];
            const regionsVillesOptions: { label: string; value: string }[] = [];

            const cleanValue = (value: string): string => {
                return value
                    .replace('[', '')
                    .replace(']', '')
                    .replace(/"/g, '')
                    .trim();
            };

            for (let config of data) {
                this.configs[config.cle] = config.valeur;
                if (config.cle === 'usage_parcelle') {
                    config.valeur
                        .split(',')
                        .map((item: string) => item.trim())
                        .forEach((usage: string) => {
                            const cleanedUsage = cleanValue(usage);
                            usageParcelleOptions.push({
                                label: cleanedUsage.replace('_', ' '),
                                value: cleanedUsage,
                            });
                        });
                } else if (config.cle === 'type_parcelle') {
                    config.valeur
                        .split(',')
                        .map((item: string) => item.trim())
                        .forEach((type: string) => {
                            const cleanedType = cleanValue(type);
                            typeParcelleOptions.push({
                                label: cleanedType.replace('_', ' '),
                                value: cleanedType,
                            });
                        });
                } else if (config.cle === 'type_de_piece') {
                    config.valeur
                        .split(',')
                        .map((item: string) => item.trim())
                        .forEach((piece: string) => {
                            const cleanedPiece = cleanValue(piece);
                            typeDePieceOptions.push({
                                label: cleanedPiece.replace('_', ' '),
                                value: cleanedPiece,
                            });
                        });
                } else if (config.cle === 'pays') {
                    config.valeur
                        .split(',')
                        .map((item: string) => item.trim())
                        .forEach((pays: string) => {
                            const cleanedPays = cleanValue(pays);
                            paysOptions.push({
                                label: cleanedPays,
                                value: cleanedPays,
                            });
                        });
                } else if (config.cle === 'mode_paiement') {
                    config.valeur
                        .split(',')
                        .map((item: string) => item.trim())
                        .forEach((mode: string) => {
                            const cleanedMode = cleanValue(mode);
                            modePaiementOptions.push({
                                label: cleanedMode.replace('_', ' '),
                                value: cleanedMode,
                            });
                        });
                } else if (config.cle === 'regions_villes') {
                    config.valeur
                        .split(',')
                        .map((item: string) => item.trim())
                        .forEach((regionVille: string) => {
                            const cleanedRegionVille = cleanValue(regionVille);
                            regionsVillesOptions.push({
                                label: cleanedRegionVille.replace('_', ' '),
                                value: cleanedRegionVille,
                            });
                        });
                }
            }

            this.usageParcelleOptions = usageParcelleOptions;
            this.typeParcelleOptions = typeParcelleOptions;
            this.typeDePieceOptions = typeDePieceOptions;
            this.paysOptions = paysOptions;
            this.modePaiementOptions = modePaiementOptions;
            this.regionsVillesOptions = regionsVillesOptions;
        });
    }

    peutTelecharger(contratId: string): boolean {
        return this.contratsDisponibles.has(contratId);
    }

    genererContratGestion(contratId: string) {
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment générer le contrat de gestion pour le contrat ' + contratId + ' ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
            this.loading = true;
            this.contratGestionService.generateContratGestion(contratId, { est_signee: false }).subscribe({
                next: (res) => {
                    this.factureIds.set(contratId, res.id.toString()); // ← stocker le factureId
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Contrat de gestion généré.' });
                    this.loading = false;
                    this.loadContrats();
                },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Échec de génération du contrat de gestion.',
                        });
                        this.loading = false;
                    },
                });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Annulé',
                    detail: "Génération du contrat de gestion annulée par l'utilisateur.",
                });
            },
        });
    }


    // marquerContratGestionCommeSignee(contratId: string) {
    //     this.loading = true;
    //     this.confirmationService.confirm({
    //         message: 'Voulez-vous vraiment marquer le contrat de gestion comme signé ?',
    //         header: 'Confirmation',
    //         icon: 'pi pi-exclamation-triangle',
    //         acceptLabel: 'Oui',
    //         rejectLabel: 'Non',
            
    //         accept: () => {
    //             this.contratGestionService.marquerContratGestionCommeSignee(contratId, { est_signee: true }).subscribe(() => {
    //                 this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Contrat de gestion signé' });
    //                 this.loadContrats();
    //                 this.loading = false;
    //             });
    //         },
    //         reject: () => {
    //             this.messageService.add({
    //                 severity: 'info',
    //                 summary: 'Annulé',
    //                 detail: "Marquage du contrat de gestion annulé par l'utilisateur.",
    //             });
    //         }
    //     });
    // }


    marquerContratGestionCommeSignee(contratId: string) {
    // Chercher le factureId depuis la liste des contrats chargés
    const contrat = this.contrats.find(c => c.id === contratId);
    const factureId = contrat?.facture_contrat_gestion?.id;

    if (!factureId) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Attention',
            detail: 'Aucune facture générée pour ce contrat. Générez d\'abord le PDF.'
        });
        return;
    }

    this.confirmationService.confirm({
        message: 'Voulez-vous marquer ce contrat de gestion comme signé ?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui',
        rejectLabel: 'Non',
        accept: () => {
            this.contratGestionService.marquerContratGestionCommeSignee(factureId, { est_signee: true })
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Contrat signé.' });
                        this.loadContrats();
                        this.loading = false;
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec du marquage.' });
                        this.loading = false;
                    }
                });
        }
    });
}


    telechargerContratGestion(contratId: string) {
        this.loading = true;
        this.contratGestionService.getContratGestion(contratId).subscribe({
            next: (res) => {
                window.open(res.contrat_gestion_url, '_blank'); // Ouvre le PDF dans un nouvel onglet
                this.loading = false;
            },
            error: (err) => {
                console.error(
                    'Erreur lors de la génération du contrat de gestion :',
                    err
                );
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la génération du contrat de gestion',
                });
                this.loading = false;
            },
        });
    }
}
