import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { OrderService } from "../../../../core/services/pressing.services";

interface CalendarEvent {
    id: number;
    title: string;
    date: Date;
    type: 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';
    receipt_number: string;
    client_name: string;
    total: number;
    items_count: number;
    is_late: boolean;
}

@Component({
    selector: 'app-calendar-orders',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, ToastModule],
    providers: [MessageService],
    templateUrl: './calendar-orders.component.html',
    styleUrls: ['./calendar-orders.component.scss'],
})
export class CalendarOrdersComponent implements OnInit {

    orders = signal<CalendarEvent[]>([]);
    view = 'month';

    weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    hours = Array.from({ length: 24 }, (_, i) => i);

    // === SIGNALS ===
    currentDate = signal(new Date());
    selectedDate = signal<Date | null>(new Date());

    statusList = [
        { class: 'dot-pending', label: 'En attente' },
        { class: 'dot-processing', label: 'En cours' },
        { class: 'dot-ready', label: 'Prête' },
        { class: 'dot-delivered', label: 'Livrée' },
        { class: 'dot-cancelled', label: 'Annulée' }
    ];

    constructor(
        private orderService: OrderService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.selectedDate.set(new Date());
        this.loadOrders();
    }

    loadOrders() {
        const current = this.currentDate();
        const start = new Date(current.getFullYear(), current.getMonth(), 1);
        const end = new Date(current.getFullYear(), current.getMonth() + 1, 0);

        this.orderService.getCalendar({
            start_date: start.toISOString().split('T')[0],
            end_date: end.toISOString().split('T')[0],
        }).subscribe({
            next: (res: any) => {
                const events = res.data.map((order: any) => ({
                    id: order.id,
                    title: order.receipt_number,
                    date: new Date(order.promised_at),
                    type: order.status,
                    receipt_number: order.receipt_number,
                    client_name: order.client_name,
                    total: Number(order.total) || 0,
                    items_count: order.items_count || 0,
                    is_late: order.is_late || false
                }));

                this.orders.set(events);
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les commandes'
                });
            }
        });
    }

    currentPeriodLabel = computed(() => {
        const date = this.currentDate();
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    });

    monthDays = computed(() => {
        const current = this.currentDate();
        const year = current.getFullYear();
        const month = current.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let startOffset = firstDay.getDay() - 1;
        if (startOffset < 0) startOffset = 6;

        const days: any[] = [];

        // Jours du mois précédent
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startOffset - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevMonthLastDay - i);
            days.push({
                date,
                otherMonth: true,
                isToday: this.isToday(date),
                events: this.getEventsForDate(date)
            });
        }

        // Jours du mois courant
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            days.push({
                date,
                otherMonth: false,
                isToday: this.isToday(date),
                events: this.getEventsForDate(date)
            });
        }

        // Jours du mois suivant
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(year, month + 1, i);
            days.push({
                date,
                otherMonth: true,
                isToday: this.isToday(date),
                events: this.getEventsForDate(date)
            });
        }

        return days;
    });

    weekDays = computed(() => {
        const current = this.currentDate();
        const start = new Date(current);
        start.setDate(start.getDate() - start.getDay() + 1);   // Lundi

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            return {
                date,
                isToday: this.isToday(date),
                events: this.getEventsForDate(date)
            };
        });
    });

    selectedDateEvents = computed(() => {
        const date = this.selectedDate();
        if (!date) return [];

        return this.getEventsForDate(date)
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    });

    getEventsForDate(date: Date): CalendarEvent[] {
        return this.orders().filter(order =>
            order.date.toDateString() === date.toDateString()
        );
    }

    isToday(date: Date): boolean {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    // ==================== NAVIGATION ====================

    previousPeriod() {
        const current = this.currentDate();
        const newDate = new Date(current);

        if (this.view === 'month') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else if (this.view === 'week') {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setDate(newDate.getDate() - 1);
        }

        this.currentDate.set(newDate);
        this.loadOrders();
    }

    nextPeriod() {
        const current = this.currentDate();
        const newDate = new Date(current);

        if (this.view === 'month') {
            newDate.setMonth(newDate.getMonth() + 1);
        } else if (this.view === 'week') {
            newDate.setDate(newDate.getDate() + 7);
        } else {
            newDate.setDate(newDate.getDate() + 1);
        }

        this.currentDate.set(newDate);
        this.loadOrders();
    }

    goToToday() {
        const today = new Date();
        this.currentDate.set(today);
        this.selectedDate.set(today);
        this.loadOrders();
    }

    selectDate(date: Date) {
        this.selectedDate.set(date);

        if (this.view !== 'day') {
            this.view = 'day';
            this.currentDate.set(new Date(date));   // Important : utiliser .set()
        }
    }

    // ==================== UTILS ====================

    getEventTop(date: Date): string {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const totalMinutes = hours * 60 + minutes;
        return (totalMinutes / 1440 * 100) + '%';
    }

    getEventHeight(date: Date): string {
        return '100px';
    }

    setView(view: string) {
        this.view = view;
    }
}
