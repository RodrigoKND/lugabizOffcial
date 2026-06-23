import { Star, Calendar, Eye, Share2, Heart, HeartOff } from 'lucide-react';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';
import type { PlaceInfoCardProps } from '@domain/entities/PlaceDetailTypes';

export default function PlaceInfoCard({ place, isPlaceSaved, user, onShare, onToggleSave }: PlaceInfoCardProps) {
  return (
    <div className="bg-white/5 rounded-3xl p-6 border border-white/8 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
          {place.name}
        </h1>
      </div>

      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-white/80">{place.rating}</span>
          <span className="text-white/35 text-sm">({place.reviewCount})</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/35 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{place.createdAt.toLocaleDateString()}</span>
        </div>
        {place.viewsCount !== undefined && (
          <div className="flex items-center gap-1.5 text-white/35 text-sm">
            <Eye className="w-4 h-4" />
            <span>{place.viewsCount}</span>
          </div>
        )}
      </div>

      <p className="text-white/55 leading-relaxed mb-6">
        {place.description}
      </p>

      {place.socialGroups && place.socialGroups.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {place.socialGroups.map((group) => {
            const Icon = Icons[group.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
            return (
              <span key={group.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: group.color }}>
                {Icon && <Icon className="w-3 h-3" />}
                {group.name}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onShare}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/6 border border-white/10 rounded-2xl text-white/55 hover:bg-white/10 hover:text-white/80 font-medium transition-all text-sm flex-1">
          <Share2 className="w-4 h-4" /> Compartir
        </button>
        <button onClick={() => {
          if (!user) { toast.error('Inicia sesión para guardar'); return; }
          onToggleSave();
        }}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border font-medium transition-all text-sm flex-1 ${
            isPlaceSaved
              ? 'bg-red-500/15 border-red-500/25 text-red-400 hover:bg-red-500/20'
              : 'bg-white/6 border-white/10 text-white/55 hover:bg-white/10 hover:text-white/80'
          }`}>
          {isPlaceSaved ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
          {isPlaceSaved ? 'Guardado' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
