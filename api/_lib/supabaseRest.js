// Lectura pública de Supabase por REST con la clave anónima (las mismas políticas RLS que ve cualquier visitante).
export async function rest(path) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en las variables de entorno');

  const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`supabase_${res.status}`);
  return res.json();
}
