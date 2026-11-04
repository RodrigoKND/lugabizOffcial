import { Star, Calendar, Eye, Share2, Heart, HeartOff } from 'lucide-react';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';
import type { PlaceInfoCardProps } from '@domain/entities/PlaceDetailTypes';
import { SocialLinksRow } from '@presentation/components/reusables';
import { PlanButton, PlansCountBadge } from '@presentation/components/features/social';
import ReportFakePlaceAction from './ReportFakePlaceAction';

export default function PlaceInfoCard({ place, isPlaceSaved, user, onShare, onToggleSave }: PlaceInfoCardProps) {
  return (
    <div className="bg-lg-surface rounded-3xl p-6 ring-1 ring-lg-surface-2 shadow-[0_2px_12px_rgba(80,50,140,0.08)]">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-lg-text leading-tight">
          {place.name}
        </h1>
      </div>

      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-lg-text">{place.rating}</span>
          <span className="text-lg-dim text-sm">({place.reviewCount})</span>
        </div>
        <div className="flex items-center gap-1.5 text-lg-dim text-sm">
          <Calendar className="w-4 h-4" />
          <span>{place.createdAt.toLocaleDateString()}</span>
        </div>
        {place.viewsCount !== undefined && (
          <div className="flex items-center gap-1.5 text-lg-dim text-sm">
            <Eye className="w-4 h-4" />
            <span>{place.viewsCount}</span>
          </div>
        )}
        <PlansCountBadge count={place.plansCount} variant="light" />
      </div>

      <p className="text-lg-dim leading-relaxed mb-6">
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

      <SocialLinksRow links={place.socialLinks} variant="light" className="mb-6" />

      <div className="flex flex-col sm:flex-row gap-3">
        <PlanButton targetName={place.name} placeId={place.id} variant="detail" theme="light" className="flex-1" />
        <button onClick={onShare}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-lg-surface-2 border border-lg-surface-2 rounded-2xl text-lg-dim hover:bg-lg-surface-2 hover:text-lg-text font-medium transition-all text-sm flex-1">
          <Share2 className="w-4 h-4" /> Compartir
        </button>
        <button onClick={() => {
          if (!user) { toast.error('Inicia sesión para guardar'); return; }
          onToggleSave();
        }}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border font-medium transition-all text-sm flex-1 ${
            isPlaceSaved
              ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
              : 'bg-lg-surface-2 border-lg-surface-2 text-lg-dim hover:bg-lg-surface-2 hover:text-lg-text'
          }`}>
          {isPlaceSaved ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
          {isPlaceSaved ? 'Guardado' : 'Guardar'}
        </button>
      </div>

      <ReportFakePlaceAction placeId={place.id} authorId={place.authorId} userId={user?.id} />
    </div>
  );
}
