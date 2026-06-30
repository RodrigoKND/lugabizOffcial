import { useState, useCallback, useRef } from 'react';
import { Share2, X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { Event } from '@domain/entities';

interface EventDetailHeroProps {
  event: Event;
  onShare: () => void;
}

export default function EventDetailHero({ event, onShare }: EventDetailHeroProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const touchStartX = useRef(0);

  // All images: cover + gallery extras (deduped)
  const allImages = [
    ...(event.image ? [event.image] : []),
    ...(event.gallery || []).filter(url => url !== event.image),
  ];

  const openLightbox = useCallback((idx: number) => setLightboxIdx(idx), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() => setLightboxIdx(i => (i !== null && i > 0 ? i - 1 : i)), []);
  const next = useCallback(() => setLightboxIdx(i => (i !== null && i < allImages.length - 1 ? i + 1 : i)), [allImages.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  }, [next, prev]);

  return (
    <>
      {/* Cover image */}
      <div
        className="relative aspect-video rounded-3xl overflow-hidden bg-stone-100 shadow-sm cursor-pointer group"
        onClick={() => openLightbox(0)}
      >
        <img
          src={event.image || 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?w=800'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          alt={event.name}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
          >
            <Share2 className="w-5 h-5 text-stone-600" />
          </button>
          {event.category && (
            <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-sm">
              {event.category.name}
            </span>
          )}
        </div>

        {/* Gallery count badge */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Images className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-semibold">{allImages.length}</span>
          </div>
        )}
      </div>

      {/* Gallery thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allImages.map((url, i) => (
            <button
              key={i}
              onClick={() => openLightbox(i)}
              className={`shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all hover:opacity-90 hover:scale-105 ${
                i === 0 ? 'border-amber-400' : 'border-transparent hover:border-amber-300'
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Blurred background */}
          <div
            className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-110"
            style={{ backgroundImage: `url(${allImages[lightboxIdx]})` }}
          />
          <div
            className="relative max-w-5xl max-h-[90vh] mx-4 w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-0 right-0 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-all md:-top-12 md:right-0"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <img
              src={allImages[lightboxIdx]}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded-2xl select-none pointer-events-none relative z-10"
            />

            {/* Prev */}
            {lightboxIdx > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-all text-white/80 hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Next */}
            {lightboxIdx < allImages.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-all text-white/80 hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Counter + dots */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <span className="text-white/60 text-xs">{lightboxIdx + 1} / {allImages.length}</span>
              {allImages.length > 1 && (
                <div className="flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                      className={`rounded-full transition-all ${
                        i === lightboxIdx ? 'bg-white w-5 h-2' : 'bg-white/40 w-2 h-2'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
