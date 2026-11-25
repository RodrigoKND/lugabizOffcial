import { useState } from 'react';
import { Images, Play } from 'lucide-react';
import { Event } from '@domain/entities';
import { TikTokVideoModal, CdnImage } from '@presentation/components/reusables';
import { extractTikTokVideoId } from '@infrastructure/utils/socialLinks';
import { posterTheme, headlineSize } from '@presentation/components/features/cartel/posterTheme';
import ImageLightbox from '@presentation/components/reusables/ImageLightbox';

interface EventDetailHeroProps {
  event: Event;
  formattedDate: string;
}

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?w=800';

// Portada del evento como cartel: foto con trama y titular grande en bloque de color (mismo lenguaje que las tarjetas).
export default function EventDetailHero({ event, formattedDate }: EventDetailHeroProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const tiktokId = extractTikTokVideoId(event.socialLinks?.tiktok);
  const theme = posterTheme(event.category?.name);

  // Portada + galería, sin repetir
  const allImages = [
    ...(event.image ? [event.image] : []),
    ...(event.gallery || []).filter(url => url !== event.image),
  ];

  return (
    <>
      <div className="overflow-hidden rounded-xl border-2 border-lg-text bg-lg-surface poster-shadow">
        <div className="group relative aspect-[4/3] cursor-pointer overflow-hidden bg-lg-surface-2 sm:aspect-video" onClick={() => setLightboxIdx(0)}>
          <CdnImage src={event.image || FALLBACK_COVER} width={1080} priority alt={event.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="poster-halftone absolute inset-0" aria-hidden="true" />

          {event.category && (
            <span className={`absolute -left-1 top-3 z-10 px-3 py-1 text-xs sticker-tag ${theme.bg} ${theme.ink}`}>{event.category.name}</span>
          )}

          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            {allImages.length > 1 && (
              <span className="flex h-11 items-center gap-1.5 rounded-full bg-lg-ink/80 px-3 text-xs font-bold text-lg-text">
                <Images className="h-4 w-4" /> {allImages.length}
              </span>
            )}
            {tiktokId && (
              <button onClick={e => { e.stopPropagation(); setVideoOpen(true); }}
                className="flex h-11 items-center gap-2 rounded-full bg-lg-ink px-4 text-sm font-bold text-lg-text transition-transform active:scale-95">
                <Play className="h-4 w-4 fill-lg-text" /> Ver video
              </button>
            )}
          </div>
        </div>

        <div className={`border-t-2 border-lg-text px-4 py-3 ${theme.bg} ${theme.ink}`}>
          <h1 className={`font-flyer text-balance ${headlineSize(event.name, true)}`}>{event.name}</h1>
          <p className="mt-2 text-sm font-bold">
            {formattedDate} · {event.timeStart}{event.timeEnd ? ` – ${event.timeEnd}` : ''}
          </p>
        </div>
      </div>

      {tiktokId && (
        <TikTokVideoModal open={videoOpen} onClose={() => setVideoOpen(false)} videoId={tiktokId} videoUrl={event.socialLinks!.tiktok!} />
      )}

      {allImages.length > 1 && (
        <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
          {allImages.map((url, i) => (
            <button key={i} onClick={() => setLightboxIdx(i)} aria-label={`Ver foto ${i + 1}`}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity hover:opacity-90 ${i === 0 ? 'border-lg-accent' : 'border-transparent hover:border-lg-dim'}`}>
              <CdnImage src={url} width={160} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxIdx !== null && allImages.length > 0 && (
        <ImageLightbox images={allImages} index={lightboxIdx} onChange={setLightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </>
  );
}
