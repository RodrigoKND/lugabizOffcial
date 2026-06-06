import MapLibreGL from "maplibre-gl";
import { useEffect, useRef } from "react";

type LayerIds = {
  sourceId: string;
  clusterLayerId: string;
  clusterCountLayerId: string;
  unclusteredLayerId: string;
};

export function useClusterSource(
  map: MapLibreGL.Map | null,
  isLoaded: boolean,
  ids: LayerIds,
  data: string | GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>,
  clusterMaxZoom: number,
  clusterRadius: number,
  clusterColors: [string, string, string],
  clusterThresholds: [number, number],
  pointColor: string
) {
  const stylePropsRef = useRef({ clusterColors, clusterThresholds, pointColor });

  useEffect(() => {
    if (!isLoaded || !map) return;
    const { sourceId, clusterLayerId, clusterCountLayerId, unclusteredLayerId } = ids;

    map.addSource(sourceId, {
      type: "geojson",
      data,
      cluster: true,
      clusterMaxZoom,
      clusterRadius,
    });

    map.addLayer({
      id: clusterLayerId,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": ["step", ["get", "point_count"],
          clusterColors[0], clusterThresholds[0],
          clusterColors[1], clusterThresholds[1],
          clusterColors[2],
        ],
        "circle-radius": ["step", ["get", "point_count"],
          20, clusterThresholds[0],
          30, clusterThresholds[1],
          40,
        ],
      },
    });

    map.addLayer({
      id: clusterCountLayerId,
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: { "text-field": "{point_count_abbreviated}", "text-size": 12 },
      paint: { "text-color": "#fff" },
    });

    map.addLayer({
      id: unclusteredLayerId,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: { "circle-color": pointColor, "circle-radius": 6 },
    });

    return () => {
      try {
        if (map.getLayer(clusterCountLayerId)) map.removeLayer(clusterCountLayerId);
        if (map.getLayer(unclusteredLayerId)) map.removeLayer(unclusteredLayerId);
        if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch { /* ignore */ }
    };
  }, [isLoaded, map, ids, data, clusterMaxZoom, clusterRadius, clusterColors, clusterThresholds, pointColor]);

  useEffect(() => {
    if (!isLoaded || !map || typeof data === "string") return;
    const source = map.getSource(ids.sourceId) as MapLibreGL.GeoJSONSource;
    if (source) source.setData(data);
  }, [isLoaded, map, data, ids.sourceId]);

  useEffect(() => {
    if (!isLoaded || !map) return;
    const prev = stylePropsRef.current;
    const { clusterLayerId, unclusteredLayerId } = ids;

    if (map.getLayer(clusterLayerId) && (
      prev.clusterColors !== clusterColors || prev.clusterThresholds !== clusterThresholds
    )) {
      map.setPaintProperty(clusterLayerId, "circle-color", ["step", ["get", "point_count"],
        clusterColors[0], clusterThresholds[0],
        clusterColors[1], clusterThresholds[1],
        clusterColors[2],
      ]);
      map.setPaintProperty(clusterLayerId, "circle-radius", ["step", ["get", "point_count"],
        20, clusterThresholds[0],
        30, clusterThresholds[1],
        40,
      ]);
    }

    if (map.getLayer(unclusteredLayerId) && prev.pointColor !== pointColor) {
      map.setPaintProperty(unclusteredLayerId, "circle-color", pointColor);
    }

    stylePropsRef.current = { clusterColors, clusterThresholds, pointColor };
  }, [isLoaded, map, ids, clusterColors, clusterThresholds, pointColor]);
}
