import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {
    Article, ArticleCategory, Order, Payment,
    PressingDashboard, DailyReport, PressingSettings
} from '../models/pressing.models';
import {HttpClient} from "@angular/common/http";

// ─── ArticleService ───────────────────────────────────────────────────────────
@Injectable({providedIn: 'root'})
export class ArticleService extends ApiService {
    getAll(filters = {}): Observable<any> {
        return this.get<any>('articles', filters);
    }

    getById(id: number): Observable<Article> {
        return this.get<Article>(`articles/${id}`);
    }

    create(data: Partial<Article>): Observable<Article> {
        return this.post<Article>('articles', data);
    }

    update(id: number, data: Partial<Article>): Observable<Article> {
        return this.put<Article>(`articles/${id}`, data);
    }

    remove(id: number): Observable<any> {
        return this.delete<any>(`articles/${id}`);
    }


    // ── Catégories ─────────────────────────────────────────────────────────────    @Injectable({ providedIn: 'root' })


    getCategories(): Observable<ArticleCategory[]> {
        return this.get<ArticleCategory[]>('articles/categories');
    }

    createCategory(data: any): Observable<any> {
        return this.post<any>('article-categories', data);
    }

    updateCategory(id: number, data: any): Observable<any> {
        return this.put<any>(`article-categories/${id}`, data);
    }

    deleteCategory(id: number): Observable<any> {
        return this.delete<any>(`article-categories/${id}`);
    }

    reorderCategories(order: number[]): Observable<any> {
        return this.post<any>('article-categories/reorder', {order});
    }
}

// ─── OrderService ─────────────────────────────────────────────────────────────
@Injectable({providedIn: 'root'})
export class OrderService extends ApiService {
    getAll(filters = {}): Observable<any> {
        return this.get<any>('orders', filters);
    }

    getOrdersByDateRange(startDate: string, endDate: string) {
        return this.getAll({
            date_from: startDate,
            date_to: endDate,
            per_page: 1000
        });
    }

    getCalendar(filters = {}): Observable<any> {
        return this.get<any>('orders/calendar', filters);
    }

    getById(id: number): Observable<Order> {
        return this.get<Order>(`orders/${id}`);
    }

    create(data: any): Observable<Order> {
        return this.post<Order>('orders', data);
    }

    update(id: number, data: any): Observable<Order> {
        return this.put<Order>(`orders/${id}`, data);
    }

    remove(id: number): Observable<any> {
        return this.delete<any>(`orders/${id}`);
    }

    updateStatus(id: number, status: string): Observable<Order> {
        return this.patch<Order>(`orders/${id}/status`, {status});
    }

    pay(id: number, data: {
        amount: number; method: string; timing: string; reference?: string;
    }): Observable<any> {
        return this.post<any>(`orders/${id}/pay`, data);
    }

    getTickets(id: number): Observable<any> {
        return this.get<any>(`orders/${id}/tickets`);
    }

    generatePdf(orderId: number, type: 'deposit' | 'receipt' = 'deposit'): Observable<any> {
        return this.post(`orders/${orderId}/generate-pdf?type=${type}`, {});
    }
}

// ── ClientGroupService ────────────────────────────────────────────────────────
@Injectable({providedIn: 'root'})
export class ClientGroupService extends ApiService {
    constructor(http: HttpClient) {
        super(http);
    }

    getAll(): Observable<any[]> {
        return this.get<any[]>('client-groups');
    }
}

// ─── DashboardPressingService ─────────────────────────────────────────────────
@Injectable({providedIn: 'root'})
export class DashboardPressingService extends ApiService {
    getStats(): Observable<PressingDashboard> {
        return this.get<PressingDashboard>('dashboard/pressing');
    }
}

// ─── DailyReportService ───────────────────────────────────────────────────────
@Injectable({providedIn: 'root'})
export class DailyReportService extends ApiService {
    getAll(filters = {}): Observable<any> {
        return this.get<any>('daily-reports', filters);
    }

    generate(date?: string): Observable<DailyReport> {
        return this.post<DailyReport>('daily-reports/generate', {date});
    }

    close(date: string): Observable<DailyReport> {
        return this.post<DailyReport>(`daily-reports/${date}/close`, {});
    }

    getByDate(date: string): Observable<DailyReport> {
        return this.get<DailyReport>(`daily-reports/${date}`);
    }
}

// ─── PressingSettingsService ──────────────────────────────────────────────────
@Injectable({providedIn: 'root'})
export class PressingSettingsService extends ApiService {
    get$(): Observable<PressingSettings> {
        return this.get<PressingSettings>('pressing/settings');
    }

    update(data: Partial<PressingSettings>): Observable<PressingSettings> {
        return this.put<PressingSettings>('pressing/settings', data);
    }

    getPublicConfig(): Observable<Record<string, string>> {
        return this.get<Record<string, string>>('configurations/public');
    }
}

// ── ClientService ─────────────────────────────────────────────────────────────
@Injectable({providedIn: 'root'})
export class ClientService extends ApiService {
    constructor(http: HttpClient) {
        super(http);
    }

    getAll(params: any = {}): Observable<any> {
        return this.get<any>('clients', params);
    }

    getById(id: number): Observable<any> {
        return this.get<any>(`clients/${id}`);
    }

    create(data: any): Observable<any> {
        return this.post<any>('clients', data);
    }

    update(id: number, data: any): Observable<any> {
        return this.put<any>(`clients/${id}`, data);
    }

}

