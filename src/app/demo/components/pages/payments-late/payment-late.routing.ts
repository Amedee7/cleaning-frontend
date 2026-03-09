import { Routes } from '@angular/router';
import { PaymentsLateComponent } from './payments-late.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

export const paymentsLateRoutes: Routes = [
  { path: '', component: PaymentsLateComponent },
];

@NgModule({
  imports: [RouterModule.forChild(paymentsLateRoutes)],
  exports: [RouterModule]
})
export class PaymentsLateRoutingModule { }

