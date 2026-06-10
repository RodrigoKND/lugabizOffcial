import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, MapPin, MessageSquare, BarChart3, Users } from 'lucide-react';
import { surveysService } from '@lib/supabase/services/notifications/surveys';
import { PlaceSurvey } from '@domain/entities';

interface PlaceSurveyStatsProps {
  placeId: string;
}

function StarBar({ star, count, max }: { star: number; count: number; max: number }) {
  const pct = max > 0 ? Math.round(count / max * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-stone-500 w-4 text-right shrink-0">{star}</span>
      <Star className="w-3 h-3 text-amber-400 shrink-0" />
      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
        />
      </div>
      <span className="text-[11px] text-stone-400 w-5 shrink-0">{count}</span>
    </div>
  );
}

const PlaceSurveyStats: React.FC<PlaceSurveyStatsProps> = ({ placeId }) => {
  const [surveys, setSurveys] = useState<PlaceSurvey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    surveysService.getSurveysByPlace(placeId)
      .then(setSurveys)
      .finally(() => setLoading(false));
  }, [placeId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-6 bg-stone-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (surveys.length === 0) return null;

  const total = surveys.length;
  const rated = surveys.filter(s => s.rating != null);
  const avgRating = rated.length > 0
    ? rated.reduce((sum, s) => sum + (s.rating ?? 0), 0) / rated.length
    : 0;
  const recommendations = surveys.filter(s => s.wouldRecommend).length;
  const nearby = surveys.filter(s => s.isNearby).length;
  const comments = surveys.filter(s => s.comment?.trim());

  // Distribución de estrellas
  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    star: r,
    count: rated.filter(s => s.rating === r).length,
  }));
  const maxRatingCount = Math.max(1, ...ratingDist.map(r => r.count));

  const recommendPct = total > 0 ? Math.round(recommendations / total * 100) : 0;
  const nearbyPct = total > 0 ? Math.round(nearby / total * 100) : 0;

  return (
    <div className="space-y-5">

      {/* KPIs top */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <Users className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <p className="text-[20px] font-bold text-stone-800 leading-none">{total}</p>
          <p className="text-[10px] text-stone-500 mt-0.5 font-medium">Respuestas</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <Star className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <p className="text-[20px] font-bold text-stone-800 leading-none">{avgRating.toFixed(1)}</p>
          <p className="text-[10px] text-stone-500 mt-0.5 font-medium">Promedio</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <ThumbsUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
          <p className="text-[20px] font-bold text-stone-800 leading-none">{recommendPct}%</p>
          <p className="text-[10px] text-stone-500 mt-0.5 font-medium">Recomiendan</p>
        </div>
      </div>

      {/* Rating distribution */}
      {rated.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-3.5 h-3.5 text-stone-400" />
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Distribución de estrellas</p>
          </div>
          <div className="space-y-1.5">
            {ratingDist.map(({ star, count }) => (
              <StarBar key={star} star={star} count={count} max={maxRatingCount} />
            ))}
          </div>
        </div>
      )}

      {/* Visitantes cercanos */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-3.5 h-3.5 text-stone-400" />
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Visitantes cercanos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${nearbyPct}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-gradient-to-r from-violet-400 to-violet-500 rounded-full"
            />
          </div>
          <span className="text-[12px] text-stone-500 font-medium shrink-0">
            {nearby}/{total} ({nearbyPct}%)
          </span>
        </div>
        <p className="text-[10px] text-stone-300 mt-1">Usuarios que respondieron estando en el lugar</p>
      </div>

      {/* Comentarios recientes */}
      {comments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Comentarios ({comments.length})
            </p>
          </div>
          <div className="space-y-2">
            {comments.slice(0, 5).map((s, i) => (
              <div key={s.id} className="bg-stone-50 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  {s.rating != null && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`w-2.5 h-2.5 ${j < s.rating! ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`}
                        />
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] text-stone-400 ml-auto">
                    {s.createdAt.toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-[12px] text-stone-600 leading-relaxed line-clamp-3">"{s.comment}"</p>
              </div>
            ))}
            {comments.length > 5 && (
              <p className="text-center text-[11px] text-stone-400">+{comments.length - 5} comentarios más</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceSurveyStats;
