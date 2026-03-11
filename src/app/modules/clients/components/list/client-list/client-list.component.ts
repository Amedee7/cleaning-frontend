import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../../../core/services/domain.services';
import { Client, Paginated } from '../../../../../core/models';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './client-list.component.html',
    styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  clients    = signal<Client[]>([]);
  loading    = signal(false);
  total      = signal(0);
  page       = signal(1);
  lastPage   = signal(1);
  search     = '';
  statusFilter = '';
  typeFilter   = '';
  private searchTimer: any;

  constructor(private clientService: ClientService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.clientService.getAll({
      page: this.page(), search: this.search,
      status: this.statusFilter, type: this.typeFilter,
    }).subscribe({
      next: (res: any) => {
        this.clients.set(res.data);
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

  goPage(p: number): void { this.page.set(p); this.load(); }

  deleteClient(client: Client): void {
    if (!confirm(`Supprimer ${client.display_name} ?`)) return;
    this.clientService.remove(client.id).subscribe(() => this.load());
  }
}
