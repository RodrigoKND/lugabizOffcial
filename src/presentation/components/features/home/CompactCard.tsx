import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TikTokCardVideo } from '@presentation/components/reusables';
import { extractTikTokVideoId } from '@infrastructure/utils/socialLinks';

interface CompactCardProps {
  image?: string;
  name: string;
  rating: number;
  category: string;
  to: string;
  tiktokUrl?: string;
}

const CompactCard: React.FC<CompactCardProps> = ({ image, name, rating, category, to, tiktokUrl }) => {
  const navigate = useNavigate();
  const tiktokId = extractTikTokVideoId(tiktokUrl);
  return (
    <motion.div
      onClick={() => navigate(to)}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="shrink-0 w-40 snap-start group relative rounded-xl overflow-hidden bg-white border border-primary-100/40 shadow-xs hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Shine sweep diagonal on hover */}
      <div
        className="absolute inset-y-0 left-0 w-2/5 z-20 pointer-events-none -translate-x-full skew-x-[-12deg] group-hover:translate-x-[420%] transition-transform duration-[560ms] ease-in-out"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)' }}
      />
      <div className="aspect-[3/4] relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
          style={{ backgroundImage: `url(${image || ''})` }} />
        {tiktokId && <TikTokCardVideo videoId={tiktokId} className="rounded-none" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-semibold text-primary-600 shadow-xs z-10">
          {category}
        </span>
        <span className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[10px] font-semibold text-white z-10">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          {rating}
        </span>
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <p className="text-white font-bold text-xs leading-tight truncate">{name}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CompactCard;
