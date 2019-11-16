import { GeoPosition } from "./UnitPositionModels";
import { LngLatLike, LngLatBounds } from "mapbox-gl";

export interface UnitRouteModel {
  unitId: number;
  points: GeoPosition[];
}

export interface UnitRouteModelCoords {
  unitId: number;
  points: LngLatLike[];
}

export interface UnitRouteMapBoundaries {
  [key: number]: LngLatBounds;
}
