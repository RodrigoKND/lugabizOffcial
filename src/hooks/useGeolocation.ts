import { useEffect, useState, useRef } from 'react';

export interface GeoPosition {
  lat: number;
  lon: number;
}

export const useGeolocation = () => {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const hasAttempted = useRef(false);

  useEffect(() => {
    // Evitar múltiples intentos
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    // Verificar soporte de geolocalización
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      setLoading(false);
      return;
    }

    const handleSuccess = (geoPosition: GeolocationPosition) => {
      const newPosition = {
        lat: geoPosition.coords.latitude,
        lon: geoPosition.coords.longitude,
      };
      
      setPosition(newPosition);
      setLoading(false);
      setError(null);
      
      console.log('Ubicación obtenida:', newPosition);
    };

    const handleError = (err: GeolocationPositionError) => {
      let errorMessage = 'Error al obtener ubicación';
      
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Permiso de ubicación denegado. Por favor, habilita los permisos en tu navegador.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Ubicación no disponible. Verifica tu conexión GPS o red.';
          break;
        case err.TIMEOUT:
          errorMessage = 'Tiempo de espera agotado. Intenta nuevamente.';
          break;
        default:
          errorMessage = err.message || 'Error desconocido al obtener ubicación';
      }
      
      console.error('Error de geolocalización:', err);
      setError(errorMessage);
      setLoading(false);
    };

    // Configuración optimizada
    const options: PositionOptions = {
      enableHighAccuracy: false, // Cambiado a false para ser más rápido
      timeout: 10000, // 10 segundos
      maximumAge: 30000, // Acepta cache de hasta 30 segundos
    };

    console.log('Solicitando geolocalización...');

    // Intentar obtener posición actual primero
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      () => {
        console.warn('getCurrentPosition falló, intentando con watchPosition');
        
        // Si getCurrentPosition falla, intentar con watchPosition
        watchIdRef.current = navigator.geolocation.watchPosition(
          handleSuccess,
          handleError,
          options
        );
      },
      options
    );

    // Cleanup
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Función para reintentar manualmente
  const retry = () => {
    hasAttempted.current = false;
    setLoading(true);
    setError(null);
    setPosition(null);
    
    // Forzar re-ejecución
    window.location.reload();
  };

  return { position, loading, error, retry };
};