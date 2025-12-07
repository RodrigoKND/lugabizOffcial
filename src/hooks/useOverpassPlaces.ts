import { useEffect, useState } from "react";
import { UserPosition, OverpassResponse } from "../types";

export const useOverpassPlaces = (position: UserPosition | null, radiusMeters: number) => {
    const [data, setData] = useState<OverpassResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlaces = async () => {
            if (!position || !position.lat || !position.lon) return;

            setLoading(true);
            setError(null);

            try {
                const lat = position.lat;
                const lon = position.lon;
                const overpassQuery = `
                [out:json][timeout:60];
                (
                  node(around:${radiusMeters},${lat},${lon})["amenity"~"cafe|bar|restaurant|pub"];
                  node(around:${radiusMeters},${lat},${lon})["tourism"~"museum|gallery|attraction"];
                );
                out center 50;
                `;

                const response = await fetch("https://overpass-api.de/api/interpreter", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ data: overpassQuery })
                });

                if (!response.ok) throw new Error(`Error ${response.status}`);
                const json: OverpassResponse = await response.json();
                setData(json);
            } catch (err: any) {
                setError(err.message || "Failed to fetch");
            } finally {
                setLoading(false);
            }
        };

        fetchPlaces();
    }, [position?.lat, position?.lon, radiusMeters]);

    return { data, loading, error };
};
