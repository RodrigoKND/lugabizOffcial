"use client";

import { useId } from "react";

import type { MapClusterLayerProps } from "./types";
import { useMap } from "./context";
import { useClusterSource } from "@presentation/hooks/map/useClusterSource";
import { useClusterEvents } from "@presentation/hooks/map/useClusterEvents";

function MapClusterLayer<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties
>({
  data,
  clusterMaxZoom = 14,
  clusterRadius = 50,
  clusterColors = ["#51bbd6", "#f1f075", "#f28cb1"],
  clusterThresholds = [100, 750],
  pointColor = "#3b82f6",
  onPointClick,
  onClusterClick,
}: MapClusterLayerProps<P>) {
  const { map, isLoaded } = useMap();
  const id = useId();
  const sourceId = `cluster-source-${id}`;
  const clusterLayerId = `clusters-${id}`;
  const clusterCountLayerId = `cluster-count-${id}`;
  const unclusteredLayerId = `unclustered-point-${id}`;

  useClusterSource(
    map, isLoaded,
    { sourceId, clusterLayerId, clusterCountLayerId, unclusteredLayerId },
    data, clusterMaxZoom, clusterRadius,
    clusterColors, clusterThresholds, pointColor
  );

  useClusterEvents(
    map, isLoaded,
    { sourceId, clusterLayerId, unclusteredLayerId },
    onClusterClick, onPointClick
  );

  return null;
}

export { MapClusterLayer };
