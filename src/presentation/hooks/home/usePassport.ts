import { useEffect, useMemo, useState } from 'react';
import { passportService, type PassportStamp } from '@lib/supabase/services/chispa/passport';
import { passportLevel } from '@lib/supabase/services/chispa/passportLevel';

// Pasaporte cochabambino: sellos (lugares visitados) y nivel del usuario.
export function usePassport(userId?: string) {
  const [stamps, setStamps] = useState<PassportStamp[]>([]);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) { setStamps([]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    passportService.getStamps(userId).then(s => { if (!cancelled) { setStamps(s); setLoading(false); } });
    return () => { cancelled = true; };
  }, [userId]);

  const level = useMemo(() => passportLevel(stamps.length), [stamps.length]);
  return { stamps, level, loading };
}
