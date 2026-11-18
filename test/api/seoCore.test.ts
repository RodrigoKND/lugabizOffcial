import { describe, it, expect } from 'vitest';
// @ts-expect-error módulo JS sin tipos (se ejecuta en Vercel como función)
import * as core from '../../api/_lib/seoCore.js';

const SHELL = `<!DOCTYPE html><html><head>
<title>Base</title>
<meta name="description" content="base" />
<meta name="robots" content="index, follow" />
<meta property="og:title" content="base" />
<meta property="og:description" content="base" />
<meta property="og:url" content="https://x.app" />
<meta property="og:image" content="https://x.app/default.webp" />
<meta property="twitter:title" content="base" />
<meta property="twitter:description" content="base" />
<meta property="twitter:image" content="https://x.app/default.webp" />
<link rel="canonical" href="https://x.app" />
</head><body><div id="root"></div></body></html>`;

const SITE = 'https://lugabiz.vercel.app';
const ID = '123e4567-e89b-42d3-a456-426614174000';

describe('escapeHtml / truncate', () => {
  it('escapa los caracteres peligrosos', () => {
    expect(core.escapeHtml(`<b>"Tom" & 'Jerry'</b>`)).toBe('&lt;b&gt;&quot;Tom&quot; &amp; &#39;Jerry&#39;&lt;/b&gt;');
  });
  it('trunca en palabra completa y colapsa espacios', () => {
    const out = core.truncate('uno   dos tres cuatro cinco', 14);
    expect(out.length).toBeLessThanOrEqual(15);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toMatch(/\s{2}/);
  });
  it('no toca textos cortos', () => {
    expect(core.truncate('hola', 155)).toBe('hola');
  });
});

describe('injectMeta', () => {
  const meta = { title: 'El "Cristo" <script> | Lugabiz', description: 'Desc & más', url: `${SITE}/place/${ID}`, image: 'https://img/x.jpg' };

  it('reemplaza título, descripción, canonical, og y twitter', () => {
    const html = core.injectMeta(SHELL, meta);
    expect(html).toContain('<title>El &quot;Cristo&quot; &lt;script&gt; | Lugabiz</title>');
    expect(html).toContain(`<link rel="canonical" href="${SITE}/place/${ID}" />`);
    expect(html).toContain('content="Desc &amp; más"');
    expect(html).toContain('<meta property="og:image" content="https://img/x.jpg" />');
    expect(html).toContain('<meta property="twitter:image" content="https://img/x.jpg" />');
    expect(html).not.toContain('content="base"');
  });

  it('conserva la imagen por defecto si la entidad no tiene', () => {
    const html = core.injectMeta(SHELL, { ...meta, image: undefined });
    expect(html).toContain('https://x.app/default.webp');
  });

  it('pone noindex en rutas privadas', () => {
    expect(core.injectMeta(SHELL, { ...meta, noindex: true })).toContain('content="noindex, nofollow"');
  });

  it('el JSON-LD no puede cerrar el script', () => {
    const html = core.injectMeta(SHELL, { ...meta, jsonLd: { '@type': 'Place', name: '</script><img src=x onerror=alert(1)>' } });
    const block = html.split('<script type="application/ld+json">')[1].split('</script>')[0];
    expect(block).not.toContain('<');
    expect(JSON.parse(block).name).toContain('script');
  });
});

describe('resolveRoute', () => {
  it('reconoce lugar y evento con id válido', () => {
    expect(core.resolveRoute(`/place/${ID}`)).toMatchObject({ kind: 'place', id: ID });
    expect(core.resolveRoute(`/event/${ID}/`)).toMatchObject({ kind: 'event', id: ID });
  });
  it('un id que no es UUID es desconocido (no se consulta la base)', () => {
    expect(core.resolveRoute('/place/1;drop')).toMatchObject({ kind: 'unknown' });
  });
  it('rutas públicas, privadas y desconocidas', () => {
    expect(core.resolveRoute('/').kind).toBe('static');
    expect(core.resolveRoute('/comunidad').kind).toBe('static');
    expect(core.resolveRoute('/admin').kind).toBe('private');
    expect(core.resolveRoute('/edit-place/abc').kind).toBe('private');
    expect(core.resolveRoute('/share/place/abc').kind).toBe('private');
    expect(core.resolveRoute('/no-existe').kind).toBe('unknown');
  });
});

describe('metas de entidades', () => {
  it('lugar: título con ciudad, descripción de respaldo y JSON-LD Place', () => {
    const m = core.placePageMeta({ id: ID, name: 'Café Arte', category: { name: 'Cafeterías' }, address: 'Av. Heroínas' }, SITE);
    expect(m.title).toBe('Café Arte en Cochabamba | Lugabiz');
    expect(m.description).toContain('Café Arte');
    expect(m.url).toBe(`${SITE}/place/${ID}`);
    expect(m.jsonLd).toMatchObject({ '@type': 'Place', name: 'Café Arte' });
    expect(m.jsonLd.address.addressLocality).toBe('Cochabamba');
  });

  it('evento: fechas ISO en JSON-LD', () => {
    const m = core.eventPageMeta({ id: ID, name: 'Feria', date_start: '2026-11-08', date_end: '2026-11-09', address: 'Plaza' }, SITE);
    expect(m.title).toBe('Feria, evento en Cochabamba | Lugabiz');
    expect(m.jsonLd).toMatchObject({ '@type': 'Event', startDate: '2026-11-08', endDate: '2026-11-09' });
  });
});

describe('buildSitemapXml', () => {
  it('genera urlset válido y escapa &', () => {
    const xml = core.buildSitemapXml([{ loc: `${SITE}/a?x=1&y=2`, changefreq: 'daily', priority: '0.8' }, { loc: `${SITE}/b` }]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<loc>https://lugabiz.vercel.app/a?x=1&amp;y=2</loc>');
    expect(xml).toContain('<changefreq>daily</changefreq>');
    expect(xml.match(/<url>/g)).toHaveLength(2);
  });
});
