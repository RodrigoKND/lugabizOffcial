"use client";

import { createPortal } from "react-dom";

import { cn } from "@infrastructure/utils";
import type { MarkerTooltipProps } from "./types";
import { useMarkerContext } from "./context";
import { useMapTooltip } from "@presentation/hooks/map/useMapTooltip";

function MarkerTooltip({
  children,
  className,
  ...popupOptions
}: MarkerTooltipProps) {
  const { marker, map } = useMarkerContext();
  const { container } = useMapTooltip({
    map,
    marker,
    tooltipOptions: popupOptions,
  });

  return createPortal(
    <div
      className={cn(
        "rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      {children}
    </div>,
    container
  );
}

export { MarkerTooltip };
