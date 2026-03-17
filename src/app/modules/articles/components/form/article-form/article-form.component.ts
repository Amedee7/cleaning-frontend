import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../../../../core/services/pressing.services';
import { ArticleCategory } from '../../../../../core/models/pressing.models';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastModule} from "primeng/toast";
import {ConfirmationService, MessageService} from "primeng/api";

@Component({
    selector: 'app-article-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, ConfirmDialogModule, ToastModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './article-form.component.html',
    styleUrls: ['./article-form.component.scss']
})
export class ArticleFormComponent implements OnInit {
    form = this.fb.group({
        category_id:        ['', Validators.required],
        name:               ['', Validators.required],
        reference:          [''],
        description:        [''],
        unit:               ['pièce'],
        price_full:         [0, [Validators.required, Validators.min(1)]],
        price_cleaning:     [0],
        price_ironing:      [0],
        price_dry_cleaning: [0],
        processing_days:    [2],
        requires_marking:   [true],
        is_active:          [true],
    });

    categories = signal<ArticleCategory[]>([]);
    isEdit     = false;
    saving     = signal(false);

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private articleService: ArticleService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
        this.articleService.getCategories().subscribe(c => this.categories.set(c));

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEdit = true;
            this.articleService.getById(+id).subscribe(a => {
                this.form.patchValue({
                    ...a,
                    category_id:        String(a.category_id),
                    price_full:         +a.price_full,
                    price_cleaning:     +a.price_cleaning,
                    price_ironing:      +a.price_ironing,
                    price_dry_cleaning: +a.price_dry_cleaning,
                } as any);
            });
        }
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const id = this.route.snapshot.paramMap.get('id');
        const label = id ? 'modifier' : 'ajouter';

        this.confirmationService.confirm({
            message: `Voulez-vous vraiment ${label} cet article (<b>${this.form.value.name}</b>) au catalogue ?`,
            header: 'Confirmation Catalogue',
            icon: 'pi pi-tag',
            acceptLabel: 'Confirmer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-primary',
            rejectButtonStyleClass: 'p-button-danger',

            accept: () => {
                this.saving.set(true);
                const formData = this.form.getRawValue();

                const req = id
                    ? this.articleService.update(+id, formData as any)
                    : this.articleService.create(formData as any);

                req.subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Catalogue mis à jour',
                            detail: `L'article a été ${id ? 'mis à jour' : 'créé'} avec succès.`,
                            life: 2000
                        });

                        setTimeout(() => {
                            this.router.navigate(['/articles']);
                        }, 1000);
                    },
                    error: (err) => {
                        this.saving.set(false);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Une erreur est survenue lors de l\'enregistrement.'
                        });
                    },
                });
            }
        });
    }
}
