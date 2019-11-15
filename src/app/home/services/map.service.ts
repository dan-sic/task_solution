import { Injectable } from "@angular/core";
import { ApiJSONService } from "src/app/core/api/api-json.service";
import { UnitPositionModel } from "../models/UnitPositionModels";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class MapServiceCustom {
  constructor(private readonly apiJSONService: ApiJSONService) {}

  getUnitFeatures(): Observable<GeoJSON.Feature<GeoJSON.Point>[]> {
    return this.apiJSONService.getUnitPositions().pipe(
      map(units => {
        return units.map(this.createUnitFeature);
      })
    );
  }

  private createUnitFeature(
    unit: UnitPositionModel
  ): GeoJSON.Feature<GeoJSON.Point> {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [unit.position.longitude, unit.position.latitude]
      },
      properties: {
        id: unit.unitId,
        direction: unit.direction
      }
    };
  }
}
