import { useState } from 'react';
import { Pencil, Trash2, Play, Star } from 'lucide-react';
import type { PlaceImageSectionProps } from '@domain/entities/PlaceDetailTypes';
import { TikTokVideoModal, CdnImage } from '@presentation/components/reusables';
import { extractTikTokVideoId } from '@infrastructure/utils/socialLinks';
import { posterTheme, headlineSize } from '@presentation/components/features/cartel/posterTheme';

const OWNER_BTN = 'flex h-11 w-11 items-center justify-center rounded-full bg-lg-ink/80 text-lg-text transition-transform hover:bg-lg-ink active:scale-90 focus-visible:outline-2 focus-visible:outline-lg-accent';

// Portada del negocio como cartel: foto con trama y nombre grande en bloque de color con su puntuación.
export default function PlaceImageSection({ place, user, onEdit, onDeleteClick }: PlaceImageSectionProps) {
  const tiktokId = extractTikTokVideoId(place.socialLinks?.tiktok);
  const [videoOpen, setVideoOpen] = useState(false);
  const theme = posterTheme(place.category?.name);

  return (
    <div className="overflow-hidden rounded-xl border-2 border-lg-text bg-lg-surface poster-shadow">
      <div className="relative aspect-[4/3] overflow-hidden bg-lg-surface-2 sm:aspect-video">
        <CdnImage src={place.image} width={1080} priority alt={place.name} className="h-full w-full object-cover" />
        <div className="poster-halftone absolute inset-0" aria-hidden="true" />

        <div className="absolute -left-1 top-3 z-10 flex flex-col items-start gap-1">
          <span className={`px-3 py-1 text-xs sticker-tag ${theme.bg} ${theme.ink}`}>{place.category.name}</span>
          {place.featured && <span className="bg-lg-maiz px-3 py-1 text-xs text-lg-ink sticker-tag">Destacado</span>}
        </div>

        {user?.id === place.authorId && (
          <div className="absolute right-3 top-3 z-10 flex gap-2">
            <button onClick={onEdit} aria-label="Editar lugar" className={OWNER_BTN}><Pencil className="h-4 w-4" /></button>
            <button onClick={onDeleteClick} aria-label="Eliminar lugar" className={`${OWNER_BTN} !text-lg-coral`}><Trash2 className="h-4 w-4" /></button>
          </div>
        )}

        {tiktokId && (
          <button onClick={() => setVideoOpen(true)}
            className="absolute bottom-3 right-3 z-10 flex h-11 items-center gap-2 rounded-full bg-lg-ink px-4 text-sm font-bold text-lg-text transition-transform active:scale-95">
            <Play className="h-4 w-4 fill-lg-text" /> Ver video
          </button>
        )}
      </div>

      <div className={`border-t-2 border-lg-text px-4 py-3 ${theme.bg} ${theme.ink}`}>
        <h1 className={`font-flyer text-balance ${headlineSize(place.name, true)}`}>{place.name}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm font-bold">
          <Star className="h-4 w-4 fill-lg-ink" /> {place.rating}
          <span className="font-semibold">({place.reviewCount} {place.reviewCount === 1 ? 'reseña' : 'reseñas'})</span>
        </p>
      </div>

      {tiktokId && (
        <TikTokVideoModal open={videoOpen} onClose={() => setVideoOpen(false)} videoId={tiktokId} videoUrl={place.socialLinks!.tiktok!} />
      )}
    </div>
  );
}
