import { useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PlaceGalleryProps } from '@domain/entities/PlaceDetailTypes';
import { CdnImage } from '@presentation/components/reusables';

export default function PlaceGallery({ place, galleryIdx, onThumbnailClick, onClose, onPrev, onNext }: PlaceGalleryProps) {
  const hasGallery = place.gallery && place.gallery.length > 1;
  const touchStartX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (galleryIdx === null || !place.gallery) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    if (diff > 0 && galleryIdx < place.gallery.length - 1) onNext();
    if (diff < 0 && galleryIdx > 0) onPrev();
  };

  return (
    <>
      {hasGallery && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {place.gallery!.map((url, i) => (
            <button key={i} onClick={() => onThumbnailClick(i)}
              className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all hover:opacity-90 ${url === place.image ? 'border-amber-400' : 'border-transparent'}`}>
              <CdnImage src={url} width={160} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {galleryIdx !== null && place.gallery && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="relative max-w-4xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <CdnImage src={place.gallery[galleryIdx]} width={1920} priority alt="" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
            {galleryIdx > 0 && (
              <button onClick={onPrev}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-all">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            {galleryIdx < place.gallery.length - 1 && (
              <button onClick={onNext}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-all">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            )}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
              {place.gallery.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === galleryIdx ? 'bg-white w-4' : 'bg-white/40'}`} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
