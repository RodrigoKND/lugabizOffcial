import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { OSM } from 'ol/source';
import { Map, TileLayer } from 'react-openlayers';
import { View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { DragPan, defaults as defaultInteractions } from 'ol/interaction';
import { usePlaces } from '../context/PlacesContext';
import { useUserMarker } from '../hooks/useUserMarker';
import { useGeolocation } from '../hooks/useGeolocation';
import { useOverpassPlaces } from '../hooks/useOverpassPlaces';
import { OverpassElement } from '../types';
import DistanceFilter from '../components/DistanceFilter';
import MapMarkers from '../components/MapMarkers';
import ChatModal from '../components/ChatModal';
import PlacesResultsModal from '../components/PlacesResultsModal';
import ZoomControls from '../components/ZoomControls';
import PlaceDetailModal from '../components/PlaceDetailModal';
import PlaceSearchFilter from '../components/PlaceSearchFilter';
import { METTERS } from '../static/data/metters';
import 'react-openlayers/dist/index.css';

const Explore: React.FC = () => {
    const { places } = usePlaces();
    const navigate = useNavigate();

    // Estados del Mapa
    const [view] = useState<View>(
        new View({
            center: fromLonLat([-74.08175, 4.60971]),
            zoom: 5,
            maxZoom: 20,
            minZoom: 3,
            enableRotation: true
        })
    );
    const [map, setMap] = useState<any>(null);

    // Geolocalización
    const position = useGeolocation();
    useUserMarker(map, position, view);

    // Datos de Overpass (se obtendrán más abajo usando posición y distancia seleccionada)
    const [selectedDistance, setSelectedDistance] = useState(30000);
    const [selectedPlace, setSelectedPlace] = useState<OverpassElement | null>(null);
    const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Estados de Modales
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState<string>('');
    const [isSearchLoading, setIsSearchLoading] = useState(false);

    // Fetch Overpass based on user's position and selected distance
    const { data } = useOverpassPlaces(position, selectedDistance);

    const filteredPlaces = useMemo(() => {
        if (!data?.elements) return [];
        return data.elements.filter(el => el.lat && el.lon && el?.tags?.name);
    }, [data]);

    // Manejadores de Eventos
    const handleMapInit = (mapInstance: any) => setMap(mapInstance);

    // Construir interacciones usando las interacciones por defecto de OpenLayers
    const interactions = useMemo(() => {
        try {
            const defs: any = defaultInteractions();
            return defs;
        } catch (e) {
            // Fallback: al menos dejar DragPan
            return [new DragPan()];
        }
    }, []);


    const handleDistanceChange = (distance: number) => setSelectedDistance(distance);

    // Open place detail modal when marker is clicked
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
        }, 5000);
    };

    const handleChatAgain = () => {
        setIsResultsModalOpen(false);
        setIsChatModalOpen(true);
    };

    const toggleChatModal = () => setIsChatModalOpen(!isChatModalOpen);

    const handleZoomIn = () => {
        if (map && view) {
            const currentZoom = view.getZoom();
            if (currentZoom !== undefined && currentZoom < 20)
                view.setZoom(currentZoom + 1);

        }
    };

    const handleZoomOut = () => {
        if (map && view) {
            const currentZoom = view.getZoom();
            if (currentZoom !== undefined && currentZoom > 3)
                view.setZoom(currentZoom - 1);
        }
    };

    // Auto-adjust zoom when selected distance changes
    const metersToZoom = (meters: number) => {
        // Buscar en reverse para obtener el rango de distancia correcto
        const zoom = [...METTERS].reverse().find(m => m.metters <= meters)?.zoom || 10;
        return zoom;
    };

    useEffect(() => {
        if (!view || !position || !position.lat || !position.lon) return;
        const zoom = metersToZoom(selectedDistance);
        const coords = fromLonLat([position.lon!, position.lat!]);
        try {
            view.animate({ center: coords, zoom, duration: 400 });
        } catch (e) {
            view.setCenter(coords);
            view.setZoom(zoom);
        }
    }, [selectedDistance, position, view]);

    return (
        <section className="relative w-full h-screen">
            <Map
                ref={handleMapInit}
                controls={[]}
                interactions={interactions}
                style={{ width: "100%", height: "100%" }}
                view={view}
            >
                <TileLayer source={new OSM()} />
            </Map>

            {/* Filtro de Distancias */}
            <div className="absolute bottom-14 left-4 z-20 w-40">
                <DistanceFilter
                    selectedDistance={selectedDistance}
                    onDistanceChange={handleDistanceChange}
                />
            </div>

            {/* Barra de Búsqueda de Lugares */}
            <div className="absolute top-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-96 z-20">
                <PlaceSearchFilter
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            </div>

            {/* Controles de Zoom */}
            <div className="absolute top-20 left-4 z-20">
                <ZoomControls
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                />
            </div>

            {/* Marcadores de Lugares en el Mapa */}
            <MapMarkers map={map} filteredPlaces={filteredPlaces} onMarkerClick={handleMarkerClick} searchQuery={searchQuery} />

            {/* Botón Flotante para Abrir Chat */}
            {!isResultsModalOpen && !isChatModalOpen && (
                <div className="fixed bottom-4 right-4 z-30 flex justify-start">
                    <button
                        className="w-14 h-14 bg-gradient-to-b from-primary-500 to-tomato rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                        title="Chatear con Lubi"
                        aria-label="Chatear con Lubi"
                        onClick={toggleChatModal}
                    >
                        <span className="text-white text-3xl font-bold">👀</span>
                    </button>
                </div>
            )}

            {/* Modal de Chat */}
            <ChatModal
                isOpen={isChatModalOpen}
                onClose={toggleChatModal}
                onSearch={handleSearch}
                isLoading={isSearchLoading}
            />

            {/* Modal de Resultados */}
            <PlacesResultsModal
                isOpen={isResultsModalOpen}
                onClose={() => setIsResultsModalOpen(false)}
                query={selectedQuery}
                places={places}
                isLoading={isSearchLoading}
                onPlaceClick={handlePlaceClick}
                onChatAgain={handleChatAgain}
            />

            {/* Modal de Detalle de Lugar */}
            <PlaceDetailModal
                isOpen={isPlaceModalOpen}
                onClose={() => setIsPlaceModalOpen(false)}
                place={selectedPlace}
            />
        </section>
    );
};

export default Explore;
