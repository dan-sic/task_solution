import { Injectable } from "@angular/core";
import { ApiJSONService } from "src/app/core/api/api-json.service";
import { UnitPositionModel } from "../models/UnitPositionModels";
import { Observable } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { PositionService } from "./position.service";
import { Utils } from "../../shared/utils";

@Injectable({
  providedIn: "root"
})
export class MapUnitsService {
  // Keeping reference to last featureCollection
  //  to avoid situation, where SignalR hub returns <5 results, and units
  // temporarily disappear from the map
  private _latestUnitFeatureCollection: GeoJSON.FeatureCollection<
    GeoJSON.Point
  >;

  private readonly utils: Utils;

  constructor(
    private readonly apiJSONService: ApiJSONService,
    private readonly positionService: PositionService
  ) {
    this.utils = new Utils();
  }

  getInitialUnitFeatureCollection(): Observable<
    GeoJSON.FeatureCollection<GeoJSON.Point>
  > {
    return this.apiJSONService.getUnitPositions().pipe(
      map((units: UnitPositionModel[]) => {
        this._latestUnitFeatureCollection = {
          type: "FeatureCollection",
          features: units.map(this.createUnitFeature)
        };
        return this._latestUnitFeatureCollection;
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
        unitId: unit.unitId,
        direction: unit.direction
      }
    };
  }

  getUnitFeaturesUpdate(): Observable<
    GeoJSON.FeatureCollection<GeoJSON.Point>
  > {
    return this.positionService.signalRHubHubPositions$.pipe(
      mergeMap(this.utils.checkForHubConnectionError),
      map(this.utils.convertToObjectOfUnits),
      map(unitPositionObject => {
        this._latestUnitFeatureCollection = this.generateUnitFeatureCollection(
          unitPositionObject
        );
        return this._latestUnitFeatureCollection;
      })
    );
  }

  private generateUnitFeatureCollection(unitPositionObject: {
    [key: number]: UnitPositionModel;
  }): GeoJSON.FeatureCollection<GeoJSON.Point> {
    return {
      type: "FeatureCollection",
      features: this._latestUnitFeatureCollection.features.map(feature => {
        if (unitPositionObject[feature.properties.unitId]) {
          const currentUnitPositionObject =
            unitPositionObject[feature.properties.unitId];
          return this.createUnitFeature(currentUnitPositionObject);
        } else {
          return feature;
        }
      })
    };
  }
}
