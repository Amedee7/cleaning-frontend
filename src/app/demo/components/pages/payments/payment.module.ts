import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentsComponent } from './payments.component';
import { PaymentRoutingModule } from './payment.routing';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [],
  imports: [
    CommonModule, PaymentRoutingModule, FormsModule,
  ]
})
export class PaymentModule { }