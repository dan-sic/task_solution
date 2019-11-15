import { Injectable } from "@angular/core";
import { ApiJSONService } from "src/app/core/api/api-json.service";
import { UnitPositionModel } from "../models/UnitPositionModels";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { PositionService } from "./position.service";

@Injectable({
  providedIn: "root"
})
export class MapServiceCustom {
  // Keeping reference to last featureCollection
  //  to avoid situation, where SignalR hub returns <5 results, and units
  // temporarily disappear from the map
  private _latestUnitFeatureCollection: GeoJSON.FeatureCollection<
    GeoJSON.Point
  >;

  constructor(
    private readonly apiJSONService: ApiJSONService,
    private readonly positionService: PositionService
  ) {}

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
        id: unit.unitId,
        direction: unit.direction
      }
    };
  }

  getUnitFeaturesUpdate(): Observable<
    GeoJSON.FeatureCollection<GeoJSON.Point>
  > {
    let unitIds: number[] = [];

    return this.positionService.signalRHubHubPositions$.pipe(
      tap(units => this.keepReferenceToCurrentUnitIds(units, unitIds)),
      map(this.convertToObjectOfUnits),
      map(unitPositionObject => {
        this._latestUnitFeatureCollection = this.generateFeatureCollection(
          unitPositionObject,
          unitIds
        );
        return this._latestUnitFeatureCollection;
      })
    );
  }

  private generateFeatureCollection(
    unitPositionObject: { [key: number]: UnitPositionModel },
    unitIds: number[]
  ): GeoJSON.FeatureCollection<GeoJSON.Point> {
    return {
      type: "FeatureCollection",
      features: this._latestUnitFeatureCollection.features.map(feature => {
        const isUnitPresentInSignalRPayload = unitIds.includes(
          feature.properties.id
        );

        if (isUnitPresentInSignalRPayload) {
          const currentUnitPositionObject =
            unitPositionObject[feature.properties.id];
          return this.createUnitFeature(currentUnitPositionObject);
        } else {
          return feature;
        }
      })
    };
  }

  private keepReferenceToCurrentUnitIds(
    units: UnitPositionModel[],
    unitIds: number[]
  ) {
    units.forEach(unit => {
      unitIds.push(unit.unitId);
    });
  }

  private convertToObjectOfUnits(
    units: UnitPositionModel[]
  ): { [key: number]: UnitPositionModel } {
    return units.reduce((obj, unit) => {
      obj[unit.unitId] = unit;
      return obj;
    }, {});
  }
}
