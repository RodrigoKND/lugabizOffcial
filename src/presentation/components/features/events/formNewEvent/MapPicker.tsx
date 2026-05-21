import React, { useCallback, useState } from 'react';
import { Crosshair } from 'lucide-react';
import { Map, MapMarker, MarkerContent, MapControls } from '@presentation/components/ui/map';

interface MapPickerProps {
  initialCoords: number[];
  onCoordsChange: (lat: number, lng: number) => void;
}

const defaultCenter = { lng: -66.1568, lat: -17.3895 };

const MapPicker: React.FC<MapPickerProps> = ({ initialCoords, onCoordsChange }) => {
  const [coords, setCoords] = useState<[number, number]>(
    initialCoords.length === 2 ? [initialCoords[1], initialCoords[0]] : [defaultCenter.lng, defaultCenter.lat]
  );

  const handleMapClick = useCallback((e: any) => {
    const lngLat = e.lngLat;
    setCoords([lngLat.lng, lngLat.lat]);
    onCoordsChange(lngLat.lat, lngLat.lng);
  }, [onCoordsChange]);

  const handleDragEnd = useCallback((lngLat: { lng: number; lat: number }) => {
    setCoords([lngLat.lng, lngLat.lat]);
    onCoordsChange(lngLat.lat, lngLat.lng);
  }, [onCoordsChange]);

  const handleLocate = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords([longitude, latitude]);
        onCoordsChange(latitude, longitude);
      });
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-stone-200" style={{ height: '400px' }}>
      <Map
        center={coords}
        zoom={13}
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
