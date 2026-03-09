import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {OwnersComponent} from "./owners.component";

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: OwnersComponent }
    ])],
    exports: [RouterModule]
})
export class OwnerRoutingModule { }
