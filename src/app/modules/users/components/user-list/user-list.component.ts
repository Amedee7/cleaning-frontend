import { Component, OnInit, signal } from '@angular/core';
import {AppUser, Role, ROLE_COLORS, ROLE_LABELS} from "../../../../core/models/user.models";
import {UserService} from "../../../../core/services/user.services";
import {CommonModule, DatePipe} from "@angular/common";
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  standalone: true,
    imports: [CommonModule, DatePipe, RouterLink, FormsModule],
    templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
    export class UserListComponent implements OnInit {
    users      = signal<AppUser[]>([]);
    roles      = signal<Role[]>([]);
    loading    = signal(false);
    total      = signal(0);
    page       = signal(1);
    lastPage   = signal(1);
    search       = '';
    roleFilter: number | null = null;
    activeFilter = '';
    private searchTimer: any;

    readonly ROLE_COLORS = ROLE_COLORS;

    constructor(private userService: UserService) {}

    ngOnInit(): void {
        this.userService.getRoles().subscribe(r => this.roles.set(r));
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.userService.getAll({
            page: this.page(), search: this.search,
            role_id: this.roleFilter ?? '', is_active: this.activeFilter,
        }).subscribe({
            next: (res: any) => {
                this.users.set(res.data);
                this.total.set(res.total);
                this.lastPage.set(res.last_page);
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    onSearch(): void {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => { this.page.set(1); this.load(); }, 400);
    }

    setRole(id: number | null): void {
        this.roleFilter = id;
        this.page.set(1);
        this.load();
    }

    goPage(p: number): void          { this.page.set(p); this.load(); }

    toggleActive(u: AppUser): void {
        this.userService.update(u.id, { active: !u.status }).subscribe(() => this.load());
    }

    roleColor(first_name: string): string  { return ROLE_COLORS[first_name] ?? '#5a5f72'; }
    roleLabel(first_name: string): string  { return ROLE_LABELS[first_name] ?? first_name; }
    avatarBg(u: AppUser): string { return this.roleColor(u.role?.name ?? ''); }
}
