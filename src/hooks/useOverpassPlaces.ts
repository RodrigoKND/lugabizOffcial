import { useEffect, useState, useRef } from "react";
import { OverpassResponse, OverpassElement } from "@/types";
import type { GeoPosition } from "@/hooks/useGeolocation";

const isVerifiedPlace = (el: OverpassElement) => {
    const tags = el.tags;
    if (!tags) return false;
    if (!tags.name) return false;

    const hasContact =
        tags.phone ||
        tags["contact:phone"] ||
        tags.website ||
        tags["contact:website"] ||
        tags.opening_hours ||
        tags["addr:street"];

    if (!hasContact) return false;

    const validAmenities = [
        "restaurant",
        "cafe",
        "bar",
        "pub",
        "fast_food",
        "ice_cream"
    ];

    const validTourism = [
        "museum",
        "gallery",
        "attraction",
        "artwork"
    ];

    const isValidCategory =
        (tags.amenity && validAmenities.includes(tags.amenity)) ||
        (tags.tourism && validTourism.includes(tags.tourism));

    return isValidCategory;
};

// Cache global para evitar refetch innecesarios
const cache = new Map<string, { data: OverpassResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useOverpassPlaces = (
    position: GeoPosition | null,
    radiusMeters: number
) => {
    const [data, setData] = useState<OverpassResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastFetchKey = useRef<string>("");

    useEffect(() => {
        const fetchPlaces = async () => {
            if (!position?.lat || !position?.lon) return;

            // Generar clave única para esta búsqueda
            const cacheKey = `${position.lat.toFixed(4)}_${position.lon.toFixed(4)}_${radiusMeters}`;
            
            // Si es la misma búsqueda que la anterior, no hacer nada
            if (cacheKey === lastFetchKey.current && data !== null) {
                return;
            }

            // Cancelar petición anterior si existe
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const cached = cache.get(cacheKey);

            // Usar cache si es reciente
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                setData(cached.data);
                lastFetchKey.current = cacheKey;
                return;
            }

            setLoading(true);
            setError(null);

            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const { lat, lon } = position;

                // Limitar resultados con [out:json][timeout:25]
                const overpassQuery = `
                [out:json][timeout:25];
                (
                  node(around:${radiusMeters},${lat},${lon})
                    ["amenity"~"restaurant|cafe|bar|pub|fast_food|ice_cream"]
                    ["name"];
                  node(around:${radiusMeters},${lat},${lon})
                    ["tourism"~"museum|gallery|attraction|artwork"]
                    ["name"];
                );
                out center tags 100;
                `;

                const response = await fetch(
                    "https://overpass-api.de/api/interpreter",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: new URLSearchParams({ data: overpassQuery }),
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(`Overpass error ${response.status}`);
                }

                const json: OverpassResponse = await response.json();
                const filteredElements = json.elements.filter(isVerifiedPlace);

                const result = {
                    ...json,
                    elements: filteredElements,
                };

                // Guardar en cache
                cache.set(cacheKey, { data: result, timestamp: Date.now() });
                lastFetchKey.current = cacheKey;

                setData(result);
            } catch (error: any) {
                if (error.name !== "AbortError") {
                    console.error(error);
                    setError("Fallo al obtener lugares cerca de usted");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPlaces();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [position?.lat, position?.lon, radiusMeters, data]);

    return { data, loading, error };
};