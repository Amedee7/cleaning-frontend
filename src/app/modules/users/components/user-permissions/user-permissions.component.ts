import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services/user.services';
import {AppUser, Permission, Role, ROLE_COLORS, ROLE_LABELS} from '../../../../core/models/user.models';

@Component({
    selector: 'app-user-permissions',
    standalone: true,
    imports: [CommonModule, RouterLink],
  templateUrl: './user-permissions.component.html',
  styleUrl: './user-permissions.component.scss'
})
export class UserPermissionsComponent implements OnInit {
    user            = signal<AppUser | null>(null);
    permsByGroup    = signal<Record<string, Permission[]>>({});
    roles      = signal<Role[]>([]);
    rolePermissions = signal<string[]>([]);
    overrides       = signal<Record<string, boolean>>({});  // clé = perm.key, valeur = état actuel UI
    originalOverrides = signal<Record<string, boolean>>({});
    saving          = signal(false);

    groupKeys   = computed(() => Object.keys(this.permsByGroup()));
    totalCount  = computed(() => Object.values(this.permsByGroup()).flat().length);
    effectiveCount = computed(() =>
        Object.values(this.permsByGroup()).flat().filter(p => this.isGranted(p.key)).length
    );
    isDirty = computed(() =>
        JSON.stringify(this.overrides()) !== JSON.stringify(this.originalOverrides())
    );

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) return;

        this.userService.getById(+id).subscribe(u => this.user.set(u));
        this.userService.getRoles().subscribe(r => this.roles.set(r));


        this.userService.getPermissions(+id).subscribe(data => {
            this.permsByGroup.set(data.all_permissions);
            this.rolePermissions.set(data.role_permissions);

            // Construire l'état initial des overrides
            const state: Record<string, boolean> = {};
            const allPerms = (Object.values(data.all_permissions) as Permission[][]).flat() as Permission[];
            allPerms.forEach((p: Permission) => {
                const override = (data.user_overrides as any)[p.key];
                if (override !== undefined) {
                    state[p.key] = override.granted;
                }
            });
            this.overrides.set({ ...state });
            this.originalOverrides.set({ ...state });
        });
    }

    isGranted(key: string): boolean {
        if (key in this.overrides()) return this.overrides()[key];
        return this.rolePermissions().includes(key);
    }

    isFromRole(key: string): boolean    { return this.rolePermissions().includes(key); }
    hasOverride(key: string): boolean   { return key in this.overrides(); }
    isOverrideAdded(key: string): boolean {
        return key in this.overrides() && this.overrides()[key] && !this.rolePermissions().includes(key);
    }
    isOverrideRemoved(key: string): boolean {
        return key in this.overrides() && !this.overrides()[key] && this.rolePermissions().includes(key);
    }

    toggle(key: string): void {
        const current = this.isGranted(key);
        const roleDefault = this.rolePermissions().includes(key);
        const newState = !current;

        const updated = { ...this.overrides() };
        if (newState === roleDefault) {
            delete updated[key]; // identique au rôle → supprimer l'override
        } else {
            updated[key] = newState;
        }
        this.overrides.set(updated);
    }

    grantGroup(group: string): void {
        const updated = { ...this.overrides() };
        this.permsByGroup()[group].forEach(p => {
            if (!this.rolePermissions().includes(p.key)) updated[p.key] = true;
            else delete updated[p.key];
        });
        this.overrides.set(updated);
    }

    denyGroup(group: string): void {
        const updated = { ...this.overrides() };
        this.permsByGroup()[group].forEach(p => {
            if (this.rolePermissions().includes(p.key)) updated[p.key] = false;
            else delete updated[p.key];
        });
        this.overrides.set(updated);
    }

    resetToRole(): void {
        if (!confirm('Réinitialiser toutes les habilitations aux permissions du rôle ?')) return;
        this.overrides.set({});
    }

    discard(): void {
        this.overrides.set({ ...this.originalOverrides() });
    }

    roleColor(first_name: string): string  { return ROLE_COLORS[first_name] ?? '#2792ff'; }
    roleLabel(first_name: string): string  { return ROLE_LABELS[first_name] ?? first_name; }

    save(): void {
        this.saving.set(true);
        const id = this.route.snapshot.paramMap.get('id')!;

        // Construire l'objet complet pour l'API
        const allPerms = (Object.values(this.permsByGroup()) as Permission[][]).flat() as Permission[];
        const payload: Record<string, boolean> = {};
        allPerms.forEach(p => { payload[p.key] = this.isGranted(p.key); });

        this.userService.updatePermissions(+id, payload).subscribe({
            next: () => {
                this.originalOverrides.set({ ...this.overrides() });
                this.saving.set(false);
            },
            error: () => this.saving.set(false),
        });
    }
}
