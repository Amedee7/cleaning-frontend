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
    receivedAt = '';
    promisedAt = '';
    deliveryType = 'pickup';
    deliveryAddress = '';
    notes = '';
    internalNotes = '';

    // ── Paiement ─────────────────────────────────────────────────────────────
    paymentTiming = 'at_delivery';
    paymentMethod = 'cash';
    paymentReference = '';
    amountPaid = 0;

    // ── TVA ───────────────────────────────────────────────────────────────────
    tvaActive = signal(0);
    tvaTaux = 18;

    // ── État ─────────────────────────────────────────────────────────────────
    saving = signal(false);
    private searchTimer: any;

    // ── Listes déroulantes ───────────────────────────────────────────────────
    serviceTypes = [
        {value: 'service_complet', label: 'Complet'},
        {value: 'lavage', label: 'Nettoyage'},
        {value: 'repassage', label: 'Repassage'},
        {value: 'nettoyage_sec', label: 'Sec'},
    ];

    paymentTimings = [
        {value: 'at_reception', label: '💵 À la réception'},
        {value: 'at_delivery', label: '📦 À la restitution'},
        {value: 'split', label: '🔀 Paiement fractionné'},
    ];

    paymentMethods = [
        {value: 'cash', label: 'Espèces'},
        {value: 'card', label: 'Carte'},
        {value: 'mobile_money', label: 'Mobile Money'},
        {value: 'check', label: 'Chèque'},
        {value: 'transfer', label: 'Virement'},
        {value: 'voucher', label: 'Bon'},
    ];

    // Couleurs prédéfinies
    predefinedColors = [
        { name: 'Blanc', code: '#FFFFFF' },
        { name: 'Noir', code: '#000000' },
        { name: 'Gris', code: '#808080' },
        { name: 'Argent', code: '#C0C0C0' },
        { name: 'Beige', code: '#F5F5DC' },
        { name: 'Rouge', code: '#FF0000' },
        { name: 'Bordeaux', code: '#800000' },
        { name: 'Rose', code: '#FFC0CB' },
        { name: 'Orange', code: '#FFA500' },
        { name: 'Jaune', code: '#FFFF00' },
        { name: 'Vert clair', code: '#90EE90' },
        { name: 'Vert', code: '#008000' },
        { name: 'Turquoise', code: '#40E0D0' },
        { name: 'Bleu clair', code: '#ADD8E6' },
        { name: 'Bleu', code: '#0000FF' },
        { name: 'Bleu marine', code: '#000080' },
        { name: 'Violet', code: '#800080' },
        { name: 'Lavande', code: '#E6E6FA' },
        { name: 'Marron', code: '#8B4513' },
        { name: 'Kaki', code: '#C3B091' },
    ];

    activeColorPicker: number | null = null;
    hoverColor: string | null = null;
    gradientContext: CanvasRenderingContext2D | null = null;

    // ── Calculs réactifs ──────────────────────────────────────────────────────
    subtotal = computed(() =>
        this.orderItems().reduce((s, i) => s + (i.total || 0), 0)
    );

    discount = computed(() =>
        this.orderItems().reduce((s, i) => s + (i.discount_amount || 0), 0)
    );

    taxAmount = computed(() =>
        this.tvaActive() === 1
            ? Math.round((this.subtotal() - this.discount()) * this.tvaTaux / 100)
            : 0
    );

    total = computed(() =>
        this.subtotal() - this.discount() + this.taxAmount()
    );

    totalItems = computed(() =>
        this.orderItems().reduce((sum, item) => sum + (item.quantity || 0), 0)
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

    canSubmit = computed(() => {
        const hasItems = this.orderItems().length > 0;
        const hasClient = this.clientMode === 'account' ? this.selectedClient() : (this.anonName && this.anonPhone);
        const hasPromisedDate = !!this.promisedAt;
        const hasDeliveryAddress = this.deliveryType === 'delivery' ? !!this.deliveryAddress : true;

        return hasItems && hasClient && hasPromisedDate && hasDeliveryAddress;
    });

    constructor(
        private orderService: OrderService,
        private articleService: ArticleService,
        private clientService: ClientService,
        private settingsService: PressingSettingsService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
        // Date de réception par défaut : maintenant
        const now = new Date();
        this.receivedAt = now.toISOString().slice(0, 16);

        // Date de retour par défaut : dans 2 jours à 17h
        const d = new Date();
        d.setDate(d.getDate() + 2);
        d.setHours(17, 0, 0, 0);
        this.promisedAt = d.toISOString().slice(0, 16);

        // Charger la config TVA
        this.settingsService.getPublicConfig().subscribe({
            next: (cfg: any) => {
                const active = cfg['tva_active'];
                this.tvaActive.set(
                    active === true || active === 1 || active === '1' || active === 'true'
                        ? 1 : 0
                );
                this.tvaTaux = Number(cfg['tva_taux']) || 18;
            },
            error: () => {
                this.tvaActive.set(0);
                this.tvaTaux = 18;
            }
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
                        price_full: Number(a.price_full) || 0,
                        price_cleaning: Number(a.price_cleaning) || 0,
                        price_ironing: Number(a.price_ironing) || 0,
                        price_dry_cleaning: Number(a.price_dry_cleaning) || 0,
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


    generateStickerCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    removeItem(i: number): void {
        this.orderItems.set(this.orderItems().filter((_, idx) => idx !== i));
    }


    changeQty(i: number, delta: number): void {
        const items = [...this.orderItems()];
        const item = {...items[i]};
        item.quantity = Math.max(1, item.quantity + delta);
        item.total = (item.unit_price * item.quantity) - (item.discount_amount || 0);
        items[i] = item;
        this.orderItems.set(items);
    }

    // ── Toggle TVA ────────────────────────────────────────────────────────────
    toggleTva(active: boolean): void {
        this.tvaActive.set(active ? 1 : 0);
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

                const taxRate = this.tvaActive() === 1 ? this.tvaTaux : 0;

                const payload: any = {
                    // Client
                    client_id: this.selectedClient()?.id ?? null,
                    anon_name: this.clientMode === 'anon' ? this.anonName : null,
                    anon_phone: this.clientMode === 'anon' ? this.anonPhone : null,
                    reference: this.reference || null,

                    // Dates
                    received_at: this.receivedAt,
                    promised_at: this.promisedAt,

                    // Livraison
                    delivery_type: this.deliveryType,
                    delivery_address: this.deliveryType === 'delivery' ? this.deliveryAddress : null,

                    // Paiement
                    payment_timing: this.paymentTiming,
                    payment_method: this.paymentMethod,
                    payment_reference: this.paymentReference || null,
                    amount_paid: this.paymentTiming === 'at_reception' ? this.amountPaid : 0,

                    // TVA
                    tax_rate: taxRate,

                    // Notes
                    notes: this.notes || null,
                    internal_notes: this.internalNotes || null,

                    // Articles - CORRECTION ICI
                    items: this.orderItems().map(i => {
                        // Déterminer la valeur de couleur à envoyer
                        let colorValue = null;

                        // Si c'est une couleur personnalisée (avec code hex)
                        if (i.color === 'custom' && i.customColor) {
                            colorValue = i.customColor;  // Envoie le code hex
                        }
                        // Si c'est "Autre" avec valeur personnalisée
                        else if (i.color === 'Autre' && i.colorOther) {
                            colorValue = i.colorOther;
                        }
                        // Si c'est une couleur prédéfinie
                        else if (i.color && i.color !== 'custom' && i.color !== 'Autre') {
                            colorValue = i.color;
                        }

                        return {
                            article_id: i.article_id,
                            service_type: i.service_type,
                            quantity: i.quantity,
                            condition_notes: i.condition_notes || null,
                            sticker_code: i.sticker_code,
                            color: colorValue,  // ← Maintenant ça envoie la bonne valeur
                            brand: i.brand || null,
                        };
                    }),
                };

                console.log('Payload envoyé:', JSON.stringify(payload, null, 2)); // Pour déboguer

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
                        console.error('Erreur création commande:', err);
                    },
                });
            },
        });
    }

