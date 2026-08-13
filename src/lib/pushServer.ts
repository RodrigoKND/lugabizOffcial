// Cliente para el servidor propio de notificaciones (Downloads/lugabizPushServer,
// Express en Vercel) — reemplaza a `supabase.functions.invoke(...)` para los
// endpoints ya migrados fuera de las Edge Functions.
import { supabase } from '@lib/supabase/client';

const PUSH_SERVER_URL = import.meta.env.VITE_PUSH_SERVER_URL as string;

export async function pushServerFetch<T>(path: string, body: unknown): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Debes iniciar sesión.');

  const res = await fetch(`${PUSH_SERVER_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string })?.error ?? `Error ${res.status}`);
  return json as T;
}

// Para endpoints públicos (GET, sin sesión requerida) como /places/trending.
export async function pushServerGet<T>(path: string): Promise<T> {
  const res = await fetch(`${PUSH_SERVER_URL}${path}`, { method: 'GET' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string })?.error ?? `Error ${res.status}`);
  return json as T;
}
