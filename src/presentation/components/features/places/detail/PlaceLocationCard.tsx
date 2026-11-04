import { MapPin, Navigation } from 'lucide-react';
import { Map, MapMarker, MarkerContent } from '@presentation/components/ui/map';
import { MapPinIcon } from '@icons/index';
import type { PlaceLocationCardProps } from '@domain/entities/PlaceDetailTypes';

export default function PlaceLocationCard({ address, latitude, longitude }: PlaceLocationCardProps) {
  const hasCoords = latitude && longitude;
  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : '#';

  return (
    <div className="bg-lg-surface rounded-3xl p-6 ring-1 ring-lg-surface-2 shadow-[0_2px_12px_rgba(80,50,140,0.08)]">
      <h3 className="font-semibold text-lg-text mb-3">Ubicación</h3>
      <div className="flex items-start gap-3 mb-4">
        <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <span className="text-lg-dim">{address}</span>
      </div>

      {hasCoords && (
        <>
          <div className="rounded-2xl overflow-hidden border border-lg-surface-2" style={{ height: '200px' }}>
            <Map
              center={[longitude!, latitude!]}
              zoom={15}
              style={{ width: '100%', height: '100%' }}
            >
              <MapMarker longitude={longitude!} latitude={latitude!}>
                <MarkerContent>
                  <div style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
                    <MapPinIcon size={40} />
                  </div>
                </MarkerContent>
              </MapMarker>
            </Map>
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-transparent hover:bg-purple-50 text-purple-600 rounded-xl text-sm font-semibold transition-all border border-purple-200"
          >
            <Navigation className="w-4 h-4" />
            Cómo llegar
          </a>
        </>
      )}
    </div>
  );
}
