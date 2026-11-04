import { useState, useRef, useCallback, useEffect } from 'react';
import { pickPhrases } from '@presentation/components/features/reactions/phrases';

export interface FloatingPhrase {
  id: number;
  text: string;
  left: number;
  top: number;
  dx: number;
  rot: number;
  delay: number;
}

const LIFETIME_MS = 1700;
const STAGGER_MS = 130;
const MAX_ITEMS = 18;

const between = (min: number, max: number) => min + Math.random() * (max - min);

// Ráfaga de frases flotantes: cada toque suma unas pocas, se limpian solas y nunca pasan de MAX_ITEMS.
export function useReactionBurst() {
  const [items, setItems] = useState<FloatingPhrase[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => { pending.forEach(clearTimeout); pending.clear(); };
  }, []);

  const fire = useCallback((origin: { x: number; y: number }, count = 3) => {
    const fresh = pickPhrases(count).map((text, i): FloatingPhrase => ({
      id: nextId.current++,
      text,
      left: origin.x + between(-22, 22),
      top: origin.y,
      dx: between(-55, 55),
      rot: between(-14, 14),
      delay: i * STAGGER_MS,
    }));
    setItems(prev => [...prev, ...fresh].slice(-MAX_ITEMS));

    const ids = new Set(fresh.map(f => f.id));
    const t = setTimeout(() => {
      setItems(prev => prev.filter(p => !ids.has(p.id)));
      timers.current.delete(t);
    }, LIFETIME_MS + count * STAGGER_MS);
    timers.current.add(t);
  }, []);

  return { items, fire };
}
