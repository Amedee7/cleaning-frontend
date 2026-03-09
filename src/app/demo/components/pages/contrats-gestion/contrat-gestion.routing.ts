import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {ContratsGestionComponent} from "./contrats-gestion.component";

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: ContratsGestionComponent }
    ])],
    exports: [RouterModule]
})
export class ContratGestionRoutingModule { }
