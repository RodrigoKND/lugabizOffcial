export interface GeoPosition {
  lat: number;
  lon: number;
}

export interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements: OverpassElement[];
}

export interface UserPosition {
  lat?: number;
  lon?: number;
}