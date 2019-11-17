import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { ApiJSONService } from "src/app/core/api/api-json.service";
import {
  UnitRouteMapBoundaries,
  UnitRouteModel,
  UnitRouteModelCoords
} from "../models/UnitRoutesModels";
import { map, withLatestFrom } from "rxjs/operators";
import { LngLatLike, LngLatBounds } from "mapbox-gl";
import { UnitModel } from "src/app/units/components/unit-list/UnitModel";
import { Utils } from "../../shared/utils";

@Injectable({
  providedIn: "root"
})
export class MapRoutesService {
  private readonly ROUTE_COLOR = "#F7455D";
  private readonly utils: Utils;

  private readonly _selectedUnitRoute = new Subject<number>();
  selectedUnitRoute$ = this._selectedUnitRoute.asObservable();

  private readonly _hoveredUnitRoute = new Subject<number>();
  hoveredUnitRoute$ = this._hoveredUnitRoute.asObservable();

  constructor(private readonly apiJSONService: ApiJSONService) {
    this.utils = new Utils();
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

  selectUnitRoute(unitId: number) {
    this._selectedUnitRoute.next(unitId);
  }

  hoverOverUnitRouteCard(unitId: number) {
    this._hoveredUnitRoute.next(unitId);
  }

  hoverOutUnitRouteCard() {
    this._hoveredUnitRoute.next(null);
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
      const objectOfUnits = this.utils.convertToObjectOfUnits(units);
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
}
