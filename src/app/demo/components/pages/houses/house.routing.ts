import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {HousesComponent} from "./houses.component";

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: HousesComponent }
    ])],
    exports: [RouterModule]
})
export class HouseRoutingModule { }
