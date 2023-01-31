export interface Dimension {
  width: number;
  height: number;
}
export interface Position {
  x: number;
  y: number;
}
export interface Pagination {
  page: number;
  pageSize: number;
  totalPage: number;
  totalSize: number;
}

export interface CellLayout {
  width: number;
  height: number;
  x: number;
  y: number;
  quality: number;
}
export interface MediaDevice {
  label: string;
  deviceId: string;
}
export interface FearureSwitch {
  toggled: boolean;
  enabled: boolean;
}
export interface AdvancedFeatureSwitch {
  adjustVolumn: FearureSwitch;
  farEndCameraControl: FearureSwitch;
}
