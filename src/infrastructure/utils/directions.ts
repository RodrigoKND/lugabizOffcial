// Enlace para llegar a un punto. Sin coordenadas reales (ausentes, NaN o 0,0) no hay enlace: el botón no debe mostrarse.
export function directionsUrl(lat?: number, lng?: number): string | null {
  if (lat === undefined || lng === undefined) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
