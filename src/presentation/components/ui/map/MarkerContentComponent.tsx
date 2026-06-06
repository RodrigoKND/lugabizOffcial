"use client";

import { createPortal } from "react-dom";
import { cn } from "@infrastructure/utils";
import type { MarkerContentProps } from "./types";
import { useMarkerContext } from "./context";
import { DefaultMarkerIcon } from "./DefaultMarkerIcon";

function MarkerContent({ children, className }: MarkerContentProps) {
  const { marker } = useMarkerContext();

  return createPortal(
    <div className={cn("relative cursor-pointer", className)}>
      {children || <DefaultMarkerIcon />}
    </div>,
    marker.getElement()
  );
}

export { MarkerContent };
