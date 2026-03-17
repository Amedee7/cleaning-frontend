import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ArticleService} from '../../../../core/services/pressing.services';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ToastModule} from 'primeng/toast';

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [CommonModule, FormsModule, ConfirmDialogModule, ToastModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './categories.component.html',
    styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
    categories = signal<any[]>([]);
    loading = signal(false);
    saving = signal(false);

    // Formulaire création/édition
    editingId: number | null = null;
    showForm = false;
    form = {name: '', icon: '🧺', color: '#6b7280', is_active: true};

    // Palette d'icônes rapides
    readonly ICONS = ['👔', '👖', '🤵', '👗', '🛏️', '🧥', '🩳', '👟', '🧺', '👒', '🎩', '🧣', '🧤', '🧦', '👘', '🥻', '👙', '🩱', '🩲', '🩴', '👝', '👜', '🎽'];
    readonly COLORS = ['#4fffb0', '#00cfff', '#b388ff', '#ff9800', '#ffd54f', '#ff4f6a', '#4fc3f7', '#a5d6a7', '#bcaaa4', '#f48fb1', '#80cbc4', '#ef9a9a'];

    constructor(
        private articleService: ArticleService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
    ) {
    }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.articleService.getCategories().subscribe({
            next: (cats) => {
                this.categories.set(cats);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    startCreate(): void {
        this.editingId = null;
        this.form = {name: '', icon: '🧺', color: '#6b7280', is_active: true};
        this.showForm = true;
    }

    startEdit(cat: any): void {
        this.editingId = cat.id;
        this.form = {name: cat.name, icon: cat.icon ?? '🧺', color: cat.color ?? '#6b7280', is_active: cat.is_active};
        this.showForm = true;
    }

    cancelForm(): void {
        this.showForm = false;
        this.editingId = null;
    }

    save(): void {
        if (!this.form.name.trim()) return;
        this.saving.set(true);

        const req = this.editingId
            ? this.articleService.updateCategory(this.editingId, this.form)
            : this.articleService.createCategory(this.form);

        req.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.editingId ? 'Catégorie modifiée' : 'Catégorie créée',
                    life: 3000,
                });
                this.saving.set(false);
                this.showForm = false;
                this.editingId = null;
                this.load();
            },
            error: (err) => {
                this.saving.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: err?.error?.message ?? 'Une erreur est survenue.',
                });
            },
        });
    }

    toggleActive(cat: any): void {
        this.articleService.updateCategory(cat.id, {is_active: !cat.is_active}).subscribe({
            next: () => this.load(),
        });
    }

    deleteCategory(cat: any): void {
        if (cat.articles_count > 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Impossible',
                detail: `Cette catégorie contient ${cat.articles_count} article(s). Déplacez-les d'abord.`,
                life: 5000,
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Supprimer la catégorie <b>${cat.name}</b> ?`,
            header: 'Suppression',
            icon: 'pi pi-trash',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            accept: () => {
                this.articleService.deleteCategory(cat.id).subscribe({
                    next: () => {
                        this.messageService.add({severity: 'success', summary: 'Catégorie supprimée', life: 3000});
                        this.load();
                    },
                    error: (err) => this.messageService.add({
                        severity: 'error', summary: 'Erreur',
                        detail: err?.error?.message ?? 'Impossible de supprimer.',
                    }),
                });
            },
        });
    }
}
