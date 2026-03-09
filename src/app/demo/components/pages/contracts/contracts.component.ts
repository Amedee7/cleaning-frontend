import { CommonModule, DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { NumberSpacePipe } from '../../shared/number-space.pipe';
import { House, HousesService } from '../houses/houses.service';
import { Owner, OwnersService } from '../owners/owners.service';
import { Paiement, PaymentsService } from '../payments/payments.service';
import { Plot, PlotsService } from '../plots/plots.service';
import { Tenant, TenantsService } from '../tenants/tenants.service';
import { Contract, ContractsService } from './contracts.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-contracts',
    providers: [MessageService, ConfirmationService, ConfirmDialogModule],
    standalone: true,
    imports: [
        CommonModule,
        CheckboxModule,
        FormsModule,
        ButtonModule,
        NgIf,
        DropdownModule,
        InputTextModule,
        InputTextareaModule,
        ConfirmDialogModule,
        ToastModule,
        TableModule,
        DialogModule,
        DatePipe,
        DecimalPipe,
        BadgeModule,
        NumberSpacePipe,
    ],
    templateUrl: './contracts.component.html',
    styleUrl: './contracts.component.scss',
})
export class ContractsComponent implements OnInit {
    isLoading: boolean = false;
    loadingPaymentId: string | null = null;
    totalPages: number = 0;
    currentPage: number = 1;
    searchSubject = new Subject<string>();

    contracts: Contract[] = [];
    selectedContract: Contract | null = null;
    displayDialog: boolean = false;
    loading: boolean = false;
    submitted: boolean = false;
    tenants: Tenant[] = [];
    payments: Paiement[] = [];
    documents: Document[] = [];
    houses: House[] = [];
    plots: Plot[] = [];
    owners: Owner[] = [];
    isViewMode: boolean = false;
    totalRecords: number = 0;
    pageSize: number = 5;
    pageNumber: number = 1;
    searchTerm: string = '';
    sortField: string = '';
    sortOrder: string = '';
    paiementsParMois: { [key: string]: Paiement[] } = {};
    displayContractModal: boolean = false;
    displayPaymentModal: boolean = false;
    configs: { [key: string]: string } = {};
    selectedContractType: string = '';

    paiementSearch: string = '';
    paiementStatusFilter: string = '';
    
    statusOptions = [
    { label: 'En attente', value: 'en_attente' },
    { label: 'Payé',       value: 'paye' },
    { label: 'En retard',  value: 'en_retard' },
    { label: 'Annulé',     value: 'annule' },
];


    contract: Contract = {
        id: '',
        configuration_id: '',
        type_contrat: '',
        maison_id: '',
        locataire_id: '',
        parcelle_id: '',
        date_de_debut: '',
        date_de_fin: '',
        renouvelable: false,
        montant_mensuel: 0,
        nombre_de_mois_de_caution: 0,
        montant_caution: 0,
        nombre_de_mois_d_avance: 0,
        montant_avance_de_loyer: 0,
        status: 'en_attente',
        description: '',
        nom_de_la_personne_a_contacter: '',
        prenom_de_la_personne_a_contacter: '',
        numero_cni_de_la_personne_a_contacter: '',
        telephone_de_la_personne_a_contacter: '',
        lieu_de_residence_de_la_personne_a_contacter: '',
        motif_de_suspension: '',
        date_de_suspension: '',
    };

    newContract: Contract = {
        id: '',
        configuration_id: '',
        type_contrat: '',
        maison_id: '',
        locataire_id: '',
        parcelle_id: '',
        date_de_debut: '',
        date_de_fin: '',
        renouvelable: false,
        montant_mensuel: 0,
        nombre_de_mois_de_caution: 0,
        montant_caution: 0,
        nombre_de_mois_d_avance: 0,
        montant_avance_de_loyer: 0,
        status: 'en_attente',
        description: '',
        nom_de_la_personne_a_contacter: '',
        prenom_de_la_personne_a_contacter: '',
        numero_cni_de_la_personne_a_contacter: '',
        telephone_de_la_personne_a_contacter: '',
        lieu_de_residence_de_la_personne_a_contacter: '',
        motif_de_suspension: '',
        date_de_suspension: '',
    };

