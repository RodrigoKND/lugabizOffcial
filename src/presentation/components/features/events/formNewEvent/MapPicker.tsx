import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Crosshair } from 'lucide-react';
import { Map, MapMarker, MarkerContent, MapControls } from '@presentation/components/ui/map';
import type { MapRef } from '@presentation/components/ui/map';

interface MapPickerProps {
  initialCoords: number[];
  onCoordsChange: (lat: number, lng: number) => void;
}

const defaultCenter = { lng: -66.1568, lat: -17.3895 };

// Geoapify osm-bright: mapa con TODAS las calles y lugares (mucho más detallado que Carto).
// Usa la misma clave del autocompletado; si no hay clave, cae a los estilos Carto por defecto del <Map/>.
const GEOAPIFY_KEY = (import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined)?.trim();
const geoapifyStyles = GEOAPIFY_KEY
  ? {
      light: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${GEOAPIFY_KEY}`,
      dark: `https://maps.geoapify.com/v1/styles/dark-matter-brown/style.json?apiKey=${GEOAPIFY_KEY}`,
    }
  : undefined;

const MapPicker: React.FC<MapPickerProps> = ({ initialCoords, onCoordsChange }) => {
  const mapRef = useRef<MapRef>(null)
  const [coords, setCoords] = useState<[number, number]>(
    initialCoords.length === 2 ? [initialCoords[1], initialCoords[0]] : [defaultCenter.lng, defaultCenter.lat]
  );
  // Cuando el cambio de coords viene de un click/drag/locate del propio mapa, NO queremos
  // que el efecto de abajo vuelva a volar (evita saltos y bucles).
  const skipFlyRef = useRef(false);

  // Reacciona a coordenadas que llegan DESDE FUERA (ej. elegir una dirección del autocompletado):
  // mueve el marcador y vuela hacia el punto.
  useEffect(() => {
    if (initialCoords.length !== 2) return;
    const [lat, lng] = initialCoords;
    if (skipFlyRef.current) { skipFlyRef.current = false; return; }
    setCoords(prev =>
      (Math.abs(prev[0] - lng) < 1e-7 && Math.abs(prev[1] - lat) < 1e-7) ? prev : [lng, lat]
    );
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 16, duration: 1000 });
  }, [initialCoords]);

  const handleMapClick = useCallback((e: any) => {
    const lngLat = e.lngLat;
    skipFlyRef.current = true;
    setCoords([lngLat.lng, lngLat.lat]);
    onCoordsChange(lngLat.lat, lngLat.lng);
  }, [onCoordsChange]);

  const handleDragEnd = useCallback((lngLat: { lng: number; lat: number }) => {
    skipFlyRef.current = true;
    setCoords([lngLat.lng, lngLat.lat]);
    onCoordsChange(lngLat.lat, lngLat.lng);
  }, [onCoordsChange]);

  const handleLocate = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        skipFlyRef.current = true;
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 16, duration: 1200 })
        setCoords([longitude, latitude]);
        onCoordsChange(latitude, longitude);
      });
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-stone-200" style={{ height: '400px' }}>
      <Map
        ref={mapRef}
        center={coords}
        zoom={13}
        styles={geoapifyStyles}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
      >
        <MapControls showZoom={false} position="top-right" />
        <MapMarker
          longitude={coords[0]}
          latitude={coords[1]}
          draggable
          onDragEnd={handleDragEnd}
        >
          <MarkerContent>
            <div style={{
              width: 48, height: 48, cursor: 'grab',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
            }}>
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M24 2C15.164 2 8 9.164 8 18c0 12 16 28 16 28s16-16 16-28C40 9.164 32.836 2 24 2z" fill="#D4785C"/>
                <path d="M24 2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z" fill="white"/>
                <path d="M24 6c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4z" fill="#D4785C"/>
                <circle cx="24" cy="10" r="1.5" fill="white"/>
              </svg>
            </div>
          </MarkerContent>
        </MapMarker>
      </Map>
      <button
        type="button"
        onClick={handleLocate}
        className="absolute top-4 right-4 z-10 bg-white p-2.5 rounded-xl shadow-md border border-stone-200 hover:bg-stone-50 transition-colors"
        title="Mi ubicación"
      >
        <Crosshair className="w-5 h-5 text-stone-600" />
      </button>
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm text-xs text-stone-500 border border-stone-200">
        Haz clic en el mapa o arrastra el marcador
      </div>
    </div>
  );
};

export default MapPicker;
