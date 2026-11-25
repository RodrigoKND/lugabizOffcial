import { describe, it, expect } from 'vitest';
import { directionsUrl } from '@/infrastructure/utils/directions';

describe('directionsUrl', () => {
  it('arma el enlace de ruta de Google Maps con latitud y longitud', () => {
    expect(directionsUrl(-17.3935, -66.157)).toBe('https://www.google.com/maps/dir/?api=1&destination=-17.3935,-66.157');
  });

  it('sin coordenadas válidas devuelve null', () => {
    expect(directionsUrl(undefined, -66.1)).toBeNull();
    expect(directionsUrl(-17.3, undefined)).toBeNull();
    expect(directionsUrl(0, 0)).toBeNull();
    expect(directionsUrl(NaN, -66.1)).toBeNull();
  });
});
