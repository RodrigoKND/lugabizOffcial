import { useRef, useCallback, useEffect } from 'react';

export const DOUBLE_TAP_MS = 260;

interface TapEvent { stopPropagation(): void }

// Doble toque: el toque simple espera DOUBLE_TAP_MS por si llega un segundo; si llega, solo cuenta el doble.
export function useDoubleTap<E extends TapEvent>(onSingle: () => void, onDouble: (e: E) => void, delay = DOUBLE_TAP_MS) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return useCallback((e: E) => {
    e.stopPropagation();
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      onDouble(e);
      return;
    }
    timer.current = setTimeout(() => { timer.current = null; onSingle(); }, delay);
  }, [onSingle, onDouble, delay]);
}
