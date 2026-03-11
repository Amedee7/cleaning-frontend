import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OrderService, ArticleService } from '../../../../../core/services/pressing.services';
import { ClientService } from '../../../../../core/services/domain.services';
import { Article, ArticleCategory, OrderItem } from '../../../../../core/models/pressing.models';
import {Client} from "../../../../../core/models";
import { SafeNumberPipe} from "../../../../../core/pipes/safe-number.pipe";


@Component({
  selector: 'app-order-reception',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './order-reception.component.html',
  styleUrls: ['./order-reception.component.scss']
})

export class OrderReceptionComponent implements OnInit {
  // Client
  clientMode    = 'account';
  clientSearch  = '';
  clientResults = signal<Client[]>([]);
  selectedClient= signal<Client | null>(null);
  anonName      = '';
  anonPhone     = '';
  reference     = '';

  // Articles
  categories      = signal<ArticleCategory[]>([]);
  articles        = signal<Article[]>([]);
  selectedCat     = signal<ArticleCategory | null>(null);
  articleSearch   = '';

  // Commande
  orderItems   = signal<OrderItem[]>([]);
  promisedAt   = '';
  notes        = '';
  paymentTiming = 'at_delivery';
  paymentMethod = 'cash';
  amountPaid    = 0;
  saving        = signal(false);

  private searchTimer: any;

  TAX_RATE = 18;

  serviceTypes = [
    { value: 'full',         label: 'Complet' },
    { value: 'cleaning',     label: 'Nettoyage' },
    { value: 'ironing',      label: 'Repassage' },
    { value: 'dry_cleaning', label: 'Sec' },
  ];

  paymentTimings = [
    { value: 'at_reception', label: '💵 À la réception' },
    { value: 'at_delivery',  label: '📦 À la restitution' },
  ];

  paymentMethods = [
    { value: 'cash',         label: 'Espèces' },
    { value: 'card',         label: 'Carte' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'check',        label: 'Chèque' },
  ];

  subtotal = computed(() => this.orderItems().reduce((s, i) => s + i.total, 0));
  discount = computed(() => 0); // calculé côté backend
  taxAmount= computed(() => Math.round(this.subtotal() * this.TAX_RATE / 100));
  total    = computed(() => this.subtotal() + this.taxAmount());

  filteredArticles = computed(() => {
    let list = this.articles();
    if (this.selectedCat()) list = list.filter(a => a.category_id === this.selectedCat()!.id);
    if (this.articleSearch) {
      const s = this.articleSearch.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(s) || a.reference?.toLowerCase().includes(s));
    }
    return list;
  });

  canSubmit = computed(() =>
    this.orderItems().length > 0 && !!this.promisedAt &&
    (this.clientMode === 'account' ? true : true)
  );

  constructor(
    private orderService: OrderService,
    private articleService: ArticleService,
    private clientService: ClientService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Défaut: dans 2 jours
    const d = new Date(); d.setDate(d.getDate() + 2); d.setHours(17, 0);
    this.promisedAt = d.toISOString().slice(0, 16);

    forkJoin({
      cats:     this.articleService.getCategories(),
      articles: this.articleService.getAll({ no_paginate: 'true', is_active: 'true' }),
    }).subscribe(({ cats, articles }) => {
      this.categories.set(cats);
      this.articles.set(articles);
    });
  }

  setClientMode(mode: string): void {
    this.clientMode = mode;
    this.clientResults.set([]);
    this.selectedClient.set(null);
  }

  searchClients(): void {
    clearTimeout(this.searchTimer);
    if (this.clientSearch.length < 2) { this.clientResults.set([]); return; }
    this.searchTimer = setTimeout(() => {
      this.clientService.getAll({ search: this.clientSearch, per_page: 5 }).subscribe(
        (res: any) => this.clientResults.set(res.data)
      );
    }, 300);
  }

  selectClient(c: Client): void {
    this.selectedClient.set(c);
    this.clientResults.set([]);
    this.clientSearch = '';
  }

  removeClient(): void { this.selectedClient.set(null); }

  selectCat(cat: ArticleCategory): void {
    this.selectedCat.set(this.selectedCat()?.id === cat.id ? null : cat);
  }

  addArticle(a: Article): void {
    const article = {
      ...a,
      price_full:         +a.price_full,
      price_cleaning:     +a.price_cleaning,
      price_ironing:      +a.price_ironing,
      price_dry_cleaning: +a.price_dry_cleaning,
    };

    const existing = this.orderItems().findIndex(
      i => i.article_id === article.id && i.service_type === 'full'
    );
    if (existing >= 0) { this.changeQty(existing, 1); return; }

    const items = [...this.orderItems(), {
      article_id:      article.id,
      article:         article,
      service_type:    'full' as const,
      quantity:        1,
      unit_price:      article.price_full,
      discount_amount: 0,
      total:           article.price_full,
    }];
    this.orderItems.set(items);
  }

  removeItem(i: number): void {
    this.orderItems.set(this.orderItems().filter((_, idx) => idx !== i));
  }

  setServiceType(i: number, type: any): void {
    const items = [...this.orderItems()];
    const item  = { ...items[i] };
    item.service_type = type;
    const prices: Record<string, number> = {
      full:         item.article!.price_full,
      cleaning:     item.article!.price_cleaning,
      ironing:      item.article!.price_ironing,
      dry_cleaning: item.article!.price_dry_cleaning,
    };
    item.unit_price = prices[type];
    item.total      = item.unit_price * item.quantity;
    items[i]        = item;
    this.orderItems.set(items);
  }

  changeQty(i: number, delta: number): void {
    const items = [...this.orderItems()];
    const item  = { ...items[i] };
    item.quantity = Math.max(1, item.quantity + delta);
    item.total    = item.unit_price * item.quantity;
    items[i]      = item;
    this.orderItems.set(items);
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.saving.set(true);

    const payload: any = {
      client_id:       this.selectedClient()?.id ?? null,
      anon_name:       this.clientMode === 'anon' ? this.anonName  : null,
      anon_phone:      this.clientMode === 'anon' ? this.anonPhone : null,
      reference:       this.reference,
      promised_at:     this.promisedAt,
      delivery_type:   'pickup',
      payment_timing:  this.paymentTiming,
      payment_method:  this.paymentMethod,
      amount_paid:     this.paymentTiming === 'at_reception' ? this.amountPaid : 0,
      notes:           this.notes,
      items: this.orderItems().map(i => ({
        article_id:      i.article_id,
        service_type:    i.service_type,
        quantity:        i.quantity,
        condition_notes: i.condition_notes,
      })),
    };

    this.orderService.create(payload).subscribe({
      next: (order) => this.router.navigate(['/orders', order.id]),
      error: () => this.saving.set(false),
    });
  }
}
