import { Injectable } from "@angular/core";
import { ApiJSONService } from "src/app/core/api/api-json.service";
import { PositionService } from "./position.service";
import { Observable } from "rxjs";
import { mergeMap, tap, map } from "rxjs/operators";
import { UnitPositionModel } from "../models/UnitPositionModels";
import { Utils } from "src/app/shared/utils";

type longitude = number;
type latitude = number;
type coordinates = [longitude, latitude];

@Injectable({
  providedIn: "root"
})
export class MapTailsService {
  private readonly UNIT_TAIL_LENGTH = 4;
  private readonly TAIL_COLOR = "#80cf93";
  private readonly utils: Utils;

  private readonly _tailCoordinates: { [key: number]: coordinates[] } = {};

  constructor(private readonly positionService: PositionService) {
    this.utils = new Utils();
  }

  getUnitTailFeaturesUpdate(): Observable<
    GeoJSON.FeatureCollection<GeoJSON.LineString>
  > {
    return this.positionService.signalRHubHubPositions$.pipe(
      mergeMap(this.utils.checkForHubConnectionError),
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
          unitId: Number(unitId),
          color: this.TAIL_COLOR
        }
      });
    }

    return {
      type: "FeatureCollection",
      features
    };
  }
}
