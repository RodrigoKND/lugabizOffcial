import { Navigation } from 'lucide-react';
import { Map, MapMarker, MarkerContent } from '@presentation/components/ui/map';
import { MapPinIcon } from '@icons/index';

const SNAP_ZOOM = 15;
const MAP_HEIGHT = 160;

export function LocationMapSection({ coords }: { coords: [number, number] }) {
  return (
    <>
      <div className="rounded-2xl overflow-hidden border border-stone-100" style={{ height: `${MAP_HEIGHT}px` }}>
        <Map center={[coords[1], coords[0]]} zoom={SNAP_ZOOM} style={{ width: '100%', height: '100%' }}>
          <MapMarker longitude={coords[1]} latitude={coords[0]}>
            <MarkerContent>
              <div style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                <MapPinIcon size={36} />
              </div>
            </MarkerContent>
          </MapMarker>
        </Map>
      </div>
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-transparent hover:bg-purple-50 text-purple-600 rounded-xl text-sm font-semibold transition-all border border-purple-200"
      >
        <Navigation className="w-4 h-4" /> Cómo llegar
      </a>
    </>
  );
}
