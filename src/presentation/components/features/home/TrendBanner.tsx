import { Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Place } from '@domain/entities';

interface TrendBannerProps {
  places: Place[];
}

const TrendBanner: React.FC<TrendBannerProps> = ({ places }) => {
  const navigate = useNavigate();
  if (places.length === 0) return null;
  const top = places[0];
  return (
    <div
      onClick={() => navigate(`/place/${top.id}`)}
      className="relative rounded-2xl overflow-hidden cursor-pointer group mb-7 aspect-2/1 sm:aspect-4/1 block"
    >
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-500"
        style={{ backgroundImage: `url(${top.image || ''})` }} />
      <div className="absolute inset-0 bg-linear-to-r from-primary-900/80 via-primary-800/40 to-transparent" />
      <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-center">
        <span className="flex items-center gap-1.5 text-primary-200 text-xs font-semibold mb-2">
          <Zap className="w-3.5 h-3.5 fill-primary-300 text-primary-300" />
          #1 EN TENDENCIA
        </span>
        <h2 className="text-white font-bold text-xl sm:text-3xl leading-tight max-w-lg">
          {top.name}
        </h2>
        <p className="text-white/60 text-xs sm:text-sm mt-1 max-w-md line-clamp-1">
          {top.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-white text-xs font-semibold">{top.rating}</span>
          <span className="text-white/40 text-[10px]">· {top.category?.name}</span>
        </div>
      </div>
    </div>
  );
};

export default TrendBanner;
