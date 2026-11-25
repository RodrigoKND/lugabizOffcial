import { Star, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TikTokBadge } from '@presentation/components/reusables';
import { extractTikTokVideoId } from '@infrastructure/utils/socialLinks';
import { PlanButton } from '@presentation/components/features/social';
import CartelFrame from '@presentation/components/features/cartel/CartelFrame';
import VerdictRow from '@presentation/components/features/cartel/VerdictRow';
import { useCardReaction } from '@presentation/hooks/verdicts/useCardReaction';

interface CompactCardSocialGroup {
  id?: string;
  name?: string;
  icon?: string;
  color?: string;
}

interface CompactCardProps {
  image?: string;
  name: string;
  rating: number;
  category: string;
  to: string;
  tiktokUrl?: string;
  placeId?: string;
  eventId?: string;
  socialGroup?: CompactCardSocialGroup;
}

export default function CompactCard({ image, name, rating, category, to, tiktokUrl, placeId, eventId, socialGroup: group }: CompactCardProps) {
  const navigate = useNavigate();
  const tiktokId = extractTikTokVideoId(tiktokUrl);
  const groupIsEmoji = !!group?.icon && group.icon.length <= 4;
  const reaction = useCardReaction(eventId ? 'event' : 'place', eventId ?? placeId);

  return (
    <CartelFrame name={name} to={to} category={category} image={image} onClick={() => navigate(to)} reaction={reaction}
      topRight={
        <>
          {tiktokId && <TikTokBadge className="w-5 h-5" />}
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[10px] font-semibold text-white">
            <Star className="w-2.5 h-2.5 fill-lg-accent text-lg-accent" />
            {rating}
          </span>
        </>
      }
      meta={
        <div className="flex items-center justify-between gap-1">
          <p className="text-lg-dim text-[11px] font-medium flex items-center gap-1 min-w-0">
            {group?.name && groupIsEmoji ? <span className="text-[10px] leading-none">{group.icon}</span>
              : group?.name ? <Users className="w-3 h-3 shrink-0" />
              : <MapPin className="w-3 h-3 shrink-0" />}
            <span className="truncate">{group?.name || category || 'Lugar'}</span>
          </p>
          {(placeId || eventId) && <PlanButton targetName={name} placeId={placeId} eventId={eventId} className="w-7 h-7 shrink-0" />}
        </div>
      }
      footer={<VerdictRow reaction={reaction} />}
    />
  );
}
