import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './app/core/guards/auth.guard';

export const routes: Routes = [
    // ── Auth ──────────────────────────────────────────────────────────────────
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./app/modules/auth/components/login/login.component').then(
                (m) => m.LoginComponent,
            ),
    },

    // ── App Shell ─────────────────────────────────────────────────────────────
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./app/shared/components/shell/shell.component').then(
                (m) => m.ShellComponent,
            ),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./app/modules/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
            },

            // Clients
            {
                path: 'clients',
                loadComponent: () =>
                    import('./app/modules/clients/components/list/client-list/client-list.component').then(
                        (m) => m.ClientListComponent,
                    ),
            },
            {
                path: 'clients/new',
                loadComponent: () =>
                    import('./app/modules/clients/components/form/client-form/client-form.component').then(
                        (m) => m.ClientFormComponent,
                    ),
            },
            {
                path: 'clients/:id/edit',
                loadComponent: () =>
                    import('./app/modules/clients/components/form/client-form/client-form.component').then(
                        (m) => m.ClientFormComponent,
                    ),
            },

            // Properties
            {
                path: 'properties',
                loadComponent: () =>
                    import('./app/modules/properties/components/list/property-list/property-list.component').then(
                        (m) => m.PropertyListComponent,
                    ),
            },
            {
                path: 'properties/new',
                loadComponent: () =>
                    import('./app/modules/properties/components/form/property-form/property-form.component').then(
                        (m) => m.PropertyFormComponent,
                    ),
            },

            // Schedules
            {
                path: 'schedules',
                loadComponent: () =>
                    import('./app/modules/schedules/components/form/schedule-form/schedule-form.component').then(
                        (m) => m.ScheduleFormComponent,
                    ),
            },
            {
                path: 'schedules/new',
                loadComponent: () =>
                    import('./app/modules/schedules/components/form/schedule-form/schedule-form.component').then(
                        (m) => m.ScheduleFormComponent,
                    ),
            },
            {
                path: 'schedules/:id',
                loadComponent: () =>
                    import('./app/modules/schedules/components/form/schedule-form/schedule-form.component').then(
                        (m) => m.ScheduleFormComponent,
                    ),
            },

            // Staff
            {
                path: 'staff',
                loadComponent: () =>
                    import('./app/modules/staff/components/list/staff-list/staff-list.component').then(
                        (m) => m.StaffListComponent,
                    ),
            },
            {
                path: 'staff/new',
                loadComponent: () =>
                    import('./app/modules/staff/components/form/staff-form/staff-form.component').then(
                        (m) => m.StaffFormComponent,
                    ),
            },

            // Reports
            {
                path: 'reports',
                loadComponent: () =>
                    import('./app/modules/reports/components/list/report-list/report-list.component').then(
                        (m) => m.ReportListComponent,
                    ),
            },

            // Invoices
            {
                path: 'invoices',
                loadComponent: () =>
                    import('./app/modules/invoices/components/list/invoice-list/invoice-list.component').then(
                        (m) => m.InvoiceListComponent,
                    ),
            },
            {
                path: 'invoices/new',
                loadComponent: () =>
                    import('./app/modules/invoices/components/form/invoice-form/invoice-form.component').then(
                        (m) => m.InvoiceFormComponent,
                    ),
            },

            // Incidents
            {
                path: 'incidents',
                loadComponent: () =>
                    import('./app/modules/incidents/components/incident-list/incident-list.component').then(
                        (m) => m.IncidentListComponent,
                    ),
            },
        ],
    },

    { path: '**', redirectTo: 'dashboard' },
];
