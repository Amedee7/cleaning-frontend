import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {PlotsComponent} from "./plots.component";

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: PlotsComponent }
    ])],
    exports: [RouterModule]
})
export class PlotRoutingModule { }
