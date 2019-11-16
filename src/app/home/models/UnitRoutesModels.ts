import { GeoPosition } from "./UnitPositionModels";

export interface UnitRouteModel {
  unitId: number;
  points: GeoPosition[];
}
