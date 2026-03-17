import {Component, OnInit, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {forkJoin} from 'rxjs';
import {
    OrderService,
    ArticleService,
    ClientService,
    PressingSettingsService
} from '../../../../../core/services/pressing.services';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ToastModule} from 'primeng/toast';

@Component({
    selector: 'app-order-reception',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, ConfirmDialogModule, ToastModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './order-reception.component.html',
    styleUrl: './order-reception.component.scss',
})
export class OrderReceptionComponent implements OnInit {

    // ── Client ────────────────────────────────────────────────────────────────
    clientMode = 'account';
    clientSearch = '';
    clientResults = signal<any[]>([]);
    selectedClient = signal<any | null>(null);
    anonName = '';
    anonPhone = '';
    reference = '';

    // ── Articles ──────────────────────────────────────────────────────────────
    categories = signal<any[]>([]);
    articles = signal<any[]>([]);
    selectedCat = signal<any | null>(null);
    articleSearch = '';

    // ── Commande ──────────────────────────────────────────────────────────────
    orderItems = signal<any[]>([]);
    promisedAt = '';
    notes = '';
    paymentTiming = 'at_delivery';
    paymentMethod = 'cash';
    amountPaid = 0;
    saving = signal(false);

    // ── TVA ───────────────────────────────────────────────────────────────────
    // NB: utiliser number (0/1) évite les problèmes de binding Angular avec boolean
    tvaActive = 1;   // 1 = activée, 0 = désactivée
    tvaTaux = 18;  // taux en %
    serviceTypes = [
        {value: 'service_complet', label: 'Complet'},
        {value: 'lavage', label: 'Nettoyage'},
        {value: 'repassage', label: 'Repassage'},
        {value: 'nettoyage_sec', label: 'Sec'},
    ];
    paymentTimings = [
        {value: 'at_reception', label: '💵 À la réception'},
        {value: 'at_delivery', label: '📦 À la restitution'},
    ];
    paymentMethods = [
        {value: 'cash', label: 'Espèces'},
        {value: 'card', label: 'Carte'},
        {value: 'mobile_money', label: 'Mobile Money'},
        {value: 'check', label: 'Chèque'},
    ];
    // ── Calculs réactifs ──────────────────────────────────────────────────────
    subtotal = computed(() =>
        this.orderItems().reduce((s, i) => s + (i.total || 0), 0)
    );
    discount = computed(() =>
        this.orderItems().reduce((s, i) => s + (i.discount_amount || 0), 0)
    );
    taxAmount = computed(() =>
        this.tvaActive
            ? Math.round((this.subtotal() - this.discount()) * this.tvaTaux / 100)
            : 0
    );
    total = computed(() =>
        this.subtotal() - this.discount() + this.taxAmount()
    );
    filteredArticles = computed(() => {
        let list = this.articles();
        if (this.selectedCat()) list = list.filter(a => a.category_id === this.selectedCat()!.id);
        if (this.articleSearch) {
            const s = this.articleSearch.toLowerCase();
            list = list.filter(a =>
                a.name.toLowerCase().includes(s) || a.reference?.toLowerCase().includes(s)
            );
        }
        return list;
    });
    canSubmit = computed(() =>
        this.orderItems().length > 0 && !!this.promisedAt
    );
    private searchTimer: any;

    constructor(
        private orderService: OrderService,
        private articleService: ArticleService,
        private clientService: ClientService,
        private settingsService: PressingSettingsService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
    ) {
    }

    ngOnInit(): void {

        // Date par défaut : dans 2 jours à 17h
        const d = new Date();
        d.setDate(d.getDate() + 2);
        d.setHours(17, 0, 0, 0);
        this.promisedAt = d.toISOString().slice(0, 16);

        // Charger la config TVA
        this.settingsService.getPublicConfig().subscribe({
            next: (cfg: any) => {

                const active = cfg['tva_active'];

                this.tvaActive =
                    active === true ||
                    active === 1 ||
                    active === '1' ||
                    active === 'true'
                        ? 1
                        : 0;

                this.tvaTaux = Number(cfg['tva_taux']) || 18;
            },

            error: () => {
                this.tvaActive = 1;
                this.tvaTaux = 18;
            },
        });

        // Charger catégories + articles
        forkJoin({
            cats: this.articleService.getCategories(),
            articles: this.articleService.getAll({
                no_paginate: 'true',
                is_active: 'true'
            }),
        }).subscribe({
            next: ({cats, articles}) => {
                this.categories.set(cats);
                this.articles.set(
                    (Array.isArray(articles) ? articles : articles.data ?? []).map(a => ({
                        ...a,
                        price_full: Number(a.price_full) || 0
                    }))
                );
            },
        });
    }

    // ── Gestion client ────────────────────────────────────────────────────────
    setClientMode(mode: string): void {
        this.clientMode = mode;
        this.clientResults.set([]);
        this.selectedClient.set(null);
    }

