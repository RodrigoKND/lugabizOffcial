import { useEffect, useState, useRef } from "react";
import type { GeoPosition, OverpassElement, OverpassResponse } from "@/domain/entities";
import { 
  OVERPASS_API_URL, 
  OVERPASS_VALID_AMENITIES, 
  OVERPASS_VALID_TOURISM,
  CACHE_DURATION 
} from "@/infrastructure/api";

const isVerifiedPlace = (el: OverpassElement) => {
  const tags = el.tags;
  if (!tags) return false;
  if (!tags.name) return false;

  const hasContact = tags.phone || tags["contact:phone"] ||
    tags.website || tags["contact:website"] ||
    tags.opening_hours || tags["addr:street"];

  if (!hasContact) return false;

  const isValidCategory =
    (tags.amenity && OVERPASS_VALID_AMENITIES.includes(tags.amenity)) ||
    (tags.tourism && OVERPASS_VALID_TOURISM.includes(tags.tourism));

  return isValidCategory;
};

const cache = new Map<string, { data: OverpassResponse; timestamp: number }>();

export function useOverpassPlaces(
  position: GeoPosition | null,
  radiusMeters: number
) {
  const [data, setData] = useState<OverpassResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchKey = useRef<string>("");

  useEffect(() => {
    const fetchPlaces = async () => {
      if (!position?.lat || !position?.lon) return;

      const cacheKey = `${position.lat.toFixed(4)}_${position.lon.toFixed(4)}_${radiusMeters}`;
      
      if (cacheKey === lastFetchKey.current && data !== null) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const cached = cache.get(cacheKey);
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

        const response = await fetch(OVERPASS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ data: overpassQuery }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Overpass error ${response.status}`);
        }

        const json: OverpassResponse = await response.json();
        const filteredElements = json.elements.filter(isVerifiedPlace);

        const result = { ...json, elements: filteredElements };

        cache.set(cacheKey, { data: result, timestamp: Date.now() });
        lastFetchKey.current = cacheKey;

        setData(result);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
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
}