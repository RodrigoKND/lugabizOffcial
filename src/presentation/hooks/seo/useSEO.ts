import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  schema?: Record<string, unknown>;
}

export function useSEO({ title, description, image, url, type = 'website', schema }: SEOProps) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | Lugabiz`;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', `${title} | Lugabiz`, true);
    setMeta('og:description', description, true);
    setMeta('og:type', type, true);
    if (url) setMeta('og:url', url, true);
    if (image) setMeta('og:image', image, true);
    setMeta('twitter:title', `${title} | Lugabiz`, true);
    setMeta('twitter:description', description, true);
    if (image) setMeta('twitter:image', image, true);

    let schemaEl = document.getElementById('ld-json');
    if (schema) {
      if (!schemaEl) {
        schemaEl = document.createElement('script');
        schemaEl.id = 'ld-json';
        schemaEl.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schemaEl);
      }
      schemaEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        ...schema,
      });
    }

    return () => {
      document.title = previousTitle;
      if (schemaEl) schemaEl.remove();
    };
  }, [title, description, image, url, type]);
}
