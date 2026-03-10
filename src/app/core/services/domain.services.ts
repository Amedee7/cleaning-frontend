import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Client, Property, Service, Contract, Schedule,
  Task, Report, Invoice, Equipment, Supply, Incident,
  DashboardStats, Paginated, User
} from '../models';

// ─── Dashboard ───────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiService {
  getStats(): Observable<DashboardStats> {
    return this.get<DashboardStats>('dashboard/stats');
  }
}

// ─── Clients ─────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ClientService extends ApiService {
  getAll(filters = {}): Observable<Paginated<Client>> {
    return this.get<Paginated<Client>>('clients', filters);
  }
  getById(id: number): Observable<Client> {
    return this.get<Client>(`clients/${id}`);
  }
  create(data: Partial<Client>): Observable<Client> {
    return this.post<Client>('clients', data);
  }
  update(id: number, data: Partial<Client>): Observable<Client> {
    return this.put<Client>(`clients/${id}`, data);
  }
  remove(id: number): Observable<any> {
    return this.delete<any>(`clients/${id}`);
  }
}

// ─── Properties ──────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class PropertyService extends ApiService {
  getAll(filters = {}): Observable<Paginated<Property>> {
    return this.get<Paginated<Property>>('properties', filters);
  }
  getById(id: number): Observable<Property> {
    return this.get<Property>(`properties/${id}`);
  }
  create(data: Partial<Property>): Observable<Property> {
    return this.post<Property>('properties', data);
  }
  update(id: number, data: Partial<Property>): Observable<Property> {
    return this.put<Property>(`properties/${id}`, data);
  }
  remove(id: number): Observable<any> {
    return this.delete<any>(`properties/${id}`);
  }
}

// ─── Services ────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ServiceService extends ApiService {
  getAll(filters = {}): Observable<Paginated<Service>> {
    return this.get<Paginated<Service>>('services', filters);
  }
  getById(id: number): Observable<Service> {
    return this.get<Service>(`services/${id}`);
  }
  create(data: Partial<Service>): Observable<Service> {
    return this.post<Service>('services', data);
  }
  update(id: number, data: Partial<Service>): Observable<Service> {
    return this.put<Service>(`services/${id}`, data);
  }
}

// ─── Contracts ───────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ContractService extends ApiService {
  getAll(filters = {}): Observable<Paginated<Contract>> {
    return this.get<Paginated<Contract>>('contracts', filters);
  }
  getById(id: number): Observable<Contract> {
    return this.get<Contract>(`contracts/${id}`);
  }
  create(data: Partial<Contract>): Observable<Contract> {
    return this.post<Contract>('contracts', data);
  }
  update(id: number, data: Partial<Contract>): Observable<Contract> {
    return this.put<Contract>(`contracts/${id}`, data);
  }
}

// ─── Schedules ───────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ScheduleService extends ApiService {
  getAll(filters = {}): Observable<Paginated<Schedule>> {
    return this.get<Paginated<Schedule>>('schedules', filters);
  }
  getById(id: number): Observable<Schedule> {
    return this.get<Schedule>(`schedules/${id}`);
  }
  create(data: Partial<Schedule> & { staff_ids?: number[] }): Observable<Schedule> {
    return this.post<Schedule>('schedules', data);
  }
  update(id: number, data: Partial<Schedule> & { staff_ids?: number[] }): Observable<Schedule> {
    return this.put<Schedule>(`schedules/${id}`, data);
  }
  updateStatus(id: number, status: string, reason?: string): Observable<Schedule> {
    return this.patch<Schedule>(`schedules/${id}`, { status, cancelled_reason: reason });
  }
  remove(id: number): Observable<any> {
    return this.delete<any>(`schedules/${id}`);
  }
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class TaskService extends ApiService {
  getAll(filters = {}): Observable<Paginated<Task>> {
    return this.get<Paginated<Task>>('tasks', filters);
  }
  update(id: number, data: Partial<Task>): Observable<Task> {
    return this.put<Task>(`tasks/${id}`, data);
  }
}

// ─── Reports ─────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ReportService extends ApiService {
  getAll(filters = {}): Observable<Paginated<Report>> {
    return this.get<Paginated<Report>>('reports', filters);
  }
  getById(id: number): Observable<Report> {
    return this.get<Report>(`reports/${id}`);
  }
  create(data: Partial<Report>): Observable<Report> {
    return this.post<Report>('reports', data);
  }
  uploadPhoto(reportId: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.base}/reports/${reportId}/photos`, formData);
  }
}

// ─── Invoices ────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class InvoiceService extends ApiService {
  getAll(filters = {}): Observable<Paginated<Invoice>> {
    return this.get<Paginated<Invoice>>('invoices', filters);
  }
  getById(id: number): Observable<Invoice> {
    return this.get<Invoice>(`invoices/${id}`);
  }
  create(data: any): Observable<Invoice> {
    return this.post<Invoice>('invoices', data);
  }
  markAsPaid(id: number, data: { payment_method: string; paid_at?: string }): Observable<Invoice> {
    return this.post<Invoice>(`invoices/${id}/mark-paid`, data);
  }
  remove(id: number): Observable<any> {
    return this.delete<any>(`invoices/${id}`);
  }
}

// ─── Staff / Users ────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class UserService extends ApiService {
  getAll(filters = {}): Observable<Paginated<User>> {
    return this.get<Paginated<User>>('users', filters);
  }
  getById(id: number): Observable<User> {
    return this.get<User>(`users/${id}`);
  }
  create(data: Partial<User> & { password: string }): Observable<User> {
    return this.post<User>('users', data);
  }
  update(id: number, data: Partial<User>): Observable<User> {
    return this.put<User>(`users/${id}`, data);
  }
  remove(id: number): Observable<any> {
    return this.delete<any>(`users/${id}`);
  }
}

// ─── Equipment ───────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class EquipmentService extends ApiService {
  getAll(filters = {}): Observable<Paginated<Equipment>> {
    return this.get<Paginated<Equipment>>('equipment', filters);
  }
  create(data: Partial<Equipment>): Observable<Equipment> {
    return this.post<Equipment>('equipment', data);
  }
  update(id: number, data: Partial<Equipment>): Observable<Equipment> {
    return this.put<Equipment>(`equipment/${id}`, data);
  }
}

// ─── Supplies ────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class SupplyService extends ApiService {
  getAll(filters = {}): Observable<Paginated<Supply>> {
    return this.get<Paginated<Supply>>('supplies', filters);
  }
  create(data: Partial<Supply>): Observable<Supply> {
    return this.post<Supply>('supplies', data);
  }
  update(id: number, data: Partial<Supply>): Observable<Supply> {
    return this.put<Supply>(`supplies/${id}`, data);
  }
}

// ─── Incidents ───────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class IncidentService extends ApiService {
  getAll(filters = {}): Observable<Paginated<Incident>> {
    return this.get<Paginated<Incident>>('incidents', filters);
  }
  create(data: Partial<Incident>): Observable<Incident> {
    return this.post<Incident>('incidents', data);
  }
  update(id: number, data: Partial<Incident>): Observable<Incident> {
    return this.put<Incident>(`incidents/${id}`, data);
  }
}
