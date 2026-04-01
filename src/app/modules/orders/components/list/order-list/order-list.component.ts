import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../../core/services/pressing.services';
import { Order } from '../../../../../core/models/pressing.models';
import {AuthService} from "../../../../../core/services/auth.service";
import {ConfirmationService, MessageService} from 'primeng/api';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ToastModule} from 'primeng/toast';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule, ConfirmDialogModule, ToastModule],
    providers: [ConfirmationService, MessageService],
templateUrl: './order-list.component.html',
    styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  orders   = signal<Order[]>([]);
  loading  = signal(false);
  total    = signal(0);
  page     = signal(1);
  lastPage = signal(1);
  counts   = signal<Record<string, number>>({});
  search      = '';
  statusFilter= '';
  dateFilter  = '';
  private searchTimer: any;

  statusFilters = [
    { value: '',           label: 'Toutes' },
    { value: 'pending',    label: 'En attente' },
    { value: 'processing', label: 'En traitement' },
    { value: 'ready',      label: 'Prêtes' },
    { value: 'delivered',  label: 'Livrées' },
  ];

  constructor(
      private orderService: OrderService,
      private route: ActivatedRoute,
      public auth: AuthService,
      private confirmationService: ConfirmationService,
      private messageService: MessageService,
      ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      this.statusFilter = p['status'] ?? '';
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.orderService.getAll({
      page: this.page(), search: this.search,
      status: this.statusFilter, date: this.dateFilter,
    }).subscribe({
      next: (res: any) => {
        this.orders.set(res.data);
        this.total.set(res.total);
        this.lastPage.set(res.last_page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page.set(1); this.load(); }, 400);
  }

  setStatus(v: string): void { this.statusFilter = v; this.page.set(1); this.load(); }

  goPage(p: number): void    { this.page.set(p); this.load(); }

  isLate(o: Order): boolean {
    return !['delivered','cancelled'].includes(o.status) && new Date(o.promised_at) < new Date();
  }

    deliver(o: Order): void {
        this.confirmationService.confirm({
            message: `Voulez-vous vraiment marquer la commande <strong>${o.receipt_number}</strong> comme livrée ?`,
            header: 'Confirmation de livraison',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Oui, marquer comme livrée',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => {
                this.orderService.updateStatus(o.id, 'delivered').subscribe({
                    next: () => {
                        this.load();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: `Commande ${o.receipt_number} marquée comme livrée.`
                        });
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Impossible de mettre à jour le statut.'
                        });
                    }
                });
            }
        });
    }

  statusLabel(s: string): string {
    return { pending:'En attente', processing:'En cours', ready:'Prêt', delivered:'Livré', cancelled:'Annulé' }[s] ?? s;
  }

  paymentLabel(s: string): string {
    return { unpaid:'Non payé', partial:'Partiel', paid:'Payé' }[s] ?? s;
  }
}