    editContract: Contract = {
        id: '',
        configuration_id: '',
        type_contrat: '',
        maison_id: '',
        locataire_id: '',
        parcelle_id: '',
        date_de_debut: '',
        date_de_fin: '',
        renouvelable: false,
        montant_mensuel: 0,
        nombre_de_mois_de_caution: 0,
        montant_caution: 0,
        nombre_de_mois_d_avance: 0,
        montant_avance_de_loyer: 0,
        status: 'en_attente',
        description: '',
        nom_de_la_personne_a_contacter: '',
        prenom_de_la_personne_a_contacter: '',
        numero_cni_de_la_personne_a_contacter: '',
        telephone_de_la_personne_a_contacter: '',
        lieu_de_residence_de_la_personne_a_contacter: '',
        motif_de_suspension: '',
        date_de_suspension: '',
    };

    contractTypes = [
        { label: 'Location maison', value: 'location_maison' },
        { label: 'Payer une parcelle', value: 'payer_parcelle' },
    ];

    constructor(
        private contractsService: ContractsService,
        private tenantsService: TenantsService,

        private housesService: HousesService,
        private plotsService: PlotsService,
        private ownersService: OwnersService,
        private messageService: MessageService,
        private paymentService: PaymentsService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {

        this.searchSubject.pipe(
        debounceTime(400),
        distinctUntilChanged()
    ).subscribe(query => {
        this.contractsService.searchContracts(query).subscribe(
            contracts => this.contracts = contracts
        );
    });

        this.isLoading = false;
        this.loadContracts();
        this.loadTenants();
        this.loadOwners();
        this.loadHouses();
        this.loadConfigurations();

        // Parser les types de contrat
        if (this.configs['type_contrat']) {
            const rawTypes = JSON.parse(this.configs['type_contrat']);
            this.contractTypes = rawTypes.map((type: string) => ({
                label: this.formatTypeLabel(type),
                value: type,
            }));
        }
    }

    searchContracts(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
}

    formatTypeLabel(type: string): string {
        switch (type) {
            case 'location_parcelle':
                return 'Location de parcelle';
            case 'vente_parcelle':
                return 'Vente de parcelle';
            case 'location_maison':
                return 'Location de maison';
            case 'vente_maison':
                return 'Vente de maison';
            default:
                return type;
        }
    }

    onPageChange(event: any) {
        this.pageSize = event.rows;
    }

    loadContracts() {
        this.contractsService.getContracts().subscribe((contracts) => {
            this.contracts = contracts;
        });
    }

    loadTenants() {
        this.tenantsService.getTenants().subscribe((tenants) => {
            this.tenants = tenants;
            this.tenants = this.tenants.map((tenant) => ({
                ...tenant,
                label: `${tenant.nom} ${tenant.prenom} - ${tenant.telephone}`,
            }));
        });
    }

    loadOwners() {
        this.ownersService.getOwners().subscribe((owners) => {
            this.owners = owners;
            this.owners = this.owners.map((owner) => ({
                ...owner,
                label: `${owner.nom} ${owner.prenom} - ${owner.telephone}`,
            }));
        });
    }

    loadHouses() {
        this.housesService.getMaisonsDisponibles().subscribe((houses) => {
            this.houses = houses;
            this.houses = this.houses.map((house) => ({
                ...house,
                proprietaire: this.owners.find(
                    (owner) => owner.id === house.proprietaire_id
                ),
                label: `${house.proprietaire?.nom} ${house.proprietaire?.prenom} - ${house.adresse}`,
            }));
        });
    }

    openNew() {
        this.contract = {
            id: '',
            configuration_id: '',
            type_contrat: '',
            maison_id: '',
            locataire_id: '',
            parcelle_id: '',
            date_de_debut: '',
            date_de_fin: '',
            renouvelable: false,
            montant_mensuel: 0,
            nombre_de_mois_de_caution: 0,
            montant_caution: 0,
            nombre_de_mois_d_avance: 0,
            montant_avance_de_loyer: 0,
            status: 'en_attente',
            description: '',
            nom_de_la_personne_a_contacter: '',
            prenom_de_la_personne_a_contacter: '',
            numero_cni_de_la_personne_a_contacter: '',
            telephone_de_la_personne_a_contacter: '',
            lieu_de_residence_de_la_personne_a_contacter: '',
            motif_de_suspension: '',
            date_de_suspension: '',
        };
        this.submitted = false;
        this.displayDialog = true;
    }

    onDateDebutChange(dateDebutStr: string) {
        const dateDebut = new Date(dateDebutStr);

        // Ajouter 1 an
        const dateFin = new Date(dateDebut);
        dateFin.setFullYear(dateFin.getFullYear() + 1);

        // Convertir au format 'YYYY-MM-DD'
        this.contract.date_de_fin = dateFin.toISOString().split('T')[0];
    }

    loadConfigurations() {
        this.contractsService.getConfigurations().subscribe((data) => {
            // Suppose que data est un tableau [{ cle: 'entreprise_nom', valeur: '...' }, ...]
            this.configs = {};
            for (let config of data) {
                this.configs[config.cle] = config.valeur;
            }
        });
    }

    generateContract() {
        this.isLoading = true;
        this.submitted = true;

        // Validate required fields
        if (
            !this.contract.locataire_id ||
            !this.contract.date_de_debut ||
            !this.contract.date_de_fin ||
            !this.contract.montant_mensuel
        ) {
            return; // Don't proceed if required fields are missing
        }

        if (this.contract.id) {
            this.contractsService
                .updateContract(this.contract.id, this.contract)
                .subscribe({
                    next: () => {
                        this.loadContracts();
                        this.displayContractModal = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Contrat modifié avec succès',
                        });
                        this.displayContractModal = false;
                        this.isLoading = false;
                    },
                    error: (error) => {
                        console.error('Error updating contract:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Une erreur est survenue lors de la modification du contrat',
                        });
                        this.isLoading = false;
                    },
                });
        } else {
            this.contractsService.createContract(this.contract).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Contrat généré avec succès',
                    });
                    this.loadContracts();
                    this.displayContractModal = false;
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error creating contract:', error);

                    const errorMessage =
                        error?.error?.error ||
                        'Une erreur est survenue lors de la génération du contrat';

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: errorMessage,
                    });

                    this.isLoading = false;
                },
            });
        }
    }

    getOwner(id: string) {
        return this.owners.find((o) => o.id === id);
    }

    getTenant(id: string) {
        return this.tenants.find((t) => t.id === id);
    }

    getHouse(id: string) {
        return this.houses.find((h) => h.id === id);
    }

    getOwnerLabel(id: string): string {
        const owner = this.owners.find((o) => o.id === id);
        return owner ? `${owner.nom} ${owner.prenom} - ${owner.telephone}` : '';
    }

    getTenantLabel(id: string): string {
        const tenant = this.tenants.find((t) => t.id === id);
        return tenant
            ? `${tenant.nom} ${tenant.prenom} - ${tenant.telephone}`
            : '';
    }

    getHouseLabel(id: string): string {
        const house = this.houses.find((h) => h.id === id);
        const ownerLabel = house?.proprietaire
            ? `${house.proprietaire.nom} ${house.proprietaire.prenom}`
            : '';
        return house ? `${ownerLabel} - ${house.adresse}` : '';
    }

    openContractModal(contract: Contract, isViewMode: boolean = false) {
        this.selectedContract = contract;
        this.contract = { ...contract };
        this.isViewMode = isViewMode;
        this.displayContractModal = true;
    }

    closeContractModal() {
        this.displayContractModal = false;
    }


    private emptyContract(): Contract {
    return {
        id: '', configuration_id: '', type_contrat: '',
        maison_id: '', locataire_id: '', parcelle_id: '',
        date_de_debut: '', date_de_fin: '', renouvelable: false,
        montant_mensuel: 0, nombre_de_mois_de_caution: 0,
        montant_caution: 0, nombre_de_mois_d_avance: 0,
        montant_avance_de_loyer: 0, status: 'en_attente',
        description: '', nom_de_la_personne_a_contacter: '',
        prenom_de_la_personne_a_contacter: '',
        numero_cni_de_la_personne_a_contacter: '',
        telephone_de_la_personne_a_contacter: '',
        lieu_de_residence_de_la_personne_a_contacter: '',
        motif_de_suspension: '', date_de_suspension: '',
    };
}

    openNewContractModal() {
        this.contract = this.emptyContract();
        this.displayContractModal = true;
    }

    openPaymentModal() {
        this.displayPaymentModal = true;
        this.loadPaiements();
    }

    loadPaiements() {
        this.isLoading = true;
        this.paymentService.getPayments().subscribe({
            next: (data) => {
                this.payments = data.map((payment: any) => ({
                    ...payment,
                    updated_at: new Date(payment.updated_at),
                    date_normale_de_paiement: new Date(
                        payment.date_normale_de_paiement
                    ),
                    created_at: new Date(payment.created_at),
                }));

                this.payments.sort(
                    (a, b) =>
                        b.date_normale_de_paiement.getTime() -
                        a.date_normale_de_paiement.getTime()
                );
                this.isLoading = false;
                this.paiementsParMois = {};
                this.payments.forEach((p) => {
                    const date = p.date_normale_de_paiement;
                    const moisNom = date.toLocaleString('fr-FR', {
                        month: 'long',
                    });
                    const moisCapitalise =
                        moisNom.charAt(0).toUpperCase() + moisNom.slice(1);
                    const mois = `${moisCapitalise} ${date.getFullYear()}`;

                    if (!this.paiementsParMois[mois]) {
                        this.paiementsParMois[mois] = [];
                    }
                    this.paiementsParMois[mois].push(p);
                });

                this.totalRecords = this.payments.length;
                this.loading = false;
            },
            error: (error) => {
                console.error(
                    'Erreur lors du chargement des paiements:',
                    error
                );
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des paiements',
                });
                this.loading = false;
            },
        });
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

    getPaiementSeverity(status: string): string {
        switch (status) {
            case 'paye':
                return 'success';
            case 'en_attente':
                return 'info';
            case 'annule':
                return 'danger';
            case 'en_retard':
                return 'warning';
            default:
                return 'info';
        }
    }

    getMoisList(): string[] {
        const moisMap: { [key: string]: number } = {
            janvier: 0,
            février: 1,
            mars: 2,
            avril: 3,
            mai: 4,
            juin: 5,
            juillet: 6,
            août: 7,
            septembre: 8,
            octobre: 9,
            novembre: 10,
            décembre: 11,
        };

        return Object.keys(this.paiementsParMois).sort((a, b) => {
            const [moisA, anneeA] = a.toLowerCase().split(' ');
            const [moisB, anneeB] = b.toLowerCase().split(' ');

            const dateA = new Date(+anneeA, moisMap[moisA]);
            const dateB = new Date(+anneeB, moisMap[moisB]);

            return dateA.getTime() - dateB.getTime();
        });
    }

    hasPaiementEnAttenteAvant(paiement: any): boolean {
        const paiements = this.paiementsParMois[paiement.date_normale_de_paiement.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })]
            ?.concat()
            ?.sort((a, b) => new Date(a.date_normale_de_paiement).getTime() - new Date(b.date_normale_de_paiement).getTime());

        if (!paiements) return false;

        for (const p of paiements) {
            if (
                new Date(p.date_normale_de_paiement) < new Date(paiement.date_normale_de_paiement) &&
                p.status === 'en_attente' &&
                p.contrat?.locataire?.id === paiement.contrat?.locataire?.id
            ) {
                return true; // Il y a un paiement antérieur en attente
            }
        }

        return false;
    }


