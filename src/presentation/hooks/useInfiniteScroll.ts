import { useEffect, useRef } from 'react';

// Devuelve un ref para poner en un div "centinela" al final de una lista:
// cuando entra en pantalla (con margen de anticipación) dispara onLoadMore.
// Carga progresiva por scroll en vez de un botón "cargar más" o paginación clásica.
export function useInfiniteScroll(onLoadMore: () => void, enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) onLoadMore();
    }, { rootMargin: '200px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore, enabled]);

  return sentinelRef;
}
