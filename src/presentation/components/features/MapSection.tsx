import React from 'react';
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
} from '@/components/ui/map';
import MapMarkers from '@/components/MapMarkers';
import MapController from './MapController';
import type { OverpassElement } from '@/types';
import type { GeoPosition } from '@/hooks/useGeolocation';

interface MapSectionProps {
  position: GeoPosition;
  initialZoom: number;
  filteredPlaces: OverpassElement[];
  searchQuery: string;
  selectedDistance: number;
  onMarkerClick: (place: OverpassElement) => void;
}

const MapSection: React.FC<MapSectionProps> = ({
  position,
  initialZoom,
  filteredPlaces,
  searchQuery,
  selectedDistance,
  onMarkerClick,
}) => {
  return (
    <div className="absolute inset-0 z-10">
      <Map  center={[position.lon, position.lat]} zoom={initialZoom}>
        <MapController position={position} selectedDistance={selectedDistance} />

        {position?.lat && position?.lon && (
          <MapMarker longitude={position.lon} latitude={position.lat}>
            <MarkerContent>
              <div className="flex flex-col items-center" style={{ zIndex: 1000 }}>
                <div className="text-3xl sm:text-4xl animate-pulse relative z-50">
                  🦕
                </div>
              </div>
            </MarkerContent>
          </MapMarker>
        )}

        <MapMarkers
          filteredPlaces={filteredPlaces}
          searchQuery={searchQuery}
          onMarkerClick={onMarkerClick}
        />

        <MapControls showZoom showFullscreen />
      </Map>
    </div>
  );
};

export default MapSection;