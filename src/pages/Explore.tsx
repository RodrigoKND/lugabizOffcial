import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
    Map,
    MapMarker,
    MarkerContent,
    MapControls,
    useMap,
} from "@/components/ui/map";

import { usePlaces } from "@/context/PlacesContext";
import { useGeolocation, type GeoPosition } from "@/hooks/useGeolocation";
import { useOverpassPlaces } from "@/hooks/useOverpassPlaces";
import { useProximityNotifications } from "@/hooks/useProximityNotifications";

import DistanceFilter from "@/components/DistanceFilter";
import MapMarkers from "@/components/MapMarkers";
import ChatModal from "@/components/ChatModal";
import PlacesResultsModal from "@/components/PlacesResultsModal";
import PlaceDetailModal from "@/components/PlaceDetailModal";
import PlaceSearchFilter from "@/components/PlaceSearchFilter";

import { METTERS } from "@/static/data/metters";
import type { OverpassElement } from "@/types";

function MapController({
    position,
    selectedDistance,
}: {
    position: GeoPosition | null;
    selectedDistance: number;
}) {
    const { map, isLoaded } = useMap();
    const hasInitialized = useRef(false);
    const lastPosition = useRef<GeoPosition | null>(null);
    const lastDistance = useRef<number | null>(null);

    const metersToZoom = useCallback((meters: number) => {
        return (
            [...METTERS].reverse().find((m) => m.metters <= meters)?.zoom ?? 13
        );
    }, []);

    useEffect(() => {
        if (!map || !isLoaded || !position?.lat || !position?.lon) return;

        const positionChanged =
            !lastPosition.current ||
            Math.abs(lastPosition.current.lat - position.lat) > 0.001 ||
            Math.abs(lastPosition.current.lon - position.lon) > 0.001;

        const distanceChanged = lastDistance.current !== selectedDistance;

        // Primera inicialización o cambios detectados
        if (!hasInitialized.current || positionChanged || distanceChanged) {
            map.flyTo({
                center: [position.lon, position.lat],
                zoom: metersToZoom(selectedDistance),
                duration: hasInitialized.current ? 800 : 0,
            });

            hasInitialized.current = true;
            lastPosition.current = { lat: position.lat, lon: position.lon };
            lastDistance.current = selectedDistance;
        }
    }, [map, isLoaded, position, selectedDistance, metersToZoom]);

    return null;
}

const Explore: React.FC = () => {
    const navigate = useNavigate();
    const { places } = usePlaces();

    const { position, loading: geoLoading, error, retry } = useGeolocation();

    const [selectedDistance, setSelectedDistance] = useState(METTERS[0].metters);
    const [selectedPlace, setSelectedPlace] =
        useState<OverpassElement | null>(null);
    const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState("");
    const [isSearchLoading, setIsSearchLoading] = useState(false);

    const initialZoom = useMemo(() => {
        return [...METTERS].reverse().find((m) => m.metters <= METTERS[0].metters)?.zoom ?? 13;
    }, []);

    const { data } = useOverpassPlaces(position, selectedDistance);

    const filteredPlaces = useMemo(() => {
        if (!data?.elements) return [];
        return data.elements.filter(
            (el) => el.lat && el.lon && el.tags?.name
        );
    }, [data]);

    // Notificaciones de proximidad inteligentes
    useProximityNotifications(position, filteredPlaces, {
        radiusMeters: 100,
        cooldownMinutes: 30,
        maxNotificationsPerHour: 3,
    });

    const handleDistanceChange = (distance: number) =>
        setSelectedDistance(distance);

    const handleMarkerClick = (place: OverpassElement) => {
        setSelectedPlace(place);
        setIsPlaceModalOpen(true);
    };

    const handleSearch = (query: string) => {
        setSelectedQuery(query);
        setIsSearchLoading(true);
        setTimeout(() => {
            setIsSearchLoading(false);
            setIsResultsModalOpen(true);
        }, 2000);
        setIsChatModalOpen(false);
    };

    const handlePlaceClick = (placeId: string) => {
        setIsSearchLoading(true);
        setTimeout(() => {
            setIsSearchLoading(false);
            navigate(`/place/${placeId}`);
        }, 1500);
    };

    if (geoLoading && !position) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="text-6xl animate-bounce">🦕</div>
                    <p className="text-lg font-medium text-muted-foreground">
                        Obteniendo tu ubicación...
                    </p>
                    {error && (
                        <p className="text-sm text-red-500 mt-2">{error}</p>
                    )}
                </div>
            </div>
        );
    }

    if (!position) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="text-6xl">🦕</div>
                    <p className="text-lg font-medium text-muted-foreground">
                        No se pudo obtener ubicación
                    </p>
                    <button
                        onClick={() => retry()}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <section className="fixed inset-0 w-full h-full overflow-hidden">
            <div className="absolute inset-0 z-10">
                <Map
                    center={[position.lon, position.lat]}
                    zoom={initialZoom}
                >
                    <MapController
                        position={position}
                        selectedDistance={selectedDistance}
                    />

                    {position?.lat && position?.lon && (
                        <MapMarker
                            longitude={position.lon}
                            latitude={position.lat}
                        >
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
                        onMarkerClick={handleMarkerClick}
                    />

                    <MapControls showZoom showFullscreen />
                </Map>
            </div>

            {/* Controles UI - Responsive */}
            <div className="fixed top-16 sm:top-20 left-2 sm:left-4 z-40 flex flex-col gap-2 sm:gap-4 w-[calc(100%-1rem)] sm:w-max max-w-[280px] sm:max-w-none">
                <PlaceSearchFilter
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                <DistanceFilter
                    selectedDistance={selectedDistance}
                    onDistanceChange={handleDistanceChange}
                />
            </div>

            {/* Botón Chat - Responsive */}
            {!isResultsModalOpen && !isChatModalOpen && (
                <button
                    aria-label="Pregúntame"
                    title="Pregúntame"
                    className="fixed bottom-20 sm:top-1/2 right-2 sm:right-4 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-purple-400 hover:bg-purple-500 active:scale-95 transition-all shadow-lg text-white flex items-center justify-center text-xl sm:text-2xl"
                    onClick={() => setIsChatModalOpen(true)}
                >
                    👀
                </button>
            )}

            <ChatModal
                isOpen={isChatModalOpen}
                onClose={() => setIsChatModalOpen(false)}
                onSearch={handleSearch}
                isLoading={isSearchLoading}
            />

            <PlacesResultsModal
                isOpen={isResultsModalOpen}
                onClose={() => setIsResultsModalOpen(false)}
                query={selectedQuery}
                places={places}
                isLoading={isSearchLoading}
                onPlaceClick={handlePlaceClick}
                onChatAgain={() => {
                    setIsResultsModalOpen(false);
                    setIsChatModalOpen(true);
                }}
            />

            <PlaceDetailModal
                isOpen={isPlaceModalOpen}
                onClose={() => setIsPlaceModalOpen(false)}
                place={selectedPlace}
            />
        </section>
    );
};

export default Explore;