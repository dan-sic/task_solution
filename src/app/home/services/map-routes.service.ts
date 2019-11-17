import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class MapRoutesService {
  private _selectedUnitRoute = new Subject<number>();
  selectedUnitRoute$ = this._selectedUnitRoute.asObservable();

  private _hoveredUnitRoute = new Subject<number>();
  hoveredUnitRoute$ = this._hoveredUnitRoute.asObservable();

  constructor() {}

  selectUnitRoute(unitId: number) {
    this._selectedUnitRoute.next(unitId);
  }

  hoverOverUnitRouteCard(unitId: number) {
    this._hoveredUnitRoute.next(unitId);
  }

  hoverOutUnitRouteCard() {
    this._hoveredUnitRoute.next(null);
  }
}
