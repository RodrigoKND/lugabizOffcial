import { motion } from 'framer-motion';
import { Star, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TikTokBadge } from '@presentation/components/reusables';
import { extractTikTokVideoId } from '@infrastructure/utils/socialLinks';
import { PlanButton } from '@presentation/components/features/social';

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

const CompactCard: React.FC<CompactCardProps> = ({ image, name, rating, category, to, tiktokUrl, placeId, eventId, socialGroup: group }) => {
  const navigate = useNavigate();
  const tiktokId = extractTikTokVideoId(tiktokUrl);
  const groupIsEmoji = !!group?.icon && group.icon.length <= 4;

  return (
    <motion.div
      onClick={() => navigate(to)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="shrink-0 w-40 sm:w-44 snap-start group relative rounded-2xl bg-white p-2 ring-1 ring-primary-100/70 shadow-[0_2px_12px_rgba(80,50,140,0.08)] hover:shadow-[0_10px_28px_rgba(80,50,140,0.16)] transition-shadow cursor-pointer"
    >
      <div className="aspect-[4/3] relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
          style={{ backgroundImage: `url(${image || ''})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        {category && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold text-white bg-linear-to-r from-primary-500 to-pink-500 shadow-sm z-10">
            {category}
          </span>
        )}

        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          {tiktokId && <TikTokBadge className="w-5 h-5" />}
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[10px] font-semibold text-white">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            {rating}
          </span>
        </div>
      </div>

      <div className="pt-2 pb-1 px-1 flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="text-[#241b3e] font-bold text-[13px] leading-tight truncate">{name}</p>
          {group?.name ? (
            <p className="text-stone-400 text-[10px] font-medium flex items-center gap-1 mt-0.5">
              {groupIsEmoji ? (
                <span className="text-[10px] leading-none">{group.icon}</span>
              ) : (
                <Users className="w-3 h-3 shrink-0" />
              )}
              <span className="truncate">{group.name}</span>
            </p>
          ) : (
            <p className="text-stone-400 text-[10px] font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{category || 'Lugar'}</span>
            </p>
          )}
        </div>
        {(placeId || eventId) && <PlanButton targetName={name} placeId={placeId} eventId={eventId} className="w-7 h-7 shrink-0" />}
      </div>
    </motion.div>
  );
};

export default CompactCard;
