import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        {path: 'owners', loadChildren: () => import('./owners/owner.module').then(m => m.OwnerModule) },
        {path: 'tenants', loadChildren: () => import('./tenants/tenant.module').then(m => m.TenantModule) },
        {path: 'plots', loadChildren: () => import('./plots/plot.module').then(m => m.PlotModule) },
        {path: 'houses', loadChildren: () => import('./houses/house.module').then(m => m.HouseModule) },
        {path: 'contracts', loadChildren: () => import('./contracts/contract.module').then(m => m.ContractModule) },
        {path: 'payments', loadChildren: () => import('./payments/payment.module').then(m => m.PaymentModule) },
        {path: 'payments-late', loadChildren: () => import('./payments-late/payment-late.module').then(m => m.PaymentsLateModule) },
        {path: 'users-management', loadChildren: () => import('./users-management/users-management.module').then(m => m.UsersManagementModule) },
        {path: 'contrats-gestion', loadChildren: () => import('./contrats-gestion/contrat-gestion.module').then(m => m.ContratsGestionModule) },


        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