    searchClients(): void {
        clearTimeout(this.searchTimer);
        if (this.clientSearch.length < 2) {
            this.clientResults.set([]);
            return;
        }
        this.searchTimer = setTimeout(() => {
            this.clientService.getAll({search: this.clientSearch, per_page: 5}).subscribe({
                next: (res: any) => this.clientResults.set(res.data ?? []),
            });
        }, 300);
    }

    selectClient(c: any): void {
        this.selectedClient.set(c);
        this.clientResults.set([]);
        this.clientSearch = '';
    }

    removeClient(): void {
        this.selectedClient.set(null);
    }

    // ── Gestion articles ──────────────────────────────────────────────────────
    selectCat(cat: any): void {
        this.selectedCat.set(this.selectedCat()?.id === cat.id ? null : cat);
    }


    getItemQty(articleId: number): number {
        const item = this.orderItems().find(i => i.article_id === articleId);
        return item ? item.quantity : 0;
    }

    addArticle(article: any) {
        const items = this.orderItems();
        const index = items.findIndex(i => i.article_id === article.id);

        if (index > -1) {
            // On incrémente simplement la quantité
            this.changeQty(index, 1);
        } else {
            // Premier ajout
            const newItem = {
                article_id: article.id,
                article: article,
                quantity: 1,
                unit_price: article.price_full,
                service_type: 'service_complet',
                total: article.price_full,
                condition_notes: ''
            };
            this.orderItems.update(prev => [...prev, newItem]);
        }
    }

    removeItem(i: number): void {
        this.orderItems.set(this.orderItems().filter((_, idx) => idx !== i));
    }

    setServiceType(i: number, type: string): void {
        const items = [...this.orderItems()];
        const item = {...items[i]};
        const prices: Record<string, number> = {
            service_complet: +(item.article?.price_full || 0),
            lavage: +(item.article?.price_cleaning || 0),
            repassage: +(item.article?.price_ironing || 0),
            nettoyage_sec: +(item.article?.price_dry_cleaning || 0),
        };
        item.service_type = type;
        item.unit_price = prices[type] ?? 0;
        item.total = item.unit_price * item.quantity;
        items[i] = item;
        this.orderItems.set(items);
    }

    changeQty(i: number, delta: number): void {
        const items = [...this.orderItems()];
        const item = {...items[i]};
        item.quantity = Math.max(1, item.quantity + delta);
        item.total = item.unit_price * item.quantity;
        items[i] = item;
        this.orderItems.set(items);
    }

    // ── Toggle TVA ────────────────────────────────────────────────────────────
    toggleTva(active: boolean): void {
        this.tvaActive = active ? 1 : 0;
    }

    // ── Soumission ────────────────────────────────────────────────────────────
    submit(): void {
        if (!this.canSubmit()) return;

        this.confirmationService.confirm({
            message: `Confirmez-vous l'enregistrement pour un total de <b>${this.total().toLocaleString('fr')} FCFA</b> ?`,
            header: 'Nouvelle commande',
            icon: 'pi pi-shopping-cart',
            acceptLabel: 'Enregistrer',
            rejectLabel: 'Vérifier encore',
            acceptButtonStyleClass: 'p-button-success',
            accept: () => {
                this.saving.set(true);

                // tax_rate envoyé explicitement — 0 si TVA désactivée
                const taxRate = this.tvaActive ? this.tvaTaux : 0;

                const payload: any = {
                    client_id: this.selectedClient()?.id ?? null,
                    anon_name: this.clientMode === 'anon' ? this.anonName : null,
                    anon_phone: this.clientMode === 'anon' ? this.anonPhone : null,
                    reference: this.reference || null,
                    promised_at: this.promisedAt,
                    delivery_type: 'pickup',
                    payment_timing: this.paymentTiming,
                    payment_method: this.paymentMethod,
                    amount_paid: this.paymentTiming === 'at_reception' ? this.amountPaid : 0,
                    tax_rate: taxRate,
                    notes: this.notes || null,
                    items: this.orderItems().map(i => ({
                        article_id: i.article_id,
                        service_type: i.service_type,
                        quantity: i.quantity,
                        condition_notes: i.condition_notes || null,
                    })),
                };

                this.orderService.create(payload).subscribe({
                    next: (order: any) => {
                        this.saving.set(false);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Commande créée',
                            detail: `Reçu ${order.receipt_number} enregistré.`,
                            life: 3000,
                        });
                        setTimeout(() => this.router.navigate(['/orders', order.id]), 1000);
                    },
                    error: (err: any) => {
                        this.saving.set(false);
                        const detail = err?.error?.message ?? 'Veuillez vérifier les données.';
                        this.messageService.add({severity: 'error', summary: 'Erreur', detail});
                    },
                });
            },
        });
    }

}
