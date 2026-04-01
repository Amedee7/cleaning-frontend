import {Component, OnInit, signal} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {OrderService, PressingSettingsService} from '../../../../../core/services/pressing.services';
import {TicketPrinterComponent} from '../../../../../shared/components/ticket-printer/ticket-printer.component';
import {Order, PressingSettings} from '../../../../../core/models/pressing.models';
import {environment} from '../../../../../../environments/environment';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ToastModule} from 'primeng/toast';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, DatePipe, RouterLink, FormsModule, TicketPrinterComponent, ConfirmDialogModule, ToastModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './order-detail.component.html',
    styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
    order = signal<Order | null>(null);
    settings = signal<PressingSettings | null>(null);
    paying = signal(false);

    // État pour suivre quelle action de statut est en cours
    updatingStatus = signal<string | null>(null);

    // null = aucune génération en cours, 'deposit' ou 'receipt' = en cours
    generating = signal<'deposit' | 'receipt' | null>(null);

    depositUrl = signal<string | null>(null);
    receiptUrl = signal<string | null>(null);

    payAmount = 0;
    payMethod = 'cash';

    constructor(
        private route: ActivatedRoute,
        private orderService: OrderService,
        private settingsService: PressingSettingsService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
    ) {
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) this.load(+id);
        this.settingsService.get$().subscribe(s => this.settings.set(s));
    }

    load(id: number): void {
        this.orderService.getById(id).subscribe(o => {
            this.order.set(o);
            this.payAmount = +o.amount_due;
            if (o.deposit_pdf_url) this.depositUrl.set(`${environment.apiUrl}/orders/${o.id}/pdf?type=deposit`);
            if (o.receipt_pdf_url) this.receiptUrl.set(`${environment.apiUrl}/orders/${o.id}/pdf?type=receipt`);
        });
    }

    // ── Bon de dépôt ─────────────────────────────────────────────────────────
    generateDeposit(): void {
        if (this.generating()) return;
        this.generating.set('deposit');
        this.orderService.generatePdf(this.order()!.id, 'deposit').subscribe({
            next: () => {
                this.depositUrl.set(`${environment.apiUrl}/orders/${this.order()!.id}/pdf?type=deposit&t=${Date.now()}`);
                this.generating.set(null);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Bon de dépôt prêt',
                    detail: 'Cliquez sur Imprimer pour l\'ouvrir.',
                    life: 4000
                });
            },
            error: () => {
                this.generating.set(null);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de générer le bon de dépôt.'
                });
            },
        });
    }

    // ── Reçu de paiement ─────────────────────────────────────────────────────
    generateReceipt(): void {
        if (this.generating()) return;
        this.generating.set('receipt');
        this.orderService.generatePdf(this.order()!.id, 'receipt').subscribe({
            next: () => {
                this.receiptUrl.set(`${environment.apiUrl}/orders/${this.order()!.id}/pdf?type=receipt&t=${Date.now()}`);
                this.generating.set(null);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Reçu de paiement prêt',
                    detail: 'Cliquez sur Imprimer pour l\'ouvrir.',
                    life: 4000
                });
            },
            error: () => {
                this.generating.set(null);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de générer le reçu de paiement.'
                });
            },
        });
    }

    // ── Statuts ───────────────────────────────────────────────────────────────
    setStatus(status: string): void {
        // Éviter les clics multiples
        if (this.updatingStatus()) return;

        if (status === 'cancelled') {
            this.confirmationService.confirm({
                message: 'Voulez-vous vraiment <b>annuler</b> cette commande ?<br>Cette action impacte votre journal de caisse.',
                header: 'Confirmation d\'annulation',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Oui, annuler',
                rejectLabel: 'Non',
                acceptButtonStyleClass: 'p-button-danger p-button-text',
                rejectButtonStyleClass: 'p-button-secondary p-button-text',
                accept: () => this.doStatusUpdate(status),
                reject: () => this.updatingStatus.set(null)
            });
        } else {
            this.doStatusUpdate(status);
        }
    }

    private doStatusUpdate(status: string): void {
        const id = this.order()?.id;
        if (!id) return;

        // Activer le spinner pour ce statut
        this.updatingStatus.set(status);

        this.orderService.updateStatus(id, status).subscribe({
            next: (o) => {
                this.order.set(o);
                this.updatingStatus.set(null);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Statut mis à jour',
                    detail: `Commande : ${this.statusLabel(status)}`,
                    life: 3000
                });
            },
            error: (err) => {
                this.updatingStatus.set(null);
                console.error('Erreur mise à jour statut:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: err?.error?.message || 'Impossible de modifier le statut.',
                    life: 5000
                });
            },
        });
    }

    // ── Encaissement ─────────────────────────────────────────────────────────
    encaisser(): void {
        if (!this.payAmount || this.payAmount <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez saisir un montant valide.'
            });
            return;
        }
        this.confirmationService.confirm({
            message: `Confirmez l'encaissement de <b>${this.payAmount.toLocaleString('fr')} FCFA</b> par <b>${this.methodLabel(this.payMethod)}</b> ?`,
            header: 'Confirmation de paiement',
            icon: 'pi pi-money-bill',
            acceptLabel: 'Encaisser',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-success',
            accept: () => {
                this.paying.set(true);
                this.orderService.pay(this.order()!.id, {
                    amount: this.payAmount,
                    method: this.payMethod,
                    timing: 'at_delivery'
                }).subscribe({
                    next: (res) => {
                        this.order.set(res.order);
                        this.payAmount = +res.order.amount_due;
                        this.paying.set(false);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Paiement enregistré',
                            detail: `${(+res.payment.amount).toLocaleString('fr')} FCFA encaissés.`,
                            life: 3000
                        });
                    },
                    error: (err) => {
                        this.paying.set(false);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Échec',
                            detail: err?.error?.message || 'Erreur lors de l\'enregistrement du paiement.'
                        });
                    },
                });
            },
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    clientName(): string {
        const o = this.order();
        if (!o) return '';
        if (o.client) {
            const n = [o.client.contact_first_name, o.client.contact_last_name].filter(Boolean).join(' ').trim();
            return n || o.client.company_name || 'Client anonyme';
        }
        return o.anon_name || 'Client anonyme';
    }

    clientPhone(): string {
        const o = this.order();
        if (!o) return '';
        if (o.client) return o.client.mobile || o.client.phone || '';
        return o.anon_phone || '';
    }

    // Le reçu de paiement n'est disponible que si la commande est prête/livrée ou soldée
    canPrintReceipt(): boolean {
        const o = this.order();
        if (!o) return false;
        return ['ready', 'delivered'].includes(o.status) || o.payment_status === 'paid';
    }

    isLate(): boolean {
        const o = this.order();
        return !!o && !['delivered', 'cancelled'].includes(o.status) && new Date(o.promised_at) < new Date();
    }

    statusLabel(s: string): string {
        return ({
            pending: 'En attente',
            processing: 'En cours',
            ready: 'Prête',
            delivered: 'Livrée',
            cancelled: 'Annulée'
        } as Record<string, string>)[s] ?? s;
    }

    paymentLabel(s: string): string {
        return ({unpaid: 'Non payé', partial: 'Partiellement payé', paid: 'Payé'} as Record<string, string>)[s] ?? s;
    }

    methodLabel(m: string): string {
        return ({
            cash: 'Espèces',
            card: 'Carte',
            mobile_money: 'Mobile Money',
            check: 'Chèque',
            transfer: 'Virement',
            voucher: 'Bon'
        } as Record<string, string>)[m] ?? m;
    }

    methodIcon(m: string): string {
        return ({
            cash: '💵',
            card: '💳',
            mobile_money: '📱',
            check: '🏦',
            transfer: '🔁',
            voucher: '🎫'
        } as Record<string, string>)[m] ?? '💰';
    }

    getColorCode(color: string): string {
        const colorMap: Record<string, string> = {
            'Blanc': '#ffffff',
            'Noir': '#000000',
            'Bleu': '#3b82f6',
            'Rouge': '#ef4444',
            'Vert': '#10b981',
            'Jaune': '#f59e0b',
            'Gris': '#6b7280',
            'Marron': '#8b5a2b',
            'Beige': '#f5f5dc',
            'Multicolore': 'linear-gradient(45deg, red, blue, green)'
        };
        return colorMap[color] || '#cccccc';
    }
}
