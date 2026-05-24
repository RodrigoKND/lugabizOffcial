import { Star } from 'lucide-react';

interface CompactCardProps {
  image?: string;
  name: string;
  rating: number;
  category: string;
  onClick: () => void;
}

const CompactCard: React.FC<CompactCardProps> = ({ image, name, rating, category, onClick }) => (
  <button onClick={onClick}
    className="shrink-0 w-40 snap-start group relative rounded-xl overflow-hidden bg-white border border-primary-100/40 shadow-xs hover:shadow-md transition-all active:scale-[0.97]">
    <div className="aspect-[3/4] relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
        style={{ backgroundImage: `url(${image || ''})` }} />
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
  </button>
);

export default CompactCard;
