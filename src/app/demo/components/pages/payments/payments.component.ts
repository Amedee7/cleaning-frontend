import {Component, OnInit} from '@angular/core';
import {Paiement, PaymentsService} from "./payments.service";
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {DatePipe, DecimalPipe, NgIf} from "@angular/common";
import {MessageService} from "primeng/api";
import {ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToolbarModule} from "primeng/toolbar";
import {CalendarModule} from "primeng/calendar";
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
@Component({
  selector: 'app-payments',
  providers: [PaymentsService, MessageService, ConfirmationService, DatePipe],
  standalone: true,
    imports: [
        TableModule,
        ButtonModule,
        NgIf,
        DatePipe,
        DecimalPipe,
        ConfirmDialogModule,
        ToolbarModule,
        CalendarModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        InputTextModule,
        BadgeModule
    ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent implements OnInit{
    searchForm!: FormGroup;
    payments: Paiement[] = [];
    selectedContrat: any;
    loading: boolean = true;
    totalRecords: number = 0;
    dateDebut!: Date;
    dateFin!: Date;
    maxDate = new Date();
    isLoading: boolean = false;
    pageSize: number = 10;
    pageNumber: number = 1;
    loadingPaymentId: string | null = null;

    
    statusOptions = [
      { label: 'Tous', value: '' },
      { label: 'En attente', value: 'en_attente' },
      { label: 'Payé',        value: 'paye'       },
      { label: 'En retard',   value: 'en_retard'  },
      { label: 'Annulé',      value: 'annule'     },
    ];

  constructor(
      private paymentService: PaymentsService,
      private messageService: MessageService,
      private confirmationService: ConfirmationService,
      private fb: FormBuilder,
      private datePipe: DatePipe

  ) {}

  ngOnInit(): void {
    this.loadPaiements();
    this.searchForm = this.fb.group({
        dateDebut: [null],
        dateFin:   [null],
        status:    ['']
      });

      this.onSearch();

  }

    loadPaiements() {
        this.loading = true;
        this.paymentService.getPayments().subscribe({
            next: (data) => {
                this.payments = data;
                    this.payments = data.map((payment) => ({
                        ...payment,
                    updated_at: new Date(payment.updated_at),
                    }));

                this.payments.sort(
                    (a, b) => b.updated_at.getTime() - a.updated_at.getTime()
                );
                this.totalRecords = this.payments.length;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error fetching owners:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des paiements',
                });
            },
        });
    }

marquerCommePaye(paiement: any) {
 // ── Guard : mois futur ────────────────────────────────────
    const aujourd = new Date();
    const dateEcheance = new Date(paiement.date_normale_de_paiement);

    const moisCourant  = aujourd.getFullYear() * 12 + aujourd.getMonth();
    const moisEcheance = dateEcheance.getFullYear() * 12 + dateEcheance.getMonth();

    if (moisEcheance > moisCourant) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Paiement non autorisé',
            detail: `Le paiement de ${dateEcheance.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} ne peut pas encore être encaissé.`,
        });
        return; // ← bloque ici, pas de confirmation
    }
    // ─────────────────────────────────────────────────────────

    this.confirmationService.confirm({
        message: 'Voulez-vous vraiment marquer ce paiement comme payé ?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui',
        rejectLabel: 'Non',
        acceptButtonStyleClass: 'p-button-success',
        rejectButtonStyleClass: 'p-button-secondary',
        accept: () => {
            this.loadingPaymentId = paiement.id; 

            this.paymentService.marquerCommePaye(paiement.id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Paiement marqué comme payé',
                    });
                    this.loadPaiements();
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
                    this.loadingPaymentId = null; 
                },
            });
        },
        reject: () => {
            this.messageService.add({
                severity: 'info',
                summary: 'Annulation',
                detail: 'Action annulée',
            });
        },
    });
}

      downloadExcel() {
        const params: any = {};
        if (this.searchForm.value.status) {
          params.status = this.searchForm.value.status;
        }
        if (this.searchForm.value.dateDebut) {
          params.dateDebut = this.datePipe.transform(this.searchForm.value.dateDebut, 'yyyy-MM-dd');
        }
        if (this.searchForm.value.dateFin) {
          params.dateFin = this.datePipe.transform(this.searchForm.value.dateFin, 'yyyy-MM-dd');
        }

        this.paymentService.exportExcel(params).subscribe(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `paiements_${new Date().toISOString()}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        });
      }



      onSearch() {
        const { dateDebut, dateFin, status } = this.searchForm.value;
        const params: any = {};

        if (dateDebut) params.dateDebut = this.formatDate(dateDebut);
        if (dateFin)   params.dateFin   = this.formatDate(dateFin);
        if (status)    params.status    = status;

        this.paymentService.searchPayments(params)
          .subscribe(data => {
            this.payments = data;
            this.totalRecords = this.payments.length;
          });
      }


      private formatDate(d: Date): string {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth()+1).padStart(2,'0');
        const dd = String(d.getDate()).padStart(2,'0');
        return `${yyyy}-${mm}-${dd}`;
      }

}
