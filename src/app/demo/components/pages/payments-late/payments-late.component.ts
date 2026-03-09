import { Component, OnInit } from '@angular/core';
import { PaymentsLateService } from './payments-late.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { PaymentsService } from '../payments/payments.service';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { PaginatorModule } from 'primeng/paginator';
import {NumberSpacePipe} from "../../shared/number-space.pipe";

@Component({
  selector: 'app-payments-late',
  templateUrl: './payments-late.component.html',
  standalone: true,
  imports: [CommonModule, TableModule, CardModule, MessageModule, CardModule, FormsModule, ToastModule, BadgeModule, PaginatorModule, NumberSpacePipe],
  providers: [MessageService]
})
export class PaymentsLateComponent implements OnInit {
  paiementsEnRetard: any[] = [];
  totalRecords: number = 0;
  pageSize: number = 10;
  pageNumber: number = 1;

  constructor(private paymentsService: PaymentsService, private messageService: MessageService) {}

  ngOnInit() {
    this.loadPaiementsEnRetard();
  }

  loadPaiementsEnRetard() {
    this.paymentsService.getPaymentsLate().subscribe(data => {
      this.paiementsEnRetard = data;
    }, error => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors du chargement des paiements en retard',
      });
    });
  }
}
