import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientGroupService } from '../../../../../core/services/pressing.services';
import { ClientService } from '../../../../../core/services/domain.services';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-client-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, ConfirmDialogModule, ToastModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './client-form.component.html',
    styleUrl: './client-form.component.scss',
})
export class ClientFormComponent implements OnInit {
    form = this.fb.group({
        type:               ['individual'],
        company_name:       [''],
        contact_first_name: ['', Validators.required],
        contact_last_name:  ['', Validators.required],
        email:              ['', Validators.email],
        phone:              ['', Validators.required],
        mobile:             [''],
        billing_address:    [''],
        postal_code:        [''],
        city:               [''],
        country:            ['Burkina Faso'],
        tax_number:         [''],
        client_group_id:    [null as number | null],
        loyalty_points:     [0],
        status:             ['active'],
        notes:              [''],
    });

    isEdit = false;
    saving = signal(false);
    // any[] — pas de typage fort pour éviter les conflits avec Paginated<T>
    groups = signal<any[]>([]);

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private clientService: ClientService,
        private clientGroupService: ClientGroupService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
        // Charger les groupes — on extrait .data si la réponse est paginée
        this.clientGroupService.getAll().subscribe({
            next: (res: any) => {
                // Selon le backend : tableau direct ou objet paginé {data:[...]}
                this.groups.set(Array.isArray(res) ? res : (res.data ?? []));
            },
            error: () => this.groups.set([]),
        });

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEdit = true;
            this.clientService.getById(+id).subscribe((c: any) => {
                this.form.patchValue({
                    type:               c.type               ?? 'individual',
                    company_name:       c.company_name       ?? '',
                    contact_first_name: c.contact_first_name ?? '',
                    contact_last_name:  c.contact_last_name  ?? '',
                    email:              c.email              ?? '',
                    phone:              c.phone              ?? '',
                    mobile:             c.mobile             ?? '',
                    billing_address:    c.billing_address    ?? '',
                    postal_code:        c.postal_code        ?? '',
                    city:               c.city               ?? '',
                    country:            c.country            ?? 'Burkina Faso',
                    tax_number:         c.tax_number         ?? '',
                    client_group_id:    c.client_group_id    ?? null,
                    loyalty_points:     c.loyalty_points     ?? 0,
                    status:             c.status             ?? 'active',
                    notes:              c.notes              ?? '',
                });
            });
        }
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const id     = this.route.snapshot.paramMap.get('id');
        const action = id ? 'modifier' : 'créer';

        this.confirmationService.confirm({
            message: `Voulez-vous vraiment ${action} ce client ?`,
            header: 'Confirmation',
            icon: 'pi pi-save',
            acceptLabel: 'Oui, enregistrer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-primary',
            accept: () => {
                this.saving.set(true);
                const data = this.form.getRawValue() as any;

                const req = id
                    ? this.clientService.update(+id, data)
                    : this.clientService.create(data);

                req.subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: id ? 'Client modifié' : 'Client créé',
                            life: 2000,
                        });
                        setTimeout(() => this.router.navigate(['/clients']), 1200);
                    },
                    error: (err: any) => {
                        this.saving.set(false);
                        const msg = err?.error?.message ?? 'Une erreur est survenue.';
                        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg });
                    },
                });
            },
        });
    }}
