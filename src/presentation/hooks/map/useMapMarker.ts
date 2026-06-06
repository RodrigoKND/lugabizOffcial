import MapLibreGL from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import type { MapMarkerProps } from "@domain/entities/MapTypes";

export function useMapMarker({
  longitude,
  latitude,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  draggable = false,
  map,
  ...markerOptions
}: MapMarkerProps & { map: MapLibreGL.Map | null }) {
  const callbacksRef = useRef({ onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd });
  callbacksRef.current = { onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd };

  const marker = useMemo(() => {
    const m = new MapLibreGL.Marker({
      ...markerOptions,
      element: document.createElement("div"),
      draggable,
    }).setLngLat([longitude, latitude]);

    m.getElement()?.addEventListener("click", (e: MouseEvent) => callbacksRef.current.onClick?.(e));
    m.getElement()?.addEventListener("mouseenter", (e: MouseEvent) => callbacksRef.current.onMouseEnter?.(e));
    m.getElement()?.addEventListener("mouseleave", (e: MouseEvent) => callbacksRef.current.onMouseLeave?.(e));

    m.on("dragstart", () => {
      const lngLat = m.getLngLat();
      callbacksRef.current.onDragStart?.({ lng: lngLat.lng, lat: lngLat.lat });
    });
    m.on("drag", () => {
      const lngLat = m.getLngLat();
      callbacksRef.current.onDrag?.({ lng: lngLat.lng, lat: lngLat.lat });
    });
    m.on("dragend", () => {
      const lngLat = m.getLngLat();
      callbacksRef.current.onDragEnd?.({ lng: lngLat.lng, lat: lngLat.lat });
    });

    return m;
  }, []);

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => { marker.remove(); };
  }, [map, marker]);

  if (marker.getLngLat().lng !== longitude || marker.getLngLat().lat !== latitude) {
    marker.setLngLat([longitude, latitude]);
  }
  if (marker.isDraggable() !== draggable) {
    marker.setDraggable(draggable);
  }

  const currentOffset = marker.getOffset();
  const newOffset = markerOptions.offset ?? [0, 0];
  const [newOffsetX, newOffsetY] = Array.isArray(newOffset) ? newOffset : [newOffset.x, newOffset.y];
  if (currentOffset.x !== newOffsetX || currentOffset.y !== newOffsetY) {
    marker.setOffset(newOffset);
  }

  if (marker.getRotation() !== (markerOptions.rotation ?? 0)) {
    marker.setRotation(markerOptions.rotation ?? 0);
  }
  if (marker.getRotationAlignment() !== (markerOptions.rotationAlignment ?? "auto")) {
    marker.setRotationAlignment(markerOptions.rotationAlignment ?? "auto");
  }
  if (marker.getPitchAlignment() !== (markerOptions.pitchAlignment ?? "auto")) {
    marker.setPitchAlignment(markerOptions.pitchAlignment ?? "auto");
  }

  return { marker };
}
