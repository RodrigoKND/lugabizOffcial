import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { progressKey, toggleDone, firstPending, loadDone, saveDone, type ProgressSource } from './advisorProgress';

// Paradas marcadas como listas, guardadas por idea + zona. `currentId` es la primera pendiente.
export function useAdvisorProgress(source: ProgressSource, order: string[]) {
  const key = useMemo(() => progressKey(source), [source]);
  const [done, setDone] = useState<string[]>(() => loadDone(key));
  const latest = useRef(done);

  useEffect(() => {
    const restored = loadDone(key);
    latest.current = restored;
    setDone(restored);
  }, [key]);

  const toggle = useCallback((id: string) => {
    const next = toggleDone(latest.current, id);
    latest.current = next;
    setDone(next);
    saveDone(key, next);
  }, [key]);

  return { done, toggle, currentId: firstPending(order, done) };
}
