import { Star, Eye, Flag, TrendingUp, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Place } from '@domain/entities';

interface BusinessSearchCardProps {
  place: Place;
  reportCount?: number;
}

function reputationLabel(rating: number, reportCount: number) {
  if (reportCount >= 5) return { label: 'Reportado', color: 'text-red-600', bg: 'bg-red-50' };
  if (rating >= 4.5) return { label: 'Excelente', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (rating >= 3.5) return { label: 'Buena reputación', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (rating >= 2.5) return { label: 'Regular', color: 'text-amber-600', bg: 'bg-amber-50' };
  return { label: 'Necesita mejoras', color: 'text-orange-600', bg: 'bg-orange-50' };
}

function updateStatus(updatedAt?: Date) {
  if (!updatedAt) return { label: 'Sin actualizar', color: 'text-stone-400' };
  const days = Math.floor((Date.now() - updatedAt.getTime()) / 86_400_000);
  if (days <= 7) return { label: 'Actualizado', color: 'text-emerald-500' };
  if (days <= 30) return { label: 'Reciente', color: 'text-blue-500' };
  if (days <= 90) return { label: 'Hace un tiempo', color: 'text-amber-500' };
  return { label: 'Desactualizado', color: 'text-red-400' };
}

const BusinessSearchCard: React.FC<BusinessSearchCardProps> = ({ place, reportCount = 0 }) => {
  const location = useLocation();
  const rep = reputationLabel(place.rating, reportCount);
  const status = updateStatus((place as any).updatedAt);

  return (
    <Link
      to={`/place/${place.id}`}
      state={{ background: location }}
      className="w-full text-left flex gap-4 p-4 bg-white rounded-2xl border border-primary-100/40 shadow-xs hover:shadow-md hover:border-primary-200 transition-all active:scale-[0.99] group"
    >
      <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-primary-50">
        {place.image ? (
          <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <TrendingUp className="w-6 h-6 text-primary-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-bold text-text-primary text-sm leading-tight truncate">{place.name}</p>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${rep.bg} ${rep.color}`}>
            {rep.label}
          </span>
        </div>

        <p className="text-[11px] text-text-secondary mb-2 line-clamp-1">{place.address}</p>

        <div className="flex items-center gap-3 flex-wrap">
          <span className={`flex items-center gap-1 text-[11px] font-medium ${status.color}`}>
            <Clock className="w-3 h-3" />
            {status.label}
          </span>

          {(place.viewsCount ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-text-secondary">
              <Eye className="w-3 h-3" />
              {place.viewsCount?.toLocaleString()}
            </span>
          )}

          <span className="flex items-center gap-1 text-[11px] text-text-secondary">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {place.rating.toFixed(1)}
            {place.reviewCount > 0 && <span className="text-stone-400">({place.reviewCount})</span>}
          </span>

          {reportCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-red-400">
              <Flag className="w-3 h-3" />
              {reportCount}
            </span>
          )}

          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">
            {place.category?.name}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BusinessSearchCard;
