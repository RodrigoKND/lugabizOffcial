import { Calendar, Eye, Share2, Heart, HeartOff, Navigation } from 'lucide-react';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';
import type { PlaceInfoCardProps } from '@domain/entities/PlaceDetailTypes';
import { directionsUrl } from '@infrastructure/utils/directions';
import { SocialLinksRow } from '@presentation/components/reusables';
import { PlanButton, PlansCountBadge } from '@presentation/components/features/social';
import GroupPickButton from '@presentation/components/features/social/pick/GroupPickButton';
import ReportFakePlaceAction from './ReportFakePlaceAction';

const SECONDARY_BTN = 'flex h-12 flex-1 min-w-[7.5rem] items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lg-text';

// Lo que haces con el negocio: ir (acción principal), guardar, compartir y armar un plan.
export default function PlaceInfoCard({ place, isPlaceSaved, user, onShare, onToggleSave }: PlaceInfoCardProps) {
  const directions = directionsUrl(place.latitude, place.longitude);

  const handleSave = () => {
    if (!user) { toast.error('Inicia sesión para guardar'); return; }
    onToggleSave();
  };

  return (
    <aside aria-label="Acciones del lugar" className="space-y-4 rounded-xl border-2 border-lg-text bg-lg-surface p-4 poster-shadow">
      {directions && (
        <a href={directions} target="_blank" rel="noopener noreferrer"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-lg-accent text-lg font-black text-lg-ink transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lg-text">
          <Navigation className="h-5 w-5" /> Cómo llegar
        </a>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={handleSave} aria-pressed={!!isPlaceSaved}
          className={`${SECONDARY_BTN} ${isPlaceSaved ? 'bg-lg-coral/20 text-lg-coral' : 'bg-lg-surface-2 text-lg-text'}`}>
          {isPlaceSaved ? <HeartOff className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
          {isPlaceSaved ? 'Guardado' : 'Guardar'}
        </button>
        <button onClick={onShare} className={`${SECONDARY_BTN} bg-lg-surface-2 text-lg-text`}>
          <Share2 className="h-4 w-4" /> Compartir
        </button>
        <PlanButton targetName={place.name} placeId={place.id} variant="detail" theme="light" className="!h-12 flex-1 min-w-[7.5rem] !rounded-lg !py-0 !font-bold" />
      </div>

      <GroupPickButton draft={{ key: `place:${place.id}`, placeId: place.id, name: place.name, image: place.image }} className="w-full" />

      <p className="max-w-prose whitespace-pre-line text-base leading-relaxed text-lg-text">{place.description}</p>

      {place.socialGroups && place.socialGroups.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {place.socialGroups.map(group => {
            const Icon = Icons[group.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }> | undefined;
            return (
              <li key={group.id} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-lg-surface-2 px-3 text-xs font-bold text-lg-text">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} aria-hidden="true" />
                {Icon && <Icon className="h-3.5 w-3.5 text-lg-dim" />}
                {group.name}
              </li>
            );
          })}
        </ul>
      )}

      <SocialLinksRow links={place.socialLinks} variant="light" />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t-2 border-lg-surface-2 pt-3 text-xs font-semibold text-lg-dim">
        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Desde {place.createdAt.toLocaleDateString()}</span>
        {place.viewsCount !== undefined && <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {place.viewsCount} vistas</span>}
        <PlansCountBadge count={place.plansCount} variant="light" />
      </div>

      <ReportFakePlaceAction placeId={place.id} authorId={place.authorId} userId={user?.id} />
    </aside>
  );
}
