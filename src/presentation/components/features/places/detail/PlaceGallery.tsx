import type { PlaceGalleryProps } from '@domain/entities/PlaceDetailTypes';
import { CdnImage } from '@presentation/components/reusables';
import ImageLightbox from '@presentation/components/reusables/ImageLightbox';

// Miniaturas de la galería + visor a pantalla completa (el mismo del detalle de evento).
export default function PlaceGallery({ place, galleryIdx, onThumbnailClick, onClose }: PlaceGalleryProps) {
  const gallery = place.gallery ?? [];

  return (
    <>
      {gallery.length > 1 && (
        <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
          {gallery.map((url, i) => (
            <button key={i} onClick={() => onThumbnailClick(i)} aria-label={`Ver foto ${i + 1}`}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity hover:opacity-90 ${url === place.image ? 'border-lg-accent' : 'border-transparent hover:border-lg-dim'}`}>
              <CdnImage src={url} width={160} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {galleryIdx !== null && gallery.length > 0 && (
        <ImageLightbox images={gallery} index={galleryIdx} onChange={onThumbnailClick} onClose={onClose} />
      )}
    </>
  );
}
