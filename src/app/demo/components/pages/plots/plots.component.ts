import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { nombreEnLettres } from '../../shared/nombre-en-lettres';
import { ContractsService } from '../contracts/contracts.service';
import { PlotsService } from './plots.service';
import { ToolbarModule } from 'primeng/toolbar';
import { NumberSpacePipe } from '../../shared/number-space.pipe';
@Component({
    selector: 'app-plot-management',
    templateUrl: './plots.component.html',
    styleUrls: ['./plots.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        CardModule,
        InputTextModule,
        ToastModule,
        DialogModule,
        ConfirmDialogModule,
        DropdownModule,
        CalendarModule,
        InputTextareaModule,
        InputNumberModule,
        ToolbarModule,
        NumberSpacePipe,
    ],
    providers: [DialogService, MessageService, ConfirmationService],
})
export class PlotsComponent implements OnInit {
    plots: any[] = [];
    totalRecords: number = 0;
    pageSize = 10;
    loading: boolean = false;
    parcelleForm: FormGroup;
    submitted: boolean = false;
    plotDialog: boolean = false;
    selectedPlot: any;
    detailDialog: boolean = false;
    selectedPlotDetails: any;
    isLoading: boolean = false;
    dechargeUrl: string = '';
    showVoirButton: boolean = false;
    dechargesDisponibles = new Set<string>();

    get selectedPlotId(): string | undefined {
        return this.selectedPlotDetails?.id;
      }

activeTab: number = 0;

    configs: any = {};
    usageParcelleOptions: { label: string; value: string }[] = [];
    typeParcelleOptions: { label: string; value: string }[] = [];
    typeDePieceOptions: { label: string; value: string }[] = [];
    paysOptions: { label: string; value: string }[] = [];
    modePaiementOptions: { label: string; value: string }[] = [];
    regionsVillesOptions: { label: string; value: string }[] = [];

    constructor(
        private plotsService: PlotsService,
        private dialog: DialogService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        private contractsService: ContractsService
    ) {}

    ngOnInit() {
        this.loadPlots();
        this.loadConfigurations();
        this.initForm();

        // Écoute les changements du champ 'montant_parcelle'
        this.parcelleForm
            .get('montant_parcelle')
            ?.valueChanges.subscribe((value) => {
                const montant = parseFloat(value);
                if (!isNaN(montant)) {
                    this.parcelleForm.patchValue({
                        montant_parcelle_en_lettre: nombreEnLettres(montant),
                    });
                } else {
                    this.parcelleForm.patchValue({
                        montant_parcelle_en_lettre: '',
                    });
                }
            });

        this.setupAutoExpiration(
            'date_creation_cni_vendeur',
            'date_expiration_cni_vendeur'
        );
        this.setupAutoExpiration(
            'date_creation_cni_acheteur',
            'date_expiration_cni_acheteur'
        );
        this.setupAutoExpiration(
            'date_creation_cni_temoin_1',
            'date_expiration_cni_temoin_1'
        );
        this.setupAutoExpiration(
            'date_creation_cni_temoin_2',
            'date_expiration_cni_temoin_2'
        );
        this.setupAutoExpiration(
            'date_creation_cni_temoin_3',
            'date_expiration_cni_temoin_3'
        );
    }

    setupAutoExpiration(creationCtrlName: string, expirationCtrlName: string) {
        this.parcelleForm
            .get(creationCtrlName)
            ?.valueChanges.subscribe((val) => {
                if (val) {
                    const creationDate = new Date(val);
                    const expirationDate = new Date(creationDate);
                    expirationDate.setDate(expirationDate.getDate() + 1); // +1 jour
                    this.parcelleForm
                        .get(expirationCtrlName)
                        ?.setValue(expirationDate);
                }
            });
    }

    initForm() {
        this.parcelleForm = this.fb.group({
            vendeur_nom: [''],
            vendeur_prenom: [''],
            vendeur_telephone: [''],
            type_de_piece_vendeur: [''],
            numero_cni_vendeur: [''],
            date_creation_cni_vendeur: [''],
            date_expiration_cni_vendeur: [''],
            vendeur_adresse: [''],

            acheteur_prenom: [''],
            acheteur_nom: [''],
            acheteur_telephone: [''],
            type_de_piece_acheteur: [''],
            numero_cni_acheteur: [''],
            date_creation_cni_acheteur: [''],
            date_expiration_cni_acheteur: [''],
            acheteur_adresse: [''],

            temoin_nom_1: [''],
            temoin_prenom_1: [''],
            temoin_telephone_1: [''],
            type_de_piece_temoin_1: [''],
            numero_cni_temoin_1: [''],
            date_creation_cni_temoin_1: [''],
            date_expiration_cni_temoin_1: [''],
            temoin_adresse_1: [''],

            temoin_nom_2: [''],
            temoin_prenom_2: [''],
            temoin_telephone_2: [''],
            type_de_piece_temoin_2: [''],
            numero_cni_temoin_2: [''],
            date_creation_cni_temoin_2: [''],
            date_expiration_cni_temoin_2: [''],
            temoin_adresse_2: [''],

            temoin_nom_3: [''],
            temoin_prenom_3: [''],
            temoin_telephone_3: [''],
            type_de_piece_temoin_3: [''],
            numero_cni_temoin_3: [''],
            date_creation_cni_temoin_3: [''],
            date_expiration_cni_temoin_3: [''],
            temoin_adresse_3: [''],
            region: [''],

            type_parcelle: [''],
            usage_prevu: [''],
            description_parcelle: [''],
            montant_parcelle: [''],
            montant_parcelle_en_lettre: [''],
            mode_paiement: [''],
            date_achat: [''],
            superficie: [''],
            situation_geographique: [''],
            numero_parcelle: [''],
            lot: [''],
            quartier: [''],
            commune: [''],
            departement: [''],
            region_ville: [''],
            pays: [''],
            latitude: [''],
            longitude: [''],
            // image_parcelle: ['', Validators.required],
            // image_carte: ['', Validators.required],
            // image_titre_foncier: ['', Validators.required],
            // image_plan_cadastral: ['', Validators.required],
            // image_plan_d_amendement: ['', Validators.required],
            // image_plan_d_amendement_2: ['', Validators.required],
            // image_plan_d_amendement_3: ['', Validators.required],
            // image_plan_d_amendement_4: ['', Validators.required],
            // image_plan_d_amendement_5: ['', Validators.required],
        });
    }

