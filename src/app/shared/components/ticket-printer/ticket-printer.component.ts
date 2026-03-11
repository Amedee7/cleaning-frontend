import { Component, Input, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/pressing.services';
import { Order } from '../../../core/models/pressing.models';
import {FormsModule} from "@angular/forms";
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

    printing  = signal(false);
    printMode = signal<'receipt' | 'stickers' | 'prep' | null>(null);

    constructor(private orderService: OrderService) {}

    printReceipt(): void  { this.triggerPrint('receipt'); }
    printStickers(): void { this.triggerPrint('stickers'); }
    printPrep(): void     { this.triggerPrint('prep'); }

    private triggerPrint(mode: 'receipt' | 'stickers' | 'prep'): void {
        this.printing.set(true);
        this.printMode.set(mode);

        setTimeout(() => {
            window.print();
            setTimeout(() => {
                this.printMode.set(null);
                this.printing.set(false);
            }, 500);
        }, 300);
    }
}
