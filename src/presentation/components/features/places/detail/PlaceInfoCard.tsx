import { Star, Calendar, Eye, Share2, Heart, HeartOff } from 'lucide-react';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';
import type { PlaceInfoCardProps } from '@domain/entities/PlaceDetailTypes';

export default function PlaceInfoCard({ place, isPlaceSaved, user, onShare, onToggleSave }: PlaceInfoCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 leading-tight">
          {place.name}
        </h1>
      </div>

      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-stone-700">{place.rating}</span>
          <span className="text-stone-400 text-sm">({place.reviewCount})</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-400 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{place.createdAt.toLocaleDateString()}</span>
        </div>
        {place.viewsCount !== undefined && (
          <div className="flex items-center gap-1.5 text-stone-400 text-sm">
            <Eye className="w-4 h-4" />
            <span>{place.viewsCount}</span>
          </div>
        )}
      </div>

      <p className="text-stone-600 leading-relaxed mb-6">
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
          className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-600 hover:bg-stone-100 font-medium transition-all text-sm flex-1">
          <Share2 className="w-4 h-4" /> Compartir
        </button>
        <button onClick={() => {
          if (!user) { toast.error('Inicia sesión para guardar'); return; }
          onToggleSave();
        }}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border font-medium transition-all text-sm flex-1 ${
            isPlaceSaved
              ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
          }`}>
          {isPlaceSaved ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
          {isPlaceSaved ? 'Guardado' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