    loadPlots(event?: any) {
        this.loading = true;
        this.plotsService.getPlots().subscribe(
            (response: any[]) => {
                this.plots = response.map((p: any) => ({
                    ...p,
                    factureDecharge: p.facture_decharge // mappe la relation Laravel vers camelCase
                }));
                this.totalRecords = this.plots.length;
                this.loading = false;
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des parcelles.',
                });
                this.loading = false;
            }
        );
    }


    onPageChange(event: any) {
        this.loadPlots(event);
    }

openPlotModal(plot?: any) {
    this.submitted = false;
    this.activeTab = 0; // ← AJOUTER
    this.parcelleForm.reset();
    if (plot) {
        this.selectedPlot = plot;
        this.parcelleForm.patchValue(plot);
        const initialMontant = parseFloat(plot.montant_parcelle);
        if (!isNaN(initialMontant)) {
            this.parcelleForm.patchValue({
                montant_parcelle_en_lettre: nombreEnLettres(initialMontant),
            });
        }
    } else {
        this.selectedPlot = null;
    }
    this.plotDialog = true;
}

    hideDialog() {
        this.plotDialog = false;
        this.submitted = false;
    }

    savePlot() {
        this.submitted = true;
        if (this.parcelleForm.valid) {
            if (this.selectedPlot) {
                // Mode édition
                this.plotsService
                    .updatePlot(this.selectedPlot.id, this.parcelleForm.value)
                    .subscribe(
                        (response) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Succès',
                                detail: 'Parcelle modifiée avec succès.',
                            });
                            this.loadPlots();
                            this.hideDialog();
                        },
                        (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Erreur',
                                detail: 'Erreur lors de la modification de la parcelle.',
                            });
                        }
                    );
            } else {
                console.log(this.parcelleForm.value);
                // Mode ajout
                this.plotsService.createPlot(this.parcelleForm.value).subscribe(
                    (response) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Parcelle ajoutée avec succès.',
                        });
                        this.loadPlots();
                        this.hideDialog();
                    },
                    (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: "Erreur lors de l'ajout de la parcelle.",
                        });
                    }
                );
            }
        }
    }

    deletePlot(plot: any) {
        this.confirmationService.confirm({
            message:
                'Êtes-vous sûr de vouloir supprimer la parcelle "' +
                plot.numero_parcelle +
                '" ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.plotsService.deletePlot(plot.id).subscribe(
                    (response) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Parcelle supprimée avec succès.',
                        });
                        this.loadPlots();
                    },
                    (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Erreur lors de la suppression de la parcelle.',
                        });
                    }
                );
            },
        });
    }

    viewsDetails(plot: any) {
        this.selectedPlotDetails = plot;
        this.detailDialog = true;
    }

    hideDetailDialog() {
        this.detailDialog = false;
        this.selectedPlotDetails = null;
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

    peutTelecharger(plotId: string): boolean {
        return this.dechargesDisponibles.has(plotId);
    }

    genererDecharge(plotId: string) {
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment générer la décharge pour la parcelle ' + plotId + ' ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                this.loading = true;
                const payload = { est_signee: false }; // 👈 ici

                this.plotsService.generateDecharge(plotId, payload).subscribe({
                    next: (res) => {
                        this.dechargesDisponibles.add(plotId);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Décharge générée avec succès.',
                        });
                        this.loading = false;
                        this.loadPlots();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Échec de génération de la décharge.',
                        });
                        this.loading = false;
                    },
                });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Annulé',
                    detail: "Génération annulée par l'utilisateur.",
                });
            },
        });
    }


    marquerDechargeCommeSignee(factureId: string) {
        this.loading = true;
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment marquer la décharge comme signée ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            
            accept: () => {
                this.plotsService.marquerDechargeCommeSignee(factureId, { est_signee: true }).subscribe(() => {
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Décharge signée' });
                    this.loadPlots();
                    this.loading = false;
                });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Annulé',
                    detail: "Marquage annulé par l'utilisateur.",
                });
            }
        });
    }


    telechargerDecharge(plotId: string) {
        this.loading = true;
        this.plotsService.getDecharge(plotId).subscribe({
            next: (res) => {
                window.open(res.decharge_url, '_blank'); // Ouvre le PDF dans un nouvel onglet
                this.loading = false;
            },
            error: (err) => {
                console.error(
                    'Erreur lors de la génération de la décharge :',
                    err
                );
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la génération de la décharge',
                });
                this.loading = false;
            },
        });
    }

}
