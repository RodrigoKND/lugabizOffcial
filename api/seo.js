import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { rest } from './_lib/supabaseRest.js';
import { SITE_URL, canonicalFor, eventPageMeta, injectMeta, placePageMeta, resolveRoute } from './_lib/seoCore.js';

// El HTML de la app va incluido en la función (vercel.json › includeFiles); si no está, se pide al propio sitio.
async function loadShell(req) {
  try {
    return await readFile(join(process.cwd(), 'dist', 'index.html'), 'utf8');
  } catch {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const res = await fetch(`https://${host}/index.html`);
    if (!res.ok) throw new Error(`shell_${res.status}`);
    return res.text();
  }
}

async function metaFor(route, path) {
  if (route.kind === 'static') return { meta: { ...route.meta, url: canonicalFor(path, SITE_URL) }, status: 200 };
  if (route.kind === 'private') return { meta: { noindex: true }, status: 200 };
  if (route.kind === 'unknown') return { meta: { noindex: true }, status: 404 };

  const select = route.kind === 'place'
    ? 'name,description,image,address,hidden,category:categories(name)'
    : 'name,description,image,address,date_start,date_end,category:categories(name)';
  const table = route.kind === 'place' ? 'places' : 'events';
  const [row] = await rest(`${table}?id=eq.${route.id}&select=${select}&limit=1`);

  if (!row || row.hidden === true) return { meta: { noindex: true }, status: 404 };
  const build = route.kind === 'place' ? placePageMeta : eventPageMeta;
  return { meta: build({ ...row, id: route.id }, SITE_URL), status: 200 };
}

// Catch-all: devuelve el HTML de la app con las etiquetas SEO de CADA url (título, canonical, Open Graph, JSON-LD),
// robots según la ruta y 404 real para lo que no existe. La app React se carga igual que siempre.
export default async function handler(req, res) {
  const raw = new URL(req.url, 'http://localhost').searchParams.get('path') || '/';
  const path = raw.length > 1 ? raw.replace(/\/+$/, '') || '/' : raw;

  let shell;
  try {
    shell = await loadShell(req);
  } catch (err) {
    console.error('[seo] sin html base', err?.message);
    res.statusCode = 502;
    return res.end('Servicio no disponible');
  }

  let html = shell;
  let status = 200;
  try {
    const route = resolveRoute(path);
    const result = await metaFor(route, path);
    html = injectMeta(shell, result.meta);
    status = result.status;
  } catch (err) {
    // Si la consulta falla se sirve la app tal cual: mejor sin etiquetas propias que sin página.
    console.error('[seo]', path, err?.message);
  }

  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', status === 200 ? 'public, s-maxage=600, stale-while-revalidate=3600' : 'public, s-maxage=60');
  res.end(html);
}
