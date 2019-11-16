export interface GeoPosition {
  longitude: number;
  latitude: number;
}

export interface UnitPositionModel {
  unitId: number;
  position: GeoPosition;
  direction: number;
  [property: string]: any;
}
