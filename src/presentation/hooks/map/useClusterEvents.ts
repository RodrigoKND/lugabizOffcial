import MapLibreGL from "maplibre-gl";
import { useEffect } from "react";

export function useClusterEvents(
  map: MapLibreGL.Map | null,
  isLoaded: boolean,
  ids: {
    sourceId: string;
    clusterLayerId: string;
    unclusteredLayerId: string;
  },
  onClusterClick?: (
    clusterId: number,
    coordinates: [number, number],
    pointCount: number
  ) => void,
  onPointClick?: (
    feature: GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties>,
    coordinates: [number, number]
  ) => void
) {
  useEffect(() => {
    if (!isLoaded || !map) return;
    const { sourceId, clusterLayerId, unclusteredLayerId } = ids;

    const handleClusterClick = async (
      e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }
    ) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [clusterLayerId] });
      if (!features.length) return;

      const feature = features[0];
      const clusterId = feature.properties?.cluster_id as number;
      const pointCount = feature.properties?.point_count as number;
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

      if (onClusterClick) {
        onClusterClick(clusterId, coordinates, pointCount);
      } else {
        const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({ center: coordinates, zoom });
      }
    };

    const handlePointClick = (
      e: MapLibreGL.MapMouseEvent & { features?: MapLibreGL.MapGeoJSONFeature[] }
    ) => {
      if (!onPointClick || !e.features?.length) return;

      const feature = e.features[0];
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      onPointClick(feature as unknown as GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties>, coordinates);
    };

    const handleMouseEnter = () => { map.getCanvas().style.cursor = "pointer"; };
    const handleMouseLeave = () => { map.getCanvas().style.cursor = ""; };
    const handlePointEnter = () => { if (onPointClick) map.getCanvas().style.cursor = "pointer"; };
    const handlePointLeave = () => { map.getCanvas().style.cursor = ""; };

    map.on("click", clusterLayerId, handleClusterClick);
    map.on("click", unclusteredLayerId, handlePointClick);
    map.on("mouseenter", clusterLayerId, handleMouseEnter);
    map.on("mouseleave", clusterLayerId, handleMouseLeave);
    map.on("mouseenter", unclusteredLayerId, handlePointEnter);
    map.on("mouseleave", unclusteredLayerId, handlePointLeave);

    return () => {
      map.off("click", clusterLayerId, handleClusterClick);
      map.off("click", unclusteredLayerId, handlePointClick);
      map.off("mouseenter", clusterLayerId, handleMouseEnter);
      map.off("mouseleave", clusterLayerId, handleMouseLeave);
      map.off("mouseenter", unclusteredLayerId, handlePointEnter);
      map.off("mouseleave", unclusteredLayerId, handlePointLeave);
    };
  }, [isLoaded, map, ids, onClusterClick, onPointClick]);
}
