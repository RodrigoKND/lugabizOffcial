import * as h3 from 'h3-js';

const RESOLUTION = 9;

export function latLngToCell(lat: number, lng: number): string {
  return h3.latLngToCell(lat, lng, RESOLUTION);
}

export function cellsToMultiPolygon(cells: string[]): number[][][] {
  return h3.cellsToMultiPolygon(cells, true);
}

export function getAdjacentCells(hex: string): string[] {
  return h3.gridRing(hex, 1);
}

export function getNearbyCells(lat: number, lng: number, radiusKm: number = 1): string[] {
  const origin = latLngToCell(lat, lng);
  // H3 res 9: ~300 m between cell centers → ~0.3 km per ring step
  const ringK = Math.max(1, Math.round(radiusKm / 0.3));
  const cells = new Set<string>();
  cells.add(origin);
  try {
    for (let k = 1; k <= ringK; k++) {
      const ring = h3.gridRing(origin, k);
      ring.forEach(c => cells.add(c));
    }
  } catch {
    cells.add(origin);
  }
  return Array.from(cells);
}

export function areCellsNearby(cellA: string, cellB: string, maxDistKm: number = 1): boolean {
  const dist = h3.gridDistance(cellA, cellB);
  if (dist === -1) return false;
  return dist * 0.3 <= maxDistKm;
}
