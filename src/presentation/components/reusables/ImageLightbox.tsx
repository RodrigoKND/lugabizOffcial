import { useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { CdnImage, getCdnImageSrc } from '@presentation/components/reusables';

interface ImageLightboxProps {
  images: string[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}

const SWIPE_PX = 50;
const ROUND_BTN = 'absolute z-10 flex h-11 w-11 items-center justify-center rounded-full bg-lg-ink/80 text-lg-text transition-colors hover:bg-lg-ink focus-visible:outline-2 focus-visible:outline-lg-accent';

// Visor a pantalla completa: flechas, puntos y deslizar con el dedo para cambiar de foto.
export default function ImageLightbox({ images, index, onChange, onClose }: ImageLightboxProps) {
  const touchStartX = useRef(0);
  const last = images.length - 1;
  const prev = useCallback(() => onChange(Math.max(0, index - 1)), [index, onChange]);
  const next = useCallback(() => onChange(Math.min(last, index + 1)), [index, last, onChange]);

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_PX) (diff > 0 ? next : prev)();
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Galería de fotos"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-lg-ground/95"
      onClick={onClose}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={handleTouchEnd}>
      <div className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-3xl"
        style={{ backgroundImage: `url(${getCdnImageSrc(images[index], 256, 40)})` }} />
      <div className="relative mx-4 flex max-h-[90vh] w-full max-w-5xl items-center justify-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Cerrar galería" className={`${ROUND_BTN} right-0 top-0 md:-top-14`}>
          <X className="h-5 w-5" />
        </button>

        <CdnImage src={images[index]} width={1920} priority alt=""
          className="pointer-events-none relative z-10 max-h-[80vh] max-w-full select-none rounded-xl border-2 border-lg-text object-contain" />

        {index > 0 && (
          <button onClick={e => { e.stopPropagation(); prev(); }} aria-label="Foto anterior" className={`${ROUND_BTN} left-2 top-1/2 -translate-y-1/2 md:left-4`}>
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {index < last && (
          <button onClick={e => { e.stopPropagation(); next(); }} aria-label="Foto siguiente" className={`${ROUND_BTN} right-2 top-1/2 -translate-y-1/2 md:right-4`}>
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        <div className="absolute -bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="text-xs font-semibold text-lg-dim">{index + 1} / {images.length}</span>
          <div className="flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); onChange(i); }} aria-label={`Ver foto ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-5 bg-lg-accent' : 'w-2 bg-lg-dim/50'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
