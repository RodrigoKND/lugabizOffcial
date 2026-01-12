import { useEffect, useState, useRef, useCallback } from 'react';

export interface GeoPosition {
  lat: number;
  lon: number;
}

export const useGeolocation = () => {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const hasStarted = useRef(false);

  // Mapeo de errores
  const ERROR_MESSAGES: Record<number, string> = {
    1: 'Permiso de ubicación denegado. Por favor, habilita los permisos en tu navegador.',
    2: 'Ubicación no disponible. Verifica tu conexión GPS o red.',
    3: 'Tiempo de espera agotado. Intenta nuevamente.',
  };

  const handleSuccess = useCallback((geoPosition: GeolocationPosition) => {
    const newPosition = {
      lat: geoPosition.coords.latitude,
      lon: geoPosition.coords.longitude,
    };
    
    setPosition(newPosition);
    setLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    const errorMessage = ERROR_MESSAGES[err.code] || err.message || 'Error desconocido al obtener ubicación';
    
    setError(errorMessage);
    setLoading(false);
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      setLoading(false);
      return;
    }

    // Si ya hay un watch activo, no crear otro
    if (watchIdRef.current !== null) {
      return;
    }

    // Opciones para getCurrentPosition
    const quickOptions: PositionOptions = {
      enableHighAccuracy: false, 
      timeout: 5000,
      maximumAge: 60000, 
    };

    // Opciones para watchPosition 
    const watchOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    };

    // 1. Primero obtener posición rápida
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (err: GeolocationPositionError) => {
        console.error('Error al obtener posición rápida', err.code);
      },
      quickOptions
    );

    // 2. Luego iniciar monitoreo continuo
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      watchOptions
    );
  }, [handleSuccess, handleError]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    startWatching();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [startWatching]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setPosition(null);
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    hasStarted.current = false;
    startWatching();
  }, [startWatching]);

  return { position, loading, error, retry };
};