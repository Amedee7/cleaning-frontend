import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantRoutingModule } from './tenant.routing';

@NgModule({
    declarations: [],
    imports: [
        CommonModule, TenantRoutingModule, FormsModule,
    ]
})
export class TenantModule { }
