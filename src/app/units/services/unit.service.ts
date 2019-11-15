import { Injectable } from "@angular/core";
import { UnitModel } from "../components/unit-list/UnitModel";
import { Subject, Observable } from "rxjs";
import { ApiJSONService } from "src/app/core/api/api-json.service";
import { take } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class UnitService {
  private _allUnits: UnitModel[];
  private _unitsToDisplay: Subject<UnitModel[]> = new Subject();

  public unitsToDisplay$: Observable<
    UnitModel[]
  > = this._unitsToDisplay.asObservable();

  constructor(private apiService: ApiJSONService) {
    this.apiService
      .getUnits()
      .pipe(take(1))
      .subscribe(units => {
        this._allUnits = units;
        this._unitsToDisplay.next(this._allUnits);
      });
  }
}
