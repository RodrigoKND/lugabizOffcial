import { useState } from 'react';
import { Pencil, Trash2, Image as ImageIcon, Play } from 'lucide-react';
import type { PlaceImageSectionProps } from '@domain/entities/PlaceDetailTypes';
import { TikTokHeroEmbed } from '@presentation/components/reusables';
import { extractTikTokVideoId } from '@infrastructure/utils/socialLinks';

export default function PlaceImageSection({ place, user, onEdit, onDeleteClick }: PlaceImageSectionProps) {
  const tiktokId = extractTikTokVideoId(place.socialLinks?.tiktok);
  const [showVideo, setShowVideo] = useState(!!tiktokId);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-white/5 aspect-4/3 lg:aspect-auto lg:h-125">
      {showVideo && tiktokId ? (
        <TikTokHeroEmbed videoId={tiktokId} videoUrl={place.socialLinks!.tiktok!} fallbackImageUrl={place.image} />
      ) : (
        <img src={place.image} alt={place.name} className="w-full h-full object-cover" loading="lazy" />
      )}
      {tiktokId && place.image && (
        <button
          onClick={() => setShowVideo(v => !v)}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-md hover:bg-white transition-colors"
        >
          {showVideo ? <><ImageIcon className="w-3.5 h-3.5" /> Ver foto</> : <><Play className="w-3.5 h-3.5" /> Ver video</>}
        </button>
      )}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
        {place.featured && (
          <span className="bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
            Destacado
          </span>
        )}
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg"
          style={{ backgroundColor: place.category.color }}>
          {place.category.name}
        </span>
        {user?.id === place.authorId && (
          <div className="flex gap-1.5 ml-auto">
            <button onClick={onEdit}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all shadow-md">
              <Pencil className="w-4 h-4 text-stone-700" />
            </button>
            <button onClick={onDeleteClick}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all shadow-md">
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