marquerCommePaye(paiement: any) {
    if (this.isPaiementBloque(paiement)) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Paiements précédents non réglés',
            detail: `Réglez d'abord les mois précédents avant de payer ${this.getMonthLabel(paiement.date_normale_de_paiement)}.`,
        });
        return;
    }
    this.confirmationService.confirm({
        message: 'Voulez-vous vraiment marquer ce paiement comme payé ?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui',
        rejectLabel: 'Non',
        acceptButtonStyleClass: 'p-button-success',
        rejectButtonStyleClass: 'p-button-secondary',
        accept: () => {
            this.loadingPaymentId = paiement.id; // ← loader avant la requête

            this.paymentService.marquerCommePaye(paiement.id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Paiement marqué comme payé',
                    });
                    this.loadPaiements();
                    this.loadContracts(); // ← retire cette ligne dans payments.component
                },
                error: (err) => {
                    const detail = err?.error?.message || 'Erreur lors du marquage du paiement';
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail,
                    });
                },
                complete: () => {
                    this.loadingPaymentId = null; // ← toujours réinitialisé
                },
            });
        },
        reject: () => {
            this.messageService.add({
                severity: 'info',
                summary: 'Annulation',
                detail: 'Action annulée', // ← message corrigé
            });
        },
    });
}

    genererFacture(paiement: any) {
        this.isLoading = true;
        this.paymentService.getFature(paiement.id).subscribe({
            next: (response: any) => {
                if (response.facture_url) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Facture',
                        detail: 'Facture récupérée avec succès',
                    });
                    this.downloadFacture(response.facture_url);
                    this.isLoading = false;
                } else {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Facture manquante',
                        detail: 'Aucune facture trouvée pour ce paiement.',
                    });
                }
            },
            error: (error) => {
                console.error('Erreur facture :', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la récupération de la facture',
                });
            },
        });
    }

    downloadFacture(url: string) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.click();
    }

    onMontantOuMoisChange() {
        const montant = this.contract.montant_mensuel || 0;
        const moisCaution = this.contract.nombre_de_mois_de_caution || 0;
        const moisAvance = this.contract.nombre_de_mois_d_avance || 0;

        this.contract.montant_caution = montant * moisCaution;
        this.contract.montant_avance_de_loyer = montant * moisAvance;
    }

    changerStatut(id: string, statut: 'en_cours' | 'termine' | 'suspendu'): void {
        this.isLoading = true;
        this.confirmationService.confirm({
            message: `Voulez-vous vraiment changer le statut du contrat à "${statut.replace(
                '_',
                ' '
            )}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => {
                this.contractsService.updateStatus(id, statut).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Le contrat a été mis à jour vers "${statut}".`,
                        });
                        this.loadContracts();
                        this.isLoading = false;
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Une erreur est survenue lors de la mise à jour du statut.',
                        });
                        console.error(error);
                    },
                });
            },
        });
    }

    telechargerContrat(contratId: number) {
        this.isLoading = true;
        this.contractsService.genererContratPDF(contratId).subscribe({
            next: (res) => {
                window.open(res.contrat_url, '_blank'); // Ouvre le PDF dans un nouvel onglet
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Erreur lors de la génération du contrat :', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la génération du contrat',
                });
                this.isLoading = false;
            },
        });
    }

    deleteContract(id: string) {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer ce contrat ?',
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => {
                this.contractsService.deleteContract(id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Contrat supprimé avec succès',
                        });
                        this.loadContracts();
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

    onMaisonChange(maisonId: string) {
    const maison = this.houses.find(h => h.id === maisonId);
    if (maison) {
        this.contract.montant_mensuel = maison.prix;
        this.contract.montant_caution = maison.caution;
        // recalcule les mois si déjà saisis
        this.onMontantOuMoisChange();
    }
}


onPaiementSearch(): void {
    // pas besoin de logique supplémentaire car ce sont des méthodes pures
}

getFilteredPaiements(mois: string): Paiement[] {
    const search = this.paiementSearch.toLowerCase().trim();
    return (this.paiementsParMois[mois] || []).filter(p => {
        const nom    = `${p.contrat?.locataire?.nom ?? ''} ${p.contrat?.locataire?.prenom ?? ''}`.toLowerCase();
        const tel    = p.contrat?.locataire?.telephone || '—';
        const statut = p.status ?? '';
        const date   = p.date_normale_de_paiement instanceof Date
            ? p.date_normale_de_paiement.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
            : '';

        const matchSearch = !search ||
            nom.includes(search) ||
            tel.includes(search) ||
            date.toLowerCase().includes(search) ||
            statut.includes(search);

        const matchStatus = !this.paiementStatusFilter ||
            statut === this.paiementStatusFilter;

        return matchSearch && matchStatus;
    });
}

filteredMoisList(): string[] {
    // N'affiche que les mois qui ont au moins un paiement correspondant au filtre
    return this.getMoisList().filter(mois =>
        this.getFilteredPaiements(mois).length > 0
    );
}


/**
 * Retourne tous les paiements d'un statut donné,
 * filtrés par la recherche textuelle.
 */
getKanbanCol(status: string): Paiement[] {
    const search = this.paiementSearch.toLowerCase().trim();

    // Aplatir tous les paiements depuis paiementsParMois
    const tous = Object.values(this.paiementsParMois).flat();

    return tous.filter(p => {
        // Filtre statut
        if (p.status !== status) return false;

        // Filtre dropdown statut (si différent du statut de colonne — utile pour la stat bar)
        if (this.paiementStatusFilter && p.status !== this.paiementStatusFilter) return false;

        // Filtre texte
        if (!search) return true;

        const nom     = `${p.contrat?.locataire?.nom ?? ''} ${p.contrat?.locataire?.prenom ?? ''}`.toLowerCase();
        const tel     = (p.contrat?.locataire?.telephone ?? '').toLowerCase();
        const adresse = (p.contrat?.maison?.adresse ?? '').toLowerCase();
        const date    = p.date_normale_de_paiement instanceof Date
            ? p.date_normale_de_paiement.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toLowerCase()
            : '';

        return nom.includes(search)
            || tel.includes(search)
            || adresse.includes(search)
            || date.includes(search);
    });
}

isMoisFutur(date: Date | string): boolean {
    const aujourd = new Date();
    const d = new Date(date);
    const moisCourant  = aujourd.getFullYear() * 12 + aujourd.getMonth();
    const moisEcheance = d.getFullYear() * 12 + d.getMonth();
    return moisEcheance > moisCourant;
}

getMonthLabel(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

/**
 * Un paiement futur est accessible si tous les paiements
 * antérieurs du même contrat sont déjà payés ou annulés.
 */
isPaiementBloque(paiement: any): boolean {
    const aujourd = new Date();
    const dateEcheance = new Date(paiement.date_normale_de_paiement);

    const moisCourant  = aujourd.getFullYear() * 12 + aujourd.getMonth();
    const moisEcheance = dateEcheance.getFullYear() * 12 + dateEcheance.getMonth();

    // Pas dans le futur → jamais bloqué
    if (moisEcheance <= moisCourant) return false;

    // Dans le futur → vérifier si tous les antérieurs du même contrat sont soldés
    const tousLesPaiements = Object.values(this.paiementsParMois).flat();

    const antérieurNonSolde = tousLesPaiements.some(p =>
        p.contrat_id === paiement.contrat_id &&
        new Date(p.date_normale_de_paiement) < dateEcheance &&
        p.status !== 'paye' &&
        p.status !== 'annule'
    );

    return antérieurNonSolde; // bloqué seulement si précédent non soldé
}

}
