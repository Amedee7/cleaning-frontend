import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services/user.services';
import { AppUser, Permission, ROLE_COLORS, ROLE_LABELS } from '../../../../core/models/user.models';

@Component({
    selector: 'app-user-permissions',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './user-permissions.component.html',
    styleUrl: './user-permissions.component.scss',
})
export class UserPermissionsComponent implements OnInit {
    user              = signal<AppUser | null>(null);
    permsByGroup      = signal<Record<string, Permission[]>>({});
    rolePermissions   = signal<string[]>([]);
    overrides         = signal<Record<string, boolean>>({});
    originalOverrides = signal<Record<string, boolean>>({});
    saving            = signal(false);

    groupKeys      = computed(() => Object.keys(this.permsByGroup()));
    totalCount     = computed(() => Object.values(this.permsByGroup()).flat().length);
    effectiveCount = computed(() =>
        Object.values(this.permsByGroup()).flat().filter(p => this.isGranted(p.key)).length
    );
    isDirty = computed(() =>
        JSON.stringify(this.overrides()) !== JSON.stringify(this.originalOverrides())
    );

    constructor(
        private route: ActivatedRoute,
        private userService: UserService,
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) return;

        // getById retourne { user, effective_permissions, role_permissions, user_overrides }
        this.userService.getById(+id).subscribe((data: any) => {
            this.user.set(data.user ?? data);
        });

        this.userService.getPermissions(+id).subscribe(data => {
            this.permsByGroup.set(data.all_permissions);
            this.rolePermissions.set(data.role_permissions);

            const state: Record<string, boolean> = {};
            Object.values(data.all_permissions).flat().forEach((p: any) => {
                const override = (data.user_overrides as any)[p.key];
                if (override !== undefined) state[p.key] = override.granted;
            });
            this.overrides.set({ ...state });
            this.originalOverrides.set({ ...state });
        });
    }

    // ── Helpers affichage ─────────────────────────────────────────────────────
    initials(): string {
        const u = this.user();
        if (!u) return '';
        const f = u.first_name?.length ? u.first_name[0] : '';
        const l = u.last_name?.length  ? u.last_name[0]  : '';
        return (f + l).toUpperCase();
    }

    fullName(): string {
        const u = this.user();
        if (!u) return '';
        return [(u.first_name || ''), (u.last_name || '')].join(' ').trim();
    }

    roleColor(name: string): string { return ROLE_COLORS[name] ?? '#5a5f72'; }
    roleLabel(name: string): string { return ROLE_LABELS[name] ?? name; }

    // ── Logique permissions ───────────────────────────────────────────────────
    isGranted(key: string): boolean {
        if (key in this.overrides()) return this.overrides()[key];
        return this.rolePermissions().includes(key);
    }

    isFromRole(key: string): boolean       { return this.rolePermissions().includes(key); }
    hasOverride(key: string): boolean      { return key in this.overrides(); }
    isOverrideAdded(key: string): boolean  {
        return key in this.overrides() && this.overrides()[key] && !this.rolePermissions().includes(key);
    }
    isOverrideRemoved(key: string): boolean {
        return key in this.overrides() && !this.overrides()[key] && this.rolePermissions().includes(key);
    }

    toggle(key: string): void {
        const newState    = !this.isGranted(key);
        const roleDefault = this.rolePermissions().includes(key);
        const updated     = { ...this.overrides() };
        if (newState === roleDefault) delete updated[key];
        else updated[key] = newState;
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

    discard(): void { this.overrides.set({ ...this.originalOverrides() }); }

    save(): void {
        this.saving.set(true);
        const id = this.route.snapshot.paramMap.get('id')!;

        const payload: Record<string, boolean> = {};
        Object.values(this.permsByGroup()).flat().forEach(p => {
            payload[p.key] = this.isGranted(p.key);
        });

        this.userService.updatePermissions(+id, payload).subscribe({
            next: () => {
                this.originalOverrides.set({ ...this.overrides() });
                this.saving.set(false);
            },
            error: () => this.saving.set(false),
        });
    }
}
