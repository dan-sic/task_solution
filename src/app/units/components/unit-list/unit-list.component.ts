import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { UnitModel } from "./UnitModel";
import { UnitService } from "../../services/unit.service";
import { TranslatePipe } from "../../../core/translate/translate.pipe";
import { MapRoutesService } from "src/app/home/services/map-routes.service";

@Component({
  selector: "app-unit-list",
  templateUrl: "./unit-list.component.html",
  styleUrls: ["./unit-list.component.scss"],
  providers: [TranslatePipe]
})
export class UnitListComponent implements OnInit {
  unitsToDisplay$: Observable<UnitModel[]>;

  constructor(
    private unitService: UnitService,
    private mapRoutesService: MapRoutesService
  ) {}

  ngOnInit() {
    this.unitsToDisplay$ = this.unitService.unitsToDisplay$;
  }

  trackByFn(index, unit: UnitModel) {
    return unit.unitId;
  }

  onUnitCardSelect(unitId: number) {
    this.mapRoutesService.selectUnitRoute(unitId);
  }

  onMouseOverCard(unitId: number) {
    this.mapRoutesService.hoverOverUnitRouteCard(unitId);
  }

  onMouseOutCard() {
    this.mapRoutesService.hoverOutUnitRouteCard();
  }
}
