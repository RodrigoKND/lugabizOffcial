import { useState, useCallback, useRef } from 'react';
import { DEFAULT_CENTER, COORD_THRESHOLD, MAP } from '@constants/coords';
import type { MapRef } from '@presentation/components/ui/map';

interface CoordPickerState {
  coords: [number, number];
  skipFly: boolean;
}

export function useCoordPicker(
  initialCoords: number[],
  onCoordsChange: (lat: number, lng: number) => void,
) {
  const mapRef = useRef<MapRef>(null);
  const [state, setState] = useState<CoordPickerState>({
    coords: initialCoords.length === 2
      ? [initialCoords[1], initialCoords[0]]
      : [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
    skipFly: false,
  });

  const updateCoords = useCallback((lng: number, lat: number) => {
    setState({ coords: [lng, lat], skipFly: true });
    onCoordsChange(lat, lng);
  }, [onCoordsChange]);

  const handleMapClick = useCallback((e: { lngLat: { lng: number; lat: number } }) => {
    updateCoords(e.lngLat.lng, e.lngLat.lat);
  }, [updateCoords]);

  const handleDragEnd = useCallback((lngLat: { lng: number; lat: number }) => {
    updateCoords(lngLat.lng, lngLat.lat);
  }, [updateCoords]);

  const handleLocate = useCallback(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setState({ coords: [longitude, latitude], skipFly: true });
      mapRef.current?.flyTo({ center: [longitude, latitude], zoom: MAP.FLY_ZOOM, duration: MAP.LOCATE_FLY_DURATION });
      onCoordsChange(latitude, longitude);
    });
  }, [onCoordsChange]);

  const externalUpdate = useCallback((newCoords: number[]) => {
    if (newCoords.length !== 2) return;
    const [lat, lng] = newCoords;
    setState(prev => {
      if (prev.skipFly) return { ...prev, skipFly: false };
      const sameCoords = Math.abs(prev.coords[0] - lng) < COORD_THRESHOLD && Math.abs(prev.coords[1] - lat) < COORD_THRESHOLD;
      if (sameCoords) return prev;
      mapRef.current?.flyTo({ center: [lng, lat], zoom: MAP.FLY_ZOOM, duration: MAP.FLY_DURATION });
      return { coords: [lng, lat], skipFly: false };
    });
  }, []);

  return {
    mapRef,
    coords: state.coords,
    handleMapClick,
    handleDragEnd,
    handleLocate,
    externalUpdate,
  };
}
