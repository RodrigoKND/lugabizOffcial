"use client";

import React from "react";
import { MarkerContext } from "./context";
import { useMap } from "./context";
import type { MapMarkerProps } from "./types";
import { useMapMarker } from "@presentation/hooks/map/useMapMarker";

function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap();
  const { marker } = useMapMarker({
    longitude,
    latitude,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
    draggable,
    map,
    ...markerOptions,
  });

  return (
    <MarkerContext.Provider value={{ marker, map }}>
      {children}
    </MarkerContext.Provider>
  );
}

export { MapMarker };
