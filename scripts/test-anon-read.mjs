import fs from 'fs';
const env = fs.readFileSync('.env', 'utf8');
const get = (k) => {
  const m = env.match(new RegExp(k + '\\s*=\\s*"?([^"\\r\\n]+)"?'));
  return m ? m[1].trim() : '';
};
const url = get('VITE_SUPABASE_URL');
const key = get('VITE_SUPABASE_ANON_KEY');

(async () => {
  for (const table of ['places', 'users', 'events', 'business_posts']) {
    const r = await fetch(`${url}/rest/v1/${table}?select=id&limit=3`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const body = await r.text();
    console.log(table, '->', r.status, r.status === 200 ? `${JSON.parse(body).length} filas` : body.slice(0, 120));
  }
})();
