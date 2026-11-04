import { useState, useEffect } from 'react';

// Valor que se actualiza recién tras `ms` sin cambios: evita una consulta por cada tecla.
export function useDebouncedValue<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}
