import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, PressingSettingsService } from '../../../../../core/services/pressing.services';
import { TicketPrinterComponent } from '../../../../../shared/components/ticket-printer/ticket-printer.component';
import { Order, PressingSettings } from '../../../../../core/models/pressing.models';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, DatePipe, RouterLink, FormsModule, TicketPrinterComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
    order    = signal<Order | null>(null);
    settings = signal<PressingSettings | null>(null);
    paying   = signal(false);

    payAmount = 0;
    payMethod = 'cash';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private orderService: OrderService,
        private settingsService: PressingSettingsService,
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) this.load(+id);
        this.settingsService.get$().subscribe(s => this.settings.set(s));
    }

    load(id: number): void {
        this.orderService.getById(id).subscribe(o => {
            this.order.set(o);
            this.payAmount = +o.amount_due;
        });
    }

    setStatus(status: string): void {
        if (status === 'cancelled' && !confirm('Annuler cette commande ?')) return;
        this.orderService.updateStatus(this.order()!.id, status).subscribe(o => this.order.set(o));
    }

    encaisser(): void {
        if (!this.payAmount || this.payAmount <= 0) return;
        this.paying.set(true);
        this.orderService.pay(this.order()!.id, {
            amount:  this.payAmount,
            method:  this.payMethod,
            timing:  'at_delivery',
        }).subscribe({
            next: (res) => {
                this.order.set(res.order);
                this.payAmount = +res.order.amount_due;
                this.paying.set(false);
            },
            error: () => this.paying.set(false),
        });
    }

    isLate(): boolean {
        const o = this.order();
        return !!o && !['delivered','cancelled'].includes(o.status)
            && new Date(o.promised_at) < new Date();
    }

    statusLabel(s: string): string {
        return { pending:'En attente', processing:'En cours', ready:'Prête', delivered:'Livrée', cancelled:'Annulée' }[s] ?? s;
    }

    paymentLabel(s: string): string {
        return { unpaid:'Non payé', partial:'Partiellement payé', paid:'Payé' }[s] ?? s;
    }

    methodLabel(m: string): string {
        return { cash:'Espèces', card:'Carte', mobile_money:'Mobile Money', check:'Chèque', transfer:'Virement', voucher:'Bon' }[m] ?? m;
    }

    methodIcon(m: string): string {
        return { cash:'💵', card:'💳', mobile_money:'📱', check:'🏦', transfer:'🔁', voucher:'🎫' }[m] ?? '💰';
    }
}
