import { Injectable } from "@angular/core";
import { ApiJSONService } from "src/app/core/api/api-json.service";
import { UnitPositionModel } from "../models/UnitPositionModels";
import { Observable } from "rxjs";
import { map, tap, withLatestFrom } from "rxjs/operators";
import { PositionService } from "./position.service";
import {
  UnitRouteModel,
  UnitRouteModelCoords,
  UnitRouteMapBoundaries
} from "../models/UnitRoutesModels";
import { UnitModel } from "src/app/units/components/unit-list/UnitModel";
import { LngLatBounds, LngLatLike } from "mapbox-gl";

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
  private readonly ROUTE_COLOR = "#F7455D";

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
        unitId: unit.unitId,
        direction: unit.direction
      }
    };
  }

  getUnitFeaturesUpdate(): Observable<
    GeoJSON.FeatureCollection<GeoJSON.Point>
  > {
    return this.positionService.signalRHubHubPositions$.pipe(
      map(this.convertToObjectOfUnits),
      map(unitPositionObject => {
        this._latestUnitFeatureCollection = this.generateUnitFeatureCollection(
          unitPositionObject
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

  getUnitRoutesMapBoundaries(): Observable<UnitRouteMapBoundaries> {
    return this.apiJSONService
      .getUnitRoutes()
      .pipe(
        map(this.convertGeoPositionToLngLatLike),
        map(this.generateMapBoundaries)
      );
  }

  getUnitRoutesFeatureCollection(): Observable<
    GeoJSON.FeatureCollection<GeoJSON.LineString>
  > {
    return this.apiJSONService.getUnitRoutes().pipe(
      withLatestFrom(this.apiJSONService.getUnits()),
      map(([routes, units]) => {
        return this.generateUnitRoutesFeature(routes, units);
      })
    );
  }

  private convertGeoPositionToLngLatLike(
    routes: UnitRouteModel[]
  ): UnitRouteModelCoords[] {
    return routes.map(route => {
      return {
        ...route,
        points: route.points.map(
          point => [point.longitude, point.latitude] as LngLatLike
        )
      };
    });
  }

  private generateUnitRoutesFeature(
    routes: UnitRouteModel[],
    units: UnitModel[]
  ): GeoJSON.FeatureCollection<GeoJSON.LineString> {
    const routeFeatures = routes.map(route => {
      const objectOfUnits = this.convertToObjectOfUnits(units);
      const unitName = objectOfUnits[route.unitId].unitTag[0].value;
      const unitSerial = objectOfUnits[route.unitId].unitTag[1].value;

      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: route.points.map(
            point => [point.longitude, point.latitude] as LngLatLike
          )
        },
        properties: {
          color: this.ROUTE_COLOR,
          unitId: route.unitId,
          unitName,
          unitSerial
        }
      };
    });

    return {
      type: "FeatureCollection",
      features: <GeoJSON.Feature<GeoJSON.LineString>[]>routeFeatures
    };
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

  private generateUnitFeatureCollection(unitPositionObject: {
    [key: number]: UnitPositionModel;
  }): GeoJSON.FeatureCollection<GeoJSON.Point> {
    return {
      type: "FeatureCollection",
      features: this._latestUnitFeatureCollection.features.map(feature => {
        if (unitPositionObject[feature.properties.id]) {
          const currentUnitPositionObject =
            unitPositionObject[feature.properties.id];
          return this.createUnitFeature(currentUnitPositionObject);
        } else {
          return feature;
        }
      })
    };
  }

  private generateMapBoundaries(routes: UnitRouteModelCoords[]) {
    const routesMapBoundaries: UnitRouteMapBoundaries = {};

    routes.forEach(route => {
      const initialCoords = route.points[0];

      routesMapBoundaries[route.unitId] = route.points.reduce(
        (bounds, coord) => {
          return bounds.extend(<any>coord);
        },
        new LngLatBounds(initialCoords, initialCoords)
      );
    });

    return routesMapBoundaries;
  }

  private convertToObjectOfUnits<T extends { unitId: number }>(
    units: T[]
  ): { [key: number]: T } {
    return units.reduce((obj, unit) => {
      obj[unit.unitId] = unit;
      return obj;
    }, {});
  }
}
