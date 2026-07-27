import { useEffect, useRef, useState } from 'react';
import { usernameService } from '@lib/supabase';

export type UsernameAvailability = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;

// Chequeo en vivo mientras el usuario escribe su apodo (registro/perfil).
// `initialUsername` evita golpear la DB cuando el valor no cambió respecto al guardado.
export function useUsernameAvailability(username: string, initialUsername?: string): UsernameAvailability {
  const [status, setStatus] = useState<UsernameAvailability>('idle');
  const requestIdRef = useRef(0);

  useEffect(() => {
    const value = username.trim().toLowerCase();

    if (!value || value === (initialUsername || '').toLowerCase()) {
      setStatus('idle');
      return;
    }
    if (!USERNAME_RE.test(value)) {
      setStatus('invalid');
      return;
    }

    setStatus('checking');
    const requestId = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      try {
        const available = await usernameService.isAvailable(value);
        if (requestIdRef.current === requestId) setStatus(available ? 'available' : 'taken');
      } catch {
        if (requestIdRef.current === requestId) setStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, initialUsername]);

  return status;
}
