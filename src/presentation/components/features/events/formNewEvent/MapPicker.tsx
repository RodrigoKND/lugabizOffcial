import React from 'react';
import { Crosshair } from 'lucide-react';
import { Map, MapMarker, MarkerContent, MapControls } from '@presentation/components/ui/map';
import { MapPinIconDetailed } from '@icons/index';
import { useCoordPicker } from '@presentation/hooks/form/useCoordPicker';
import { MAP } from '@constants/coords';

interface MapPickerProps {
  initialCoords: number[];
  onCoordsChange: (lat: number, lng: number) => void;
}

const GEOAPIFY_KEY = (import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined)?.trim();
const geoapifyStyles = GEOAPIFY_KEY
  ? {
      light: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${GEOAPIFY_KEY}`,
      dark: `https://maps.geoapify.com/v1/styles/dark-matter-brown/style.json?apiKey=${GEOAPIFY_KEY}`,
    }
  : undefined;

const MapPicker: React.FC<MapPickerProps> = ({ initialCoords, onCoordsChange }) => {
  const {
    mapRef, coords, handleMapClick, handleDragEnd, handleLocate, externalUpdate,
  } = useCoordPicker(initialCoords, onCoordsChange);

  React.useEffect(() => { externalUpdate(initialCoords); }, [initialCoords, externalUpdate]);

  return (
    <section className="relative rounded-2xl overflow-hidden border border-stone-200" style={{ height: '400px' }}>
      <Map
        ref={mapRef}
        center={coords}
        zoom={MAP.DEFAULT_ZOOM}
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
            <div style={{ cursor: 'grab', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
              <MapPinIconDetailed size={48} />
            </div>
          </MarkerContent>
        </MapMarker>
      </Map>
      <button
        type="button"
        onClick={handleLocate}
        className="absolute top-4 right-4 z-10 bg-white p-2.5 rounded-xl shadow-md border border-stone-200 hover:bg-stone-50 transition-colors"
        title="Mi ubicación"
        aria-label="Usar mi ubicación"
      >
        <Crosshair className="w-5 h-5 text-stone-600" />
      </button>
      <footer className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm text-xs text-stone-500 border border-stone-200">
        Haz clic en el mapa o arrastra el marcador
      </footer>
    </section>
  );
};

export default MapPicker;
