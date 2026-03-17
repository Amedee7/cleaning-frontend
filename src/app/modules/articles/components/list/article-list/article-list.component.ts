import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../../../../core/services/pressing.services';
import { Article, ArticleCategory } from '../../../../../core/models/pressing.models';
import {ConfirmationService, MessageService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastModule} from "primeng/toast";
import {AuthService} from "../../../../../core/services/auth.service";

@Component({
    selector: 'app-article-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogModule, ToastModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './article-list.component.html',
    styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent implements OnInit {
    articles   = signal<Article[]>([]);
    categories = signal<ArticleCategory[]>([]);
    loading    = signal(false);
    total      = signal(0);
    page       = signal(1);
    lastPage   = signal(1);
    search      = '';
    catFilter: number | null = null;
    activeFilter = 'true';
    private searchTimer: any;

    constructor(
        private articleService: ArticleService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        public auth: AuthService,
    ) {}

    ngOnInit(): void {
        this.articleService.getCategories().subscribe(c => this.categories.set(c));
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.articleService.getAll({
            page:        this.page(),
            search:      this.search,
            category_id: this.catFilter ?? '',
            is_active:   this.activeFilter,
        }).subscribe({
            next: (res: any) => {
                this.articles.set(res.data ?? res);
                this.total.set(res.total ?? res.length);
                this.lastPage.set(res.last_page ?? 1);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    onSearch(): void {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => { this.page.set(1); this.load(); }, 400);
    }

    setCat(id: number | null): void { this.catFilter = id; this.page.set(1); this.load(); }
    goPage(p: number): void         { this.page.set(p); this.load(); }

    toggle(a: Article): void {
        const nextState = !a.is_active;
        const actionLabel = nextState ? 'activer' : 'désactiver';

        this.confirmationService.confirm({
            message: `Voulez-vous vraiment <b>${actionLabel}</b> l'article "${a.name}" ?`,
            header: 'Changement de statut',
            icon: nextState ? 'pi pi-check-circle' : 'pi pi-power-off',
            acceptLabel: 'Confirmer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: nextState ? 'p-button-success' : 'p-button-warning',

            accept: () => {
                this.articleService.update(a.id, { is_active: nextState } as any).subscribe({
                    next: () => {
                        this.load();
                        this.messageService.add({
                            severity: nextState ? 'success' : 'info',
                            summary: 'Statut mis à jour',
                            detail: `L'article "${a.name}" a été ${nextState ? 'activé' : 'désactivé'}.`,
                            life: 2000
                        });
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Impossible de changer le statut.'
                        });
                    }
                });
            }
        });
    }
}
