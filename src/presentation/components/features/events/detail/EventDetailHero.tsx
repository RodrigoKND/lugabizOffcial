import { useState, useCallback } from 'react';
import { Share2, X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { Event } from '@domain/entities';

interface EventDetailHeroProps {
  event: Event;
  onShare: () => void;
}

export default function EventDetailHero({ event, onShare }: EventDetailHeroProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // All images: cover + gallery extras (deduped)
  const allImages = [
    ...(event.image ? [event.image] : []),
    ...(event.gallery || []).filter(url => url !== event.image),
  ];

  const openLightbox = useCallback((idx: number) => setLightboxIdx(idx), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() => setLightboxIdx(i => (i !== null && i > 0 ? i - 1 : i)), []);
  const next = useCallback(() => setLightboxIdx(i => (i !== null && i < allImages.length - 1 ? i + 1 : i)), [allImages.length]);

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
        >
          <div
            className="relative max-w-5xl max-h-[90vh] mx-4 w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image */}
            <img
              src={allImages[lightboxIdx]}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded-2xl select-none"
            />

            {/* Prev */}
            {lightboxIdx > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-0 -translate-x-14 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}

            {/* Next */}
            {lightboxIdx < allImages.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-0 translate-x-14 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-all"
              >
                <ChevronRight className="w-5 h-5 text-white" />
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
