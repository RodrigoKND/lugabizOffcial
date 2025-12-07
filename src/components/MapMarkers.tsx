import { useEffect, useRef } from 'react';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { Style, Circle, Fill, Stroke } from 'ol/style';

interface FilteredPlace {
    id: number;
    lat?: number;
    lon?: number;
    tags?: Record<string, string>;
}

interface MapMarkersProps {
    map: any;
    filteredPlaces: FilteredPlace[];
    onMarkerClick?: (place: FilteredPlace) => void;
    searchQuery?: string;
}

const MapMarkers: React.FC<MapMarkersProps> = ({ map, filteredPlaces, onMarkerClick, searchQuery = '' }) => {
    const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

    // Función para verificar si un lugar coincide con la búsqueda
    const matchesSearch = (place: FilteredPlace): boolean => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        const name = place.tags?.name?.toLowerCase() || '';
        
        // Buscar en el nombre
        if (name.includes(query)) return true;

        // Buscar en los tags de amenity y tourism
        const amenity = place.tags?.amenity?.toLowerCase() || '';
        const tourism = place.tags?.tourism?.toLowerCase() || '';
        const cuisine = place.tags?.cuisine?.toLowerCase() || '';

        return amenity.includes(query) || tourism.includes(query) || cuisine.includes(query);
    };

    useEffect(() => {
        if (!map) return;

        // Crear o obtener la capa de marcadores
        if (!markerLayerRef.current) {
            const vectorSource = new VectorSource();
            const vectorLayer = new VectorLayer({
                source: vectorSource
            });
            markerLayerRef.current = vectorLayer;
            map.addLayer(vectorLayer);
        }

        // Limpiar marcadores anteriores
        const source = markerLayerRef.current.getSource();
        if (source) {
            source.clear();

            // Agregar nuevo marcador por cada lugar filtrado
            filteredPlaces.forEach((place: FilteredPlace) => {
                const matches = matchesSearch(place);
                
                const marker = new Feature({
                    geometry: new Point(fromLonLat([place.lon!, place.lat!])),
                    place: place
                });

                // Cambiar color según si coincide con la búsqueda
                const markerColor = matches ? '#ef4444' : '#d1d5db'; // Rojo si coincide, gris si no

                marker.setStyle(
                    new Style({
                        image: new Circle({
                            radius: matches ? 8 : 6, // Más grande si coincide
                            fill: new Fill({ color: markerColor }),
                            stroke: new Stroke({ color: 'white', width: 2 })
                        })
                    })
                );

                source.addFeature(marker);
            });
        }

        // Manejar clicks en marcadores
        const handlePointerMove = (evt: any) => {
            const pixel = evt.pixel;
            const hit = map.hasFeatureAtPixel(pixel);

            if (hit) {
                const features = map.getFeaturesAtPixel(pixel);
                if (features && features.length > 0) {
                    const place = features[0].get('place');
                    if (place && onMarkerClick) {
                        map.getViewport().style.cursor = 'pointer';
                    }
                }
            } else {
                map.getViewport().style.cursor = '';
            }
        };

        const handleClick = (evt: any) => {
            const features = map.getFeaturesAtPixel(evt.pixel);
            if (features && features.length > 0) {
                const place = features[0].get('place');
                if (place && onMarkerClick) {
                    onMarkerClick(place);
                }
            }
        };

        map.on('pointermove', handlePointerMove);
        map.on('click', handleClick);

        return () => {
            map.un('pointermove', handlePointerMove);
            map.un('click', handleClick);
        };
    }, [map, filteredPlaces, onMarkerClick, searchQuery]);

    return null;
};

export default MapMarkers;