// Ajoutez cette méthode pour les notes rapides
    addQuickNote(index: number, note: string): void {
        const items = [...this.orderItems()];
        const currentNotes = items[index].condition_notes || '';
        items[index].condition_notes = currentNotes ? `${currentNotes}, ${note}` : note;
        this.orderItems.set(items);
    }

// Ajoutez cette méthode pour copier le code sticker
    copyStickerCode(code: string): void {
        navigator.clipboard.writeText(code).then(() => {
            this.messageService.add({
                severity: 'success',
                summary: 'Copié !',
                detail: 'Code sticker copié dans le presse-papier',
                life: 2000
            });
        });
    }

// Modifiez la méthode addArticle pour inclure les nouveaux champs
    addArticle(article: any) {
        const items = this.orderItems();
        const index = items.findIndex(i => i.article_id === article.id);

        if (index > -1) {
            this.changeQty(index, 1);
        } else {
            const stickerCode = this.generateStickerCode();

            const newItem = {
                article_id: article.id,
                article: article,
                quantity: 1,
                unit_price: article.price_full,
                service_type: 'service_complet',
                discount_amount: 0,
                total: article.price_full,
                condition_notes: '',
                color: '',           // ← Nouveau champ
                colorOther: '',       // ← Pour "Autre"
                brand: '',           // ← Nouveau champ
                sticker_code: stickerCode,
                sticker_printed: false,
                status: 'pending',
                processing_notes: '',
            };
            this.orderItems.update(prev => [...prev, newItem]);

            // Focus automatique sur la couleur après ajout
            setTimeout(() => {
                const colorSelects = document.querySelectorAll('.variant-select');
                if (colorSelects.length > 0) {
                    (colorSelects[colorSelects.length - 1] as HTMLElement).focus();
                }
            }, 100);
        }
    }

