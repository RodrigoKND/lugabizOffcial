// Lógica pura de SEO (sin red ni Vercel) para poder probarla con Vitest.
// Se usa desde api/seo.js (etiquetas por URL) y api/sitemap.js (sitemap dinámico).

export const SITE_URL = process.env.SITE_URL || 'https://lugabiz.vercel.app';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const STATIC_ROUTES = {
  '/': {
    title: 'Lugabiz: qué hacer en Cochabamba | Lugares, eventos y planes',
    description: 'Descubre qué hacer hoy en Cochabamba: lugares, eventos y planes con tus panas. Reseñas reales, cómo llegar y lo que pasa cerca de ti.',
  },
  '/events/feed': {
    title: 'Eventos en Cochabamba | Lugabiz',
    description: 'Agenda de eventos en Cochabamba: fiestas, conciertos, ferias y planes de esta semana. Mira qué hay y sé el primero en llegar.',
  },
  '/comunidad': {
    title: 'Comunidad de Cochabamba | Lugabiz',
    description: 'Lo que comparte la comunidad: reseñas, planes y recomendaciones de lugares en Cochabamba.',
  },
  '/pasaporte': {
    title: 'Pasaporte Cochabambino | Lugabiz',
    description: 'Colecciona sellos de los lugares que visitas en Cochabamba y sube de nivel: de Turista a Cochabambino de pura cepa.',
  },
};

const PRIVATE_EXACT = ['/admin', '/profile', '/chat', '/asesor', '/add-place', '/confirmation'];
const PRIVATE_PREFIX = ['/edit-place/', '/edit-event/', '/share/'];

export const SITEMAP_STATIC_PATHS = Object.keys(STATIC_ROUTES);

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Texto corto para meta descripción: sin saltos, cortado en palabra completa.
export function truncate(text, max = 155) {
  const s = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  let cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > max * 0.6) cut = cut.slice(0, lastSpace);
  return `${cut.trimEnd()}…`;
}

// JSON dentro de <script>: se escapan < > & para que ningún texto de usuario pueda cerrar la etiqueta.
const safeJson = (obj) => JSON.stringify(obj)
  .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

const metaTag = (attr, key, content) => `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`;

function setMeta(html, defaultAttr, key, content) {
  const re = new RegExp(`<meta\\s+(name|property)="${key}"[^>]*>`);
  if (re.test(html)) return html.replace(re, (_m, attr) => metaTag(attr, key, content));
  return html.replace('</head>', () => `${metaTag(defaultAttr, key, content)}\n</head>`);
}

// Pone en el HTML crudo las etiquetas propias de la URL. Todos los campos son opcionales.
export function injectMeta(html, m) {
  let out = html;
  if (m.title) {
    out = out.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeHtml(m.title)}</title>`);
    out = setMeta(out, 'property', 'og:title', m.title);
    out = setMeta(out, 'property', 'twitter:title', m.title);
  }
  if (m.description) {
    out = setMeta(out, 'name', 'description', m.description);
    out = setMeta(out, 'property', 'og:description', m.description);
    out = setMeta(out, 'property', 'twitter:description', m.description);
  }
  if (m.url) {
    const link = `<link rel="canonical" href="${escapeHtml(m.url)}" />`;
    out = /<link\s+rel="canonical"[^>]*>/.test(out)
      ? out.replace(/<link\s+rel="canonical"[^>]*>/, () => link)
      : out.replace('</head>', () => `${link}\n</head>`);
    out = setMeta(out, 'property', 'og:url', m.url);
  }
  if (m.image) {
    out = setMeta(out, 'property', 'og:image', m.image);
    out = setMeta(out, 'property', 'twitter:image', m.image);
  }
  if (m.noindex) out = setMeta(out, 'name', 'robots', 'noindex, nofollow');
  if (m.jsonLd) {
    out = out.replace('</head>', () => `<script type="application/ld+json">${safeJson(m.jsonLd)}</script>\n</head>`);
  }
  return out;
}

// Qué es una ruta: lugar/evento (solo con UUID válido, nunca se consulta la base con texto libre), pública, privada o desconocida.
export function resolveRoute(pathname) {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const m = p.match(/^\/(place|event)\/([^/]+)$/);
  if (m) return UUID.test(m[2]) ? { kind: m[1], id: m[2] } : { kind: 'unknown' };
  if (STATIC_ROUTES[p]) return { kind: 'static', path: p, meta: STATIC_ROUTES[p] };
  if (PRIVATE_EXACT.includes(p) || PRIVATE_PREFIX.some((x) => p.startsWith(x))) return { kind: 'private' };
  return { kind: 'unknown' };
}

export const canonicalFor = (path, origin = SITE_URL) => (path === '/' ? origin : `${origin}${path}`);

const address = (street) => ({
  '@type': 'PostalAddress',
  streetAddress: street || undefined,
  addressLocality: 'Cochabamba',
  addressCountry: 'BO',
});

export function placePageMeta(p, origin = SITE_URL) {
  const cat = p.category?.name;
  const fallback = `${p.name}${cat ? `, ${String(cat).toLowerCase()}` : ''} en Cochabamba. Fotos, reseñas y cómo llegar en Lugabiz.`;
  const url = `${origin}/place/${p.id}`;
  const description = truncate(p.description || fallback);
  return {
    title: `${p.name} en Cochabamba | Lugabiz`,
    description,
    url,
    image: p.image || undefined,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Place', name: p.name, description, image: p.image || undefined, url, address: address(p.address) },
  };
}

export function eventPageMeta(e, origin = SITE_URL) {
  const fallback = `${e.name} en Cochabamba. Fecha, lugar y quiénes van, en Lugabiz.`;
  const url = `${origin}/event/${e.id}`;
  const description = truncate(e.description || fallback);
  return {
    title: `${e.name}, evento en Cochabamba | Lugabiz`,
    description,
    url,
    image: e.image || undefined,
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'Event', name: e.name, description, url,
      image: e.image || undefined, startDate: e.date_start, endDate: e.date_end || undefined,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: e.address || 'Cochabamba', address: address(e.address) },
    },
  };
}

export function buildSitemapXml(entries) {
  const row = (e) => `<url><loc>${escapeHtml(e.loc)}</loc>`
    + (e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : '')
    + (e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : '')
    + (e.priority ? `<priority>${e.priority}</priority>` : '')
    + '</url>';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(row).join('\n')}\n</urlset>`;
}
