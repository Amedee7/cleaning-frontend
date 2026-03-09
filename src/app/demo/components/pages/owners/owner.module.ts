import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OwnerRoutingModule} from "./owner.routing";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [],
  imports: [
    CommonModule, OwnerRoutingModule, FormsModule,
  ]
})
export class OwnerModule { }
