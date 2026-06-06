import MapLibreGL from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import type { PopupOptions } from "maplibre-gl";

export function useMapTooltip({
  map,
  marker,
  tooltipOptions: _tooltipOptions,
}: {
  map: MapLibreGL.Map | null;
  marker: MapLibreGL.Marker;
  tooltipOptions: Partial<PopupOptions>;
}) {
  const container = useMemo(() => document.createElement("div"), []);
  const prevOptions = useRef(_tooltipOptions);

  const tooltip = useMemo(() => {
    return new MapLibreGL.Popup({
      offset: 16,
      ..._tooltipOptions,
      closeOnClick: true,
      closeButton: false,
    }).setMaxWidth("none");
  }, []);

  useEffect(() => {
    if (!map) return;
    tooltip.setDOMContent(container);
    const handleMouseEnter = () => { tooltip.setLngLat(marker.getLngLat()).addTo(map); };
    const handleMouseLeave = () => { tooltip.remove(); };
    const el = marker.getElement();
    el?.addEventListener("mouseenter", handleMouseEnter);
    el?.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el?.removeEventListener("mouseenter", handleMouseEnter);
      el?.removeEventListener("mouseleave", handleMouseLeave);
      tooltip.remove();
    };
  }, [map, marker, tooltip, container]);

  if (tooltip.isOpen()) {
    const prev = prevOptions.current;
    if (prev.offset !== _tooltipOptions.offset) {
      tooltip.setOffset(_tooltipOptions.offset ?? 16);
    }
    if (prev.maxWidth !== _tooltipOptions.maxWidth && _tooltipOptions.maxWidth) {
      tooltip.setMaxWidth(_tooltipOptions.maxWidth ?? "none");
    }
    prevOptions.current = _tooltipOptions;
  }

  return { container };
}
