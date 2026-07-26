import React from 'react';

// Debe coincidir con vercel.json → images.domains
const OPTIMIZABLE_HOSTS = ['fmujhdpqbmbfcottifpc.supabase.co'];
const MAX_WIDTH = 1920;

function isOptimizable(src: string): boolean {
  try {
    const url = new URL(src, window.location.origin);
    return OPTIMIZABLE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

function vercelImageUrl(src: string, width: number, quality: number): string {
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

/**
 * Igual que <CdnImage> pero devuelve solo la URL, para casos donde no se
 * puede usar el componente (ej. motion.img, backgroundImage inline).
 */
export function getCdnImageSrc(src: string, width = 640, quality = 75): string {
  if (import.meta.env.DEV || !isOptimizable(src)) return src;
  return vercelImageUrl(src, width, quality);
}

export interface CdnImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width'> {
  src?: string | null;
  /** Ancho de render aproximado en px, usado para elegir el tamaño servido por el CDN. */
  width?: number;
  /** 1-100, default 75. */
  quality?: number;
  /** Salta el lazy-loading para imágenes above-the-fold (hero, LCP). */
  priority?: boolean;
}

/**
 * <img> que sirve imágenes de Supabase Storage a través del endpoint de
 * Image Optimization de Vercel (/_vercel/image): redimensiona, comprime y
 * convierte a AVIF/WebP en el edge. En dev (donde ese endpoint no existe)
 * cae de vuelta a la URL original.
 */
const CdnImage: React.FC<CdnImageProps> = ({
  src, width = 640, quality = 75, priority = false, sizes, loading, decoding, ...rest
}) => {
  if (!src) return null;

  const loadingAttr = loading ?? (priority ? 'eager' : 'lazy');
  const decodingAttr = decoding ?? 'async';

  if (import.meta.env.DEV || !isOptimizable(src)) {
    return <img src={src} loading={loadingAttr} decoding={decodingAttr} {...rest} />;
  }

  const widths = Array.from(new Set(
    [width, Math.round(width * 1.5), width * 2].map(w => Math.min(w, MAX_WIDTH))
  ));
  const srcSet = widths.map(w => `${vercelImageUrl(src, w, quality)} ${w}w`).join(', ');

  return (
    <img
      src={vercelImageUrl(src, width, quality)}
      srcSet={srcSet}
      sizes={sizes || `${width}px`}
      loading={loadingAttr}
      decoding={decodingAttr}
      {...rest}
    />
  );
};

export default CdnImage;
