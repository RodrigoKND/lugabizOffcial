import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  schema?: Record<string, unknown>;
}

function toAbsolute(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return new URL(url, window.location.origin).href;
}

export function useSEO({ title, description, image, url, type = 'website', schema }: SEOProps) {
  useEffect(() => {
    const previousTitle = document.title;
    const fullTitle = `${title} | Lugabiz`;
    document.title = fullTitle;

    const absUrl = url ? toAbsolute(url) : window.location.href;
    const absImage = image ? toAbsolute(image) : '';

    const setMeta = (attrName: string, value: string, attrType: 'name' | 'property' = 'name') => {
      const selector = `meta[${attrType}="${attrName}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrType, attrName);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    const removeMeta = (attrName: string, attrType: 'name' | 'property' = 'name') => {
      const el = document.querySelector(`meta[${attrType}="${attrName}"]`);
      if (el) el.remove();
    };

    setMeta('description', description, 'name');
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', absUrl, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:locale', 'es_BO', 'property');

    if (absImage) {
      setMeta('og:image', absImage, 'property');
      setMeta('og:image:width', '1200', 'property');
      setMeta('og:image:height', '630', 'property');
      setMeta('og:image:alt', title, 'property');
    } else {
      removeMeta('og:image', 'property');
      removeMeta('og:image:width', 'property');
      removeMeta('og:image:height', 'property');
      removeMeta('og:image:alt', 'property');
    }

    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:title', fullTitle, 'name');
    setMeta('twitter:description', description, 'name');
    if (absImage) {
      setMeta('twitter:image', absImage, 'name');
      setMeta('twitter:image:alt', title, 'name');
    }

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) canonical.href = absUrl;

    let schemaEl = document.getElementById('ld-json') as HTMLScriptElement | null;
    if (schema) {
      if (!schemaEl) {
        schemaEl = document.createElement('script');
        schemaEl.id = 'ld-json';
        schemaEl.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schemaEl);
      }
      schemaEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        ...(absImage ? { image: absImage } : {}),
        ...schema,
      });
    }

    return () => {
      document.title = previousTitle;
      if (schemaEl && schema) schemaEl.remove();
      const toRestore = [
        ['description', 'name'],
        ['og:title', 'property'],
        ['og:description', 'property'],
        ['og:url', 'property'],
        ['og:type', 'property'],
        ['og:image', 'property'],
        ['og:image:width', 'property'],
        ['og:image:height', 'property'],
        ['og:image:alt', 'property'],
        ['twitter:title', 'name'],
        ['twitter:description', 'name'],
        ['twitter:image', 'name'],
        ['twitter:image:alt', 'name'],
      ] as const;
      toRestore.forEach(([n, t]) => {
        const el = document.querySelector(`meta[${t}="${n}"]`);
        if (el && el.getAttribute('content')?.includes('Lugabiz')) el.remove();
      });
    };
  }, [title, description, image, url, type]);
}
