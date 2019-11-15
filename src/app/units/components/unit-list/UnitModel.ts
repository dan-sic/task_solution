export interface UnitModelApiResponse {
  status: string;
  token: string;
  data: {
    items: UnitModel[];
    totalFiltredRecords: number;
  };
}

export interface UnitTag {
  tag: string;
  value: string;
}

export interface UnitModel {
  unitId: number;
  unitTag: UnitTag[];
}
