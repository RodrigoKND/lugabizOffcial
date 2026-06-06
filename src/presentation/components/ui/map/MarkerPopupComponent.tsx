"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@infrastructure/utils";
import type { MarkerPopupProps } from "./types";
import { useMarkerContext } from "./context";
import { useMapPopup } from "@presentation/hooks/map/useMapPopup";

function MarkerPopup({
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MarkerPopupProps) {
  const { marker, map } = useMarkerContext();
  const { container, handleClose } = useMapPopup({
    map,
    marker,
    popupOptions,
  });

  return createPortal(
    <div
      className={cn(
        "relative rounded-md border bg-popover p-3 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      {closeButton && (
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-1 right-1 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>,
    container
  );
}

export { MarkerPopup };
