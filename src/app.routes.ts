import {Routes} from '@angular/router';
import {authGuard} from './app/core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./app/shared/components/shell/shell.component')
            .then(m => m.ShellComponent),
        canActivate: [authGuard],
        children: [
            // Dashboard pressing (remplace le dashboard nettoyage)
            {
                path: 'dashboard',
                loadComponent: () => import('./app/modules/dashboard/components/dashboard/dashboard.component')
                    .then(m => m.PressingDashboardComponent),
            },

            // Commandes / Réceptions
            {
                path: 'orders/calendar',
                loadComponent: () => import('./app/modules/orders/components/calendar-orders/calendar-orders.component')
                    .then(m => m.CalendarOrdersComponent)
            },

            {
                path: 'orders',
                loadComponent: () => import('./app/modules/orders/components/list/order-list/order-list.component')
                    .then(m => m.OrderListComponent),
            },

            {
                path: 'orders/new',
                loadComponent: () => import('./app/modules/orders/components/reception/order-reception/order-reception.component')
                    .then(m => m.OrderReceptionComponent),
            },
            {
                path: 'orders/:id',
                loadComponent: () => import('./app/modules/orders/components/detail/order-detail/order-detail.component')
                    .then(m => m.OrderDetailComponent),
            },


            // Articles
            {
                path: 'articles',
                loadComponent: () => import('./app/modules/articles/components/list//article-list/article-list.component')
                    .then(m => m.ArticleListComponent),
            },
            {
                path: 'articles/new',
                loadComponent: () => import('./app/modules/articles/components/form/article-form/article-form.component')
                    .then(m => m.ArticleFormComponent),
            },
            {
                path: 'articles/:id/edit',
                loadComponent: () => import('./app/modules/articles/components/form/article-form/article-form.component')
                    .then(m => m.ArticleFormComponent),
            },

            {
                path: 'clients/groupes-tarifaires-list',
                loadComponent: () => import('./app/modules/clients/components/groupes-tarifaires-list/groupes-tarifaires-list.component')
                    .then(m => m.GroupesTarifairesListComponent)
            },

            // Clients
            {
                path: 'clients',
                loadComponent: () => import('./app/modules/clients/components/list/client-list/client-list.component')
                    .then(m => m.ClientListComponent),
            },
            {
                path: 'clients/new',
                loadComponent: () => import('./app/modules/clients/components/form//client-form/client-form.component')
                    .then(m => m.ClientFormComponent),
            },
            {
                path: 'clients/:id/edit',
                loadComponent: () => import('./app/modules/clients/components/form/client-form/client-form.component')
                    .then(m => m.ClientFormComponent),
            },

            // Rapports
            {
                path: 'reports',
                loadComponent: () => import('./app/modules/reports/components/list/report-list/report-list.component')
                    .then(m => m.ReportListComponent),
            },

            // Paramètres
            {
                path: 'settings',
                loadComponent: () => import('./app/modules/settings/settings/settings.component')
                    .then(m => m.SettingsComponent),
            },

            // Utilisateurs & Habilitations
            {
                path: 'users',
                loadComponent: () =>
                    import('./app/modules/users/components/user-list/user-list.component')
                        .then(m => m.UserListComponent),
            },
            {
                path: 'users/new',
                loadComponent: () =>
                    import('./app/modules/users/components/user-form/user-form.component')
                        .then(m => m.UserFormComponent),
            },
            {
                path: 'users/:id/edit',
                loadComponent: () =>
                    import('./app/modules/users/components/user-form/user-form.component')
                        .then(m => m.UserFormComponent),
            },
            {
                path: 'users/:id/permissions',
                loadComponent: () =>
                    import('./app/modules/users/components/user-permissions/user-permissions.component')
                        .then(m => m.UserPermissionsComponent),
            },

            {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
        ],
    },
    {
        path: 'login',
        loadComponent: () => import('./app/modules/auth/components/login/login.component')
            .then(m => m.LoginComponent),
    },
];
