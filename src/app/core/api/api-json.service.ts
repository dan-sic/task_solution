import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  UnitModel,
  UnitModelApiResponse
} from "src/app/units/components/unit-list/UnitModel";
import { map } from "rxjs/operators";
import { UnitPositionModel } from "src/app/home/models/UnitPositionModels";
import { UnitRouteModel } from "src/app/home/models/UnitRoutesModels";

@Injectable({
  providedIn: "root"
})
export class ApiJSONService {
  constructor(private readonly http: HttpClient) {}

  public getUnits(): Observable<UnitModel[]> {
    return this.http
      .get<UnitModelApiResponse>("assets/JSONdata/GetUnits.json")
      .pipe(
        map(res => {
          return res.data.items;
        })
      );
  }

  public getUnitPositions(): Observable<UnitPositionModel[]> {
    return this.http.get<UnitPositionModel[]>(
      "assets/JSONdata/GetPositions.json"
    );
  }

  public getUnitRoutes(): Observable<UnitRouteModel[]> {
    return this.http.get<UnitRouteModel[]>(
      "assets/JSONdata/GetPlannedRoutes.json"
    );
  }
}
