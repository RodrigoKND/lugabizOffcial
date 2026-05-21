import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { usePlaces } from "@/context/PlacesContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useOverpassPlaces } from "@/hooks/useOverpassPlaces";
import { useProximityNotifications } from "@/hooks/useProximityNotifications";

import ChatModal from "@/components/ChatModal";
import PlacesResultsModal from "@/components/PlacesResultsModal";
import PlaceDetailModal from "@/components/PlaceDetailModal";

import { METTERS } from "@/static/data/metters";
import type { OverpassElement } from "@/types";

import LoadingScreen from "@/presentation/components/features/LoadingScreen";
import ProximityToast from "@/presentation/components/features/ProximityToast";
import MapSection from "@/presentation/components/features/MapSection";
import ControlsSection from "@/presentation/components/features/ControlsSection";
import ChatButton from "@/presentation/components/features/ChatButton";
import MapErrorBoundary from "@/presentation/components/features/MapErrorBoundary";

const Explore: React.FC = () => {
    const navigate = useNavigate();
    const { places } = usePlaces();

    const { position, loading: geoLoading, error, retry } = useGeolocation();

    const [selectedDistance, setSelectedDistance] = useState<number>(METTERS[0].metters);
    const [selectedPlace, setSelectedPlace] = useState<OverpassElement | null>(null);
    const [isPlaceModalOpen, setIsPlaceModalOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState<boolean>(false);
    const [selectedQuery, setSelectedQuery] = useState<string>("");
    const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

    const initialZoom = useMemo<number>(() => {
        return [...METTERS].reverse().find((m) => m.metters <= METTERS[0].metters)?.zoom ?? 13;
    }, []);

    const { data } = useOverpassPlaces(position, selectedDistance);

    const filteredPlaces = useMemo<OverpassElement[]>(() => {
        if (!data?.elements) return [];
        return data.elements.filter((el): el is OverpassElement => 
            el.lat !== undefined && el.lon !== undefined && el.tags?.name !== undefined
        );
    }, [data]);

    const { nearbyPlace, closeNotification } = useProximityNotifications(
        position,
        filteredPlaces
    );

    const handleDistanceChange = useCallback((distance: number): void => setSelectedDistance(distance), []);

    const handleMarkerClick = useCallback((place: OverpassElement): void => {
        setSelectedPlace(place);
        setIsPlaceModalOpen(true);
    }, []);

    const handleSearch = useCallback((query: string): void => {
        setSelectedQuery(query);
        setIsSearchLoading(true);
        setTimeout(() => {
            setIsSearchLoading(false);
            setIsResultsModalOpen(true);
        }, 2000);
        setIsChatModalOpen(false);
    }, []);

    const handlePlaceClick = useCallback((placeId: string): void => {
        setIsSearchLoading(true);
        setTimeout(() => {
            setIsSearchLoading(false);
            navigate(`/place/${placeId}`);
        }, 1500);
    }, [navigate]);

    const handleChatClose = useCallback((): void => setIsChatModalOpen(false), []);
    const handleResultsClose = useCallback((): void => setIsResultsModalOpen(false), []);
    const handlePlaceModalClose = useCallback((): void => setIsPlaceModalOpen(false), []);

    const handleChatAgain = useCallback((): void => {
        setIsResultsModalOpen(false);
        setIsChatModalOpen(true);
    }, []);

    const handleSearchChange = useCallback((query: string): void => setSearchQuery(query), []);

    if (geoLoading && !position) {
        return <LoadingScreen message="Obteniendo tu ubicación..." error={error} />;
    }

    if (!position) {
        return <LoadingScreen message="No se pudo obtener ubicación" onRetry={retry} />;
    }

    return (
        <section className="fixed inset-0 w-full h-full overflow-hidden bg-slate-100">
            <MapErrorBoundary>
                <MapSection
                    position={position}
                    initialZoom={initialZoom}
                    filteredPlaces={filteredPlaces}
                    searchQuery={searchQuery}
                    selectedDistance={selectedDistance}
                    onMarkerClick={handleMarkerClick}
                />
            </MapErrorBoundary>

            {nearbyPlace && (
                <ProximityToast nearbyPlace={nearbyPlace} onClose={closeNotification} />
            )}

            <ControlsSection
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                selectedDistance={selectedDistance}
                onDistanceChange={handleDistanceChange}
            />

            <ChatButton
                onClick={(): void => setIsChatModalOpen(true)}
                isVisible={!isResultsModalOpen && !isChatModalOpen}
            />

            <div className={`${isChatModalOpen ? "fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" : "z-40"} flex flex-col md:gap-2 gap-4`}>
                <ChatModal
                    isOpen={isChatModalOpen}
                    onClose={handleChatClose}
                    onSearch={handleSearch}
                    isLoading={isSearchLoading}
                />
            </div>

            <PlacesResultsModal
                isOpen={isResultsModalOpen}
                onClose={handleResultsClose}
                query={selectedQuery}
                places={places}
                isLoading={isSearchLoading}
                onPlaceClick={handlePlaceClick}
                onChatAgain={handleChatAgain}
            />

            <PlaceDetailModal
                isOpen={isPlaceModalOpen}
                onClose={handlePlaceModalClose}
                place={selectedPlace}
            />
        </section>
    );
};

export default Explore;