import MapLibreGL from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import type { PopupOptions } from "maplibre-gl";

export function useMapPopup({
  map,
  marker,
  popupOptions: _popupOptions,
}: {
  map: MapLibreGL.Map | null;
  marker: MapLibreGL.Marker;
  popupOptions: Partial<PopupOptions>;
}) {
  const container = useMemo(() => document.createElement("div"), []);
  const prevOptions = useRef(_popupOptions);

  const popup = useMemo(() => {
    return new MapLibreGL.Popup({
      offset: 16,
      ..._popupOptions,
      closeButton: false,
    })
      .setMaxWidth("none")
      .setDOMContent(container);
  }, []);

  useEffect(() => {
    if (!map) return;
    popup.setDOMContent(container);
    marker.setPopup(popup);
    return () => { marker.setPopup(null); };
  }, [map, marker, popup, container]);

  if (popup.isOpen()) {
    const prev = prevOptions.current;
    if (prev.offset !== _popupOptions.offset) {
      popup.setOffset(_popupOptions.offset ?? 16);
    }
    if (prev.maxWidth !== _popupOptions.maxWidth && _popupOptions.maxWidth) {
      popup.setMaxWidth(_popupOptions.maxWidth ?? "none");
    }
    prevOptions.current = _popupOptions;
  }

  const handleClose = () => popup.remove();

  return { container, handleClose };
}
