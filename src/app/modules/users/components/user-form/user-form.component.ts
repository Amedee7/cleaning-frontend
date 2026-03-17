import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services/user.services';
import { ROLE_COLORS } from '../../../../core/models/user.models';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, ConfirmDialogModule, ToastModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './user-form.component.html',
    styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {

    form = this.fb.group({
        first_name:       ['', Validators.required],
        last_name:        ['', Validators.required],
        email:            ['', [Validators.required, Validators.email]],
        phone:            [''],
        password:         [''],
        password_confirm: [''],
        role_id:          ['' as any, Validators.required],
        status:           ['active'],
    });

    roles   = signal<any[]>([]);
    isEdit  = false;
    userId  = 0;
    saving  = signal(false);
    showPwd = false;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
        this.userService.getRoles().subscribe(r => this.roles.set(r));

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEdit = true;
            this.userId = +id;
            this.form.get('password')?.clearValidators();
            this.form.get('password')?.updateValueAndValidity();

            this.userService.getById(+id).subscribe((data: any) => {
                const user = data.user ?? data;
                this.form.patchValue({
                    first_name: user.first_name,
                    last_name:  user.last_name,
                    email:      user.email,
                    phone:      user.phone ?? '',
                    role_id:    user.role_id,
                    status:     user.status ?? 'active',
                });
            });
        } else {
            this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
            this.form.get('password')?.updateValueAndValidity();
        }
    }

    toggleStatus(): void {
        const current = this.form.get('status')?.value;
        this.form.get('status')?.setValue(current === 'active' ? 'inactive' : 'active');
    }

    passwordMismatch(): boolean {
        const p = this.form.get('password')?.value;
        const c = this.form.get('password_confirm')?.value;
        return !!p && !!c && p !== c;
    }

    onSubmit(): void {
        if (this.form.invalid || this.passwordMismatch()) {
            this.form.markAllAsTouched();
            return;
        }

        const firstName = this.form.get('first_name')?.value;
        const lastName  = this.form.get('last_name')?.value;
        const fullName  = `${firstName} ${lastName}`.trim();
        const action    = this.isEdit ? 'modifier' : 'créer';

        this.confirmationService.confirm({
            message: `Voulez-vous vraiment <b>${action}</b> l'utilisateur <b>${fullName}</b> ?`,
            header: this.isEdit ? 'Modification utilisateur' : 'Nouvel utilisateur',
            icon: 'pi pi-user',
            acceptLabel: 'Oui, enregistrer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-primary',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.saving.set(true);

                const data: any = { ...this.form.value };
                delete data.password_confirm;
                if (!data.password) delete data.password;

                const req = this.isEdit
                    ? this.userService.update(this.userId, data)
                    : this.userService.create(data);

                req.subscribe({
                    next: () => {
                        this.saving.set(false);
                        this.messageService.add({
                            severity: 'success',
                            summary:  this.isEdit ? 'Utilisateur modifié' : 'Utilisateur créé',
                            detail:   `${fullName} a été ${this.isEdit ? 'mis à jour' : 'créé'} avec succès.`,
                            life: 3000,
                        });
                        setTimeout(() => this.router.navigate(['/users']), 1200);
                    },
                    error: (err: any) => {
                        this.saving.set(false);
                        const detail = err?.error?.message ?? 'Une erreur est survenue.';
                        this.messageService.add({
                            severity: 'error',
                            summary:  'Erreur',
                            detail,
                            life: 5000,
                        });
                    },
                });
            },
        });
    }

    roleColor(name: string): string {
        return ROLE_COLORS[name] ?? '#5a5f72';
    }

    roleDesc(name: string): string {
        return ({
            super_admin: 'Accès total au système',
            admin:       'Administration complète',
            manager:     'Gestion complète du pressing',
            cashier:     'Réception et encaissement',
            operator:    'Traitement des articles',
            staff:       'Accès limité',
        } as Record<string, string>)[name] ?? '';
    }
}
