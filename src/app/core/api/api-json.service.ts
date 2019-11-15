import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  UnitModel,
  UnitModelApiResponse
} from "src/app/units/components/unit-list/UnitModel";
import { map } from "rxjs/operators";

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
}
