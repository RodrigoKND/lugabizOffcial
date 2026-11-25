import { useSyncExternalStore } from 'react';

const QUERY = '(pointer: coarse)';

const getSnapshot = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches;

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener?.('change', onChange);
  return () => mq.removeEventListener?.('change', onChange);
}

// ¿El dispositivo principal es táctil? Decide si los gestos (doble toque) reemplazan al mouse.
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
