import { rest } from './_lib/supabaseRest.js';
import { SITE_URL, SITEMAP_STATIC_PATHS, buildSitemapXml, canonicalFor } from './_lib/seoCore.js';

const PAGE = 1000;
const MAX_PAGES = 20;

async function fetchAll(query) {
  const rows = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const batch = await rest(`${query}&limit=${PAGE}&offset=${page * PAGE}`);
    rows.push(...batch);
    if (batch.length < PAGE) break;
  }
  return rows;
}

// /sitemap.xml: rutas públicas + todos los lugares visibles + eventos vigentes. Se regenera sola (caché de 1 hora).
export default async function handler(_req, res) {
  const today = new Date().toISOString().slice(0, 10);
  let places = [];
  let events = [];
  let failed = false;

  try {
    [places, events] = await Promise.all([
      fetchAll('places?select=id&hidden=not.is.true&order=id'),
      fetchAll(`events?select=id&or=(date_end.gte.${today},date_start.gte.${today})&order=id`),
    ]);
  } catch (err) {
    failed = true;
    console.error('[sitemap]', err?.message);
  }

  const entries = [
    ...SITEMAP_STATIC_PATHS.map((p) => ({ loc: canonicalFor(p, SITE_URL), changefreq: 'daily', priority: p === '/' ? '1.0' : '0.6' })),
    ...events.map((e) => ({ loc: `${SITE_URL}/event/${e.id}`, changefreq: 'daily', priority: '0.8' })),
    ...places.map((p) => ({ loc: `${SITE_URL}/place/${p.id}`, changefreq: 'weekly', priority: '0.7' })),
  ];

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  // Si la base falló, el sitemap sale incompleto: que no quede cacheado una hora.
  res.setHeader('Cache-Control', failed ? 'public, s-maxage=60' : 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.end(buildSitemapXml(entries));
}
