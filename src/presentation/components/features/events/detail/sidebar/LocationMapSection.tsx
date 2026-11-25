import { Navigation } from 'lucide-react';
import { Map, MapMarker, MarkerContent } from '@presentation/components/ui/map';
import { MapPinIcon } from '@icons/index';

const SNAP_ZOOM = 15;
const MAP_HEIGHT = 176;

export function LocationMapSection({ coords }: { coords: [number, number] }) {
  return (
    <>
      <div className="overflow-hidden rounded-lg border-2 border-lg-surface-2" style={{ height: `${MAP_HEIGHT}px` }}>
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
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-lg-accent px-4 text-sm font-bold text-lg-ink transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lg-text"
      >
        <Navigation className="h-4 w-4" /> Cómo llegar
      </a>
    </>
  );
}
