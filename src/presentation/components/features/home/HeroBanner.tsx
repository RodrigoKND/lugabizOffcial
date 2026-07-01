import { Calendar, Clock, MapPin } from 'lucide-react';
import { getCategoryColor } from './categoryColors';

interface HeroBannerProps {
  image?: string;
  name: string;
  description: string;
  category?: string;
  date: string;
  time: string;
  address: string;
  onClick: () => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ image, name, description, category, date, time, address, onClick }) => {
  const gradient = getCategoryColor(category || '');
  return (
    <div onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[2/1] sm:aspect-[3/1]">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-500"
        style={{ backgroundImage: `url(${image || ''})` }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 p-5 sm:p-8 flex flex-col">
        <span className={`inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white bg-gradient-to-r ${gradient} shadow-xs w-fit`}>
          {category || 'Destacado'}
        </span>
        <div className="flex-1" />
        <h2 className="text-white font-bold text-lg sm:text-2xl lg:text-3xl leading-tight break-words">
          {name}
        </h2>
        <p className="text-white/70 text-xs sm:text-sm mt-1 max-w-md line-clamp-2">
          {description}
        </p>
        <div className="flex items-center gap-3 mt-2 sm:mt-3 text-[11px] text-white/60 flex-wrap">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3 shrink-0" /> {date}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 shrink-0" /> {time}</span>
          <span className="flex items-center gap-1 min-w-0 max-w-full"><MapPin className="w-3 h-3 shrink-0" /> <span className="truncate min-w-0">{address}</span></span>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
