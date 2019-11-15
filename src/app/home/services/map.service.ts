import { Injectable } from "@angular/core";
import { ApiJSONService } from "src/app/core/api/api-json.service";
import { UnitPositionModel } from "../models/UnitPositionModels";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { PositionService } from "./position.service";

type longitude = number;
type latitude = number;
type coordinates = [longitude, latitude];

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

  private _tailCoordinates: { [key: number]: coordinates[] } = {};
  private readonly UNIT_TAIL_LENGTH = 4;
  private readonly TAIL_COLOR = "#80cf93";

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
      tap(units => {
        this.keepReferenceToCurrentUnitIds(units, unitIds);
      }),
      map(this.convertToObjectOfUnits),
      map(unitPositionObject => {
        this._latestUnitFeatureCollection = this.generateUnitFeatureCollection(
          unitPositionObject,
          unitIds
        );
        return this._latestUnitFeatureCollection;
      })
    );
  }

  getUnitTailFeaturesUpdate(): Observable<
    GeoJSON.FeatureCollection<GeoJSON.LineString>
  > {
    return this.positionService.signalRHubHubPositions$.pipe(
      tap(units => this.updateUnitTailCoords(units)),
      map(units => {
        return this.generateUnitTailFeatureCollection();
      })
    );
  }

  private updateUnitTailCoords(units: UnitPositionModel[]): void {
    for (let unit of units) {
      const { unitId } = unit;
      const { longitude, latitude } = unit.position;
      const isNotUnitTailPositionRegistered = !this._tailCoordinates[unitId];

      if (isNotUnitTailPositionRegistered) {
        this._tailCoordinates[unitId] = [
          [longitude, latitude],
          [longitude, latitude]
        ];
        continue;
      }
      const currentUnitTailCoords = this._tailCoordinates[unitId];
      const newUnitTailCoordinates = [
        [longitude, latitude],
        ...currentUnitTailCoords
      ];

      if (newUnitTailCoordinates.length > this.UNIT_TAIL_LENGTH) {
        newUnitTailCoordinates.pop();
      }

      this._tailCoordinates[unitId] = newUnitTailCoordinates as [
        number,
        number
      ][];
    }
  }

  private generateUnitTailFeatureCollection(): GeoJSON.FeatureCollection<
    GeoJSON.LineString
  > {
    const features = [];

    for (let unitId in this._tailCoordinates) {
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: this._tailCoordinates[unitId]
        },
        properties: {
          color: this.TAIL_COLOR
        }
      });
    }

    return {
      type: "FeatureCollection",
      features
    };
  }

  private generateUnitFeatureCollection(
    unitPositionObject: { [key: number]: UnitPositionModel },
    unitIds: number[]
  ): GeoJSON.FeatureCollection<GeoJSON.Point> {
    console.log("LatestUnitFeatureCOllection");
    console.log(this._latestUnitFeatureCollection);
    console.log("UnitPositionObject:");
    console.log(unitPositionObject);
    return {
      type: "FeatureCollection",
      features: this._latestUnitFeatureCollection.features.map(feature => {
        console.log();
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
