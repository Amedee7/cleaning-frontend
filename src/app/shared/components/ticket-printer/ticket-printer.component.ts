import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../core/models/pressing.models';

@Component({
    selector: 'app-ticket-printer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ticket-printer.component.html',
    styleUrl: './ticket-printer.component.scss'
})
export class TicketPrinterComponent {
    @Input() order!: Order;
    @Input() shopName    = 'MonPressing';
    @Input() shopAddress = '';
    @Input() shopPhone   = '';
    @Input() showPrintButton = true; // Afficher ou non le bouton d'impression

    viewMode = signal<'receipt' | 'stickers' | 'prep'>('receipt');
    printing = signal(false);

    setViewMode(mode: 'receipt' | 'stickers' | 'prep'): void {
        this.viewMode.set(mode);
    }

    // Méthode d'impression
    printCurrentView(): void {
        this.printing.set(true);

        // Préparer l'impression
        setTimeout(() => {
            window.print();

            // Réinitialiser après impression
            setTimeout(() => {
                this.printing.set(false);
            }, 500);
        }, 100);
    }

    // Obtenir le titre pour l'impression
    getPrintTitle(): string {
        switch(this.viewMode()) {
            case 'receipt': return `Reçu_${this.order.receipt_number}`;
            case 'stickers': return `Stickers_${this.order.receipt_number}`;
            case 'prep': return `Preparation_${this.order.receipt_number}`;
            default: return 'Ticket';
        }
    }
}
