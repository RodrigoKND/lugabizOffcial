import { MapPin } from 'lucide-react';
import { Map, MapMarker, MarkerContent } from '@presentation/components/ui/map';
import type { PlaceLocationCardProps } from '@domain/entities/PlaceDetailTypes';

export default function PlaceLocationCard({ address, latitude, longitude }: PlaceLocationCardProps) {
  const hasCoords = latitude && longitude;

  return (
    <div className="bg-white/5 rounded-3xl p-6 border border-white/8 backdrop-blur-sm">
      <h3 className="font-semibold text-white/80 mb-3">Ubicación</h3>
      <div className="flex items-start gap-3 mb-4">
        <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <span className="text-white/55">{address}</span>
      </div>

      {hasCoords && (
        <div className="rounded-2xl overflow-hidden border border-white/8" style={{ height: '200px' }}>
          <Map
            center={[longitude!, latitude!]}
            zoom={15}
            style={{ width: '100%', height: '100%' }}
          >
            <MapMarker longitude={longitude!} latitude={latitude!}>
              <MarkerContent>
                <div style={{
                  width: 40, height: 40,
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                }}>
                  <svg viewBox="0 0 48 48" fill="none">
                    <path d="M24 2C15.164 2 8 9.164 8 18c0 12 16 28 16 28s16-16 16-28C40 9.164 32.836 2 24 2z" fill="#D4785C"/>
                    <path d="M24 2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z" fill="white"/>
                    <circle cx="24" cy="10" r="4" fill="#D4785C"/>
                  </svg>
                </div>
              </MarkerContent>
            </MapMarker>
          </Map>
        </div>
      )}
    </div>
  );
}
