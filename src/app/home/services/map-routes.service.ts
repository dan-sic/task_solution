import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class MapRoutesService {
  private _selectedUnitRoute = new Subject<number>();
  selectedUnitRoute$ = this._selectedUnitRoute.asObservable();

  constructor() {}

  selectUnitRoute(unitId: number) {
    this._selectedUnitRoute.next(unitId);
  }
}
