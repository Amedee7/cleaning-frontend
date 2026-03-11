import { Component, OnInit, signal } from '@angular/core';
import {AppUser, Role, ROLE_COLORS, ROLE_LABELS} from "../../../../core/models/user.models";
import {UserService} from "../../../../core/services/user.services";
import {CommonModule} from "@angular/common";
import { RouterLink } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import {Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-user-form',
  standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],

    templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
    export class UserFormComponent implements OnInit {
    form = this.fb.group({
        first_name: ['', Validators.required],   // ← séparé
        last_name:  ['', Validators.required],   // ← séparé
        email:      ['', [Validators.required, Validators.email]],
        phone:      [''],
        password:   [''],
        password_confirm: [''],
        role_id:    ['', Validators.required],
        status:     ['active'],                  // ← pas is_active
    });

    roles   = signal<Role[]>([]);
    isEdit  = false;
    userId  = 0;
    saving  = signal(false);
    showPwd = false;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
    ) {}

    ngOnInit(): void {
        this.userService.getRoles().subscribe(r => this.roles.set(r));

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEdit = true;
            this.userId = +id;
            this.form.get('password')?.clearValidators();
            this.userService.getById(+id).subscribe(u => {
                this.form.patchValue({ ...u, role_id: String(u.role_id) } as any);
            });
        } else {
            this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        }
    }

    passwordMismatch(): boolean {
        const p = this.form.get('password')?.value;
        const c = this.form.get('password_confirm')?.value;
        return !!p && !!c && p !== c;
    }

    onSubmit(): void {
        if (this.form.invalid || this.passwordMismatch()) return;
        this.saving.set(true);

        const data: any = { ...this.form.value };
        delete data.password_confirm;
        if (!data.password) delete data.password;

        const req = this.isEdit
            ? this.userService.update(this.userId, data)
            : this.userService.create(data);

        req.subscribe({
            next: () => this.router.navigate(['/users']),
            error: () => this.saving.set(false),
        });
    }

    roleColor(slug: string): string { return ROLE_COLORS[slug] ?? '#5a5f72'; }
    roleDesc(slug: string): string {
        return {
            super_admin: 'Accès total au système',
            manager:     'Gestion complète du pressing',
            cashier:     'Réception et encaissement',
            operator:    'Traitement des articles',
        }[slug] ?? '';
    }
}
