import { MapPin } from 'lucide-react';
import { Map, MapMarker, MarkerContent } from '@presentation/components/ui/map';
import { MapPinIcon } from '@icons/index';
import type { PlaceLocationCardProps } from '@domain/entities/PlaceDetailTypes';

// Dónde queda: dirección y mapa. El botón "Cómo llegar" vive arriba, en la tarjeta de acciones.
export default function PlaceLocationCard({ address, latitude, longitude }: PlaceLocationCardProps) {
  const hasCoords = !!latitude && !!longitude;

  return (
    <section aria-label="Ubicación" className="space-y-3 rounded-xl border-2 border-lg-surface-2 bg-lg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-lg-surface-2 text-lg-accent"><MapPin className="h-5 w-5" /></span>
        <div className="min-w-0 pt-0.5">
          <p className="text-xs font-bold text-lg-dim">Dónde</p>
          <p className="break-words text-sm font-semibold text-lg-text">{address}</p>
        </div>
      </div>

      {hasCoords && (
        <div className="overflow-hidden rounded-lg border-2 border-lg-surface-2" style={{ height: '200px' }}>
          <Map center={[longitude!, latitude!]} zoom={15} style={{ width: '100%', height: '100%' }}>
            <MapMarker longitude={longitude!} latitude={latitude!}>
              <MarkerContent>
                <div style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
                  <MapPinIcon size={40} />
                </div>
              </MarkerContent>
            </MapMarker>
          </Map>
        </div>
      )}
    </section>
  );
}