// Modifiez la méthode setServiceType pour préserver les nouveaux champs
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
        item.total = (item.unit_price * item.quantity) - (item.discount_amount || 0);

        // Préserver les nouveaux champs
        items[i] = item;
        this.orderItems.set(items);
    }


// Basculer la palette de couleurs
    toggleColorPalette(index: number): void {
        this.activeColorPicker = this.activeColorPicker === index ? null : index;
    }

    // Quand l'utilisateur sélectionne une couleur prédéfinie
    selectColor(index: number, colorName: string, colorCode: string): void {
        const items = [...this.orderItems()];
        items[index] = {
            ...items[index],
            color: colorName,
            colorCode: colorCode,  // Stocker le code hex séparément
            displayColor: colorCode
        };
        this.orderItems.set(items);
        this.activeColorPicker = null;
    }

// Quand l'utilisateur choisit une couleur personnalisée
    onCustomColorChange(index: number, colorCode: string): void {
        const items = [...this.orderItems()];
        items[index] = {
            ...items[index],
            color: 'personnalisée',
            colorCode: colorCode,
            displayColor: colorCode
        };
        this.orderItems.set(items);
    }

// Changer la couleur personnalisée via le champ texte
    onCustomColorTextChange(index: number, value: string): void {
        const items = [...this.orderItems()];

        // Si c'est un code hexadécimal valide
        if (value.match(/^#[0-9A-F]{6}$/i)) {
            items[index] = {
                ...items[index],
                color: 'custom',
                colorCode: value,
                customColor: value,
                colorName: value
            };
        } else {
            // Sinon c'est un nom de couleur
            items[index] = {
                ...items[index],
                color: value,
                colorCode: this.getColorCode(value),
                customColor: null,
                colorName: value
            };
        }
        this.orderItems.set(items);
    }

// Obtenir la couleur d'affichage
    getDisplayColor(item: any): string {
        if (item.colorCode) return item.colorCode;
        if (item.customColor) return item.customColor;
        if (item.color) return this.getColorCode(item.color);
        return '#f8fafc';
    }

// Obtenir le nom de la couleur
    getColorName(item: any): string {
        if (item.color === 'custom') return item.customColor || 'Personnalisé';
        if (item.color) return item.color;
        return 'Non définie';
    }

// Obtenir le code couleur à partir du nom
    getColorCode(colorName: string): string {
        const color = this.predefinedColors.find(c =>
            c.name.toLowerCase() === colorName.toLowerCase()
        );
        return color?.code || '#cccccc';
    }

// Obtenir le nom à partir du code hexadécimal
    getColorNameFromCode(hexCode: string): string {
        const color = this.predefinedColors.find(c =>
            c.code.toUpperCase() === hexCode.toUpperCase()
        );
        return color?.name || hexCode;
    }

// Gérer le survol du dégradé
    onGradientHover(event: MouseEvent, index: number): void {
        const gradient = event.currentTarget as HTMLElement;
        const rect = gradient.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const width = rect.width;

        // Calculer la couleur en fonction de la position
        const hue = (x / width) * 360;
        const saturation = 100;
        const lightness = 50;

        this.hoverColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

// Gérer le clic sur le dégradé
    onGradientClick(event: MouseEvent, index: number): void {
        if (!this.hoverColor) return;

        const items = [...this.orderItems()];
        items[index] = {
            ...items[index],
            color: 'custom',
            colorCode: this.hoverColor,
            customColor: this.hoverColor,
            colorName: this.hoverColor
        };
        this.orderItems.set(items);
        this.activeColorPicker = null;
        this.hoverColor = null;
    }

// Initialiser le canvas pour le dégradé (optionnel pour plus de précision)
    initGradient(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        for (let i = 0; i <= 360; i += 10) {
            gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.gradientContext = ctx;
    }
}
