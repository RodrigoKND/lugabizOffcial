import React, { useMemo } from "react";
import { MapMarker, MarkerContent } from "@/components/ui/map";
import { OverpassElement } from "@/types";

interface MapMarkersProps {
  filteredPlaces: OverpassElement[];
  onMarkerClick?: (place: OverpassElement) => void;
  searchQuery?: string;
}

const getPlaceEmoji = (place: OverpassElement) => {
  const amenity = place.tags?.amenity;
  const tourism = place.tags?.tourism;

  if (amenity === "restaurant") return "🍽️";
  if (amenity === "cafe") return "☕";
  if (amenity === "bar" || amenity === "pub") return "🍺";
  if (amenity === "fast_food") return "🍕";
  if (amenity === "ice_cream") return "🍦";
  if (tourism === "museum" || tourism === "gallery") return "🏛️";
  if (tourism === "attraction" || tourism === "artwork") return "🎨";
  
  return "📍";
};

const getPlaceColor = (place: OverpassElement) => {
  const amenity = place.tags?.amenity;
  const tourism = place.tags?.tourism;

  if (amenity === "restaurant") return "bg-orange-500";
  if (amenity === "cafe") return "bg-amber-600";
  if (amenity === "bar" || amenity === "pub") return "bg-purple-600";
  if (amenity === "fast_food") return "bg-red-500";
  if (amenity === "ice_cream") return "bg-pink-400";
  if (tourism === "museum" || tourism === "gallery") return "bg-blue-600";
  if (tourism === "attraction" || tourism === "artwork") return "bg-indigo-500";
  
  return "bg-gray-500";
};

const MapMarkers: React.FC<MapMarkersProps> = ({
  filteredPlaces,
  onMarkerClick,
  searchQuery = "",
}) => {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const markers = useMemo(() => {
    const grouped = new Map<string, OverpassElement[]>();
    
    filteredPlaces
      .filter((p) => p.lat != null && p.lon != null)
      .forEach((place) => {
        const key = `${place.lat!.toFixed(4)}_${place.lon!.toFixed(4)}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(place);
      });

    const result: Array<{
      place: OverpassElement;
      matches: boolean;
      offsetLat: number;
      offsetLon: number;
    }> = [];

    grouped.forEach((places) => {
      places.forEach((place, index) => {
        const name = place.tags?.name?.toLowerCase() || "";
        const amenity = place.tags?.amenity?.toLowerCase() || "";
        const tourism = place.tags?.tourism?.toLowerCase() || "";
        const cuisine = place.tags?.cuisine?.toLowerCase() || "";

        const matches =
          !normalizedQuery ||
          name.includes(normalizedQuery) ||
          amenity.includes(normalizedQuery) ||
          tourism.includes(normalizedQuery) ||
          cuisine.includes(normalizedQuery);

        const angle = (index * (360 / places.length)) * (Math.PI / 180);
        const radius = places.length > 1 ? 0.0001 : 0;
        
        result.push({
          place,
          matches,
          offsetLat: Math.cos(angle) * radius,
          offsetLon: Math.sin(angle) * radius,
        });
      });
    });

    return result;
  }, [filteredPlaces, normalizedQuery]);

  return (
    <>
      {markers.map(({ place, matches, offsetLat, offsetLon }) => (
        <MapMarker
          key={place.id}
          longitude={place.lon! + offsetLon}
          latitude={place.lat! + offsetLat}
          onClick={() => onMarkerClick?.(place)}
          className="z-0 absolute"
        >
          <MarkerContent className="!z-0">
            <div className="flex flex-col items-center relative">
              <div
                className={`
                  px-2 py-1 rounded-md mb-1 whitespace-nowrap text-xs font-medium
                  ${matches ? "bg-white text-gray-800 shadow-md" : "bg-gray-700 text-white"}
                `}
              >
                {place.tags?.name || "Sin nombre"}
              </div>
              <div
                className={`
                  rounded-full border-2 border-white shadow-lg
                  transition-all duration-200 cursor-pointer
                  hover:scale-125 active:scale-95
                  flex items-center justify-center text-sm
                  ${matches ? getPlaceColor(place) : "bg-gray-400"}
                  ${matches ? "w-9 h-9" : "w-7 h-7"}
                `}
              >
                <span className="text-white">
                  {getPlaceEmoji(place)}
                </span>
              </div>
            </div>
          </MarkerContent>
        </MapMarker>
      ))}
    </>
  );
};

export default MapMarkers;