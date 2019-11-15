import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../shared/shared.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { FormsModule } from "@angular/forms";
import { UnitListComponent } from "./components/unit-list/unit-list.component";

@NgModule({
  declarations: [UnitListComponent],
  imports: [CommonModule, SharedModule, NgSelectModule, FormsModule],
  exports: [UnitListComponent]
})
export class UnitsModule {}
