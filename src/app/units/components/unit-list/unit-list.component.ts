import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { UnitModel } from "./UnitModel";
import { UnitService } from "../../services/unit.service";
import { TranslatePipe } from "../../../core/translate/translate.pipe";

@Component({
  selector: "app-unit-list",
  templateUrl: "./unit-list.component.html",
  styleUrls: ["./unit-list.component.scss"],
  providers: [TranslatePipe]
})
export class UnitListComponent implements OnInit {
  unitsToDisplay$: Observable<UnitModel[]>;

  constructor(private unitService: UnitService) {}

  ngOnInit() {
    this.unitsToDisplay$ = this.unitService.unitsToDisplay$;
  }

  trackByFn(index, unit: UnitModel) {
    return unit.unitId;
  }
}
