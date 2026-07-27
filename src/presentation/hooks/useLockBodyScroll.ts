import { useEffect } from 'react';

// Evita que la página de atrás se pueda scrollear mientras un modal fixed
// está abierto (si no, en mobile el fondo se desliza por debajo y se percibe
// como que "otros elementos se sobreponen" al modal).
export function useLockBodyScroll(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isLocked]);
}
