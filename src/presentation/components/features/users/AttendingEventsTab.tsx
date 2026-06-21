import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Share2, ExternalLink } from 'lucide-react';
import { Event, PlaceShareConfirmation } from '@domain/entities';
import { placeSharesService } from '@lib/supabase';
import { useAuth } from '@presentation/context';

interface AttendingEventsTabProps {
  events: Event[];
}

interface SharedConfirmation {
  shareId: string;
  placeId: string;
  placeName?: string;
  confirmations: PlaceShareConfirmation[];
}

const AttendingEventsTab: React.FC<AttendingEventsTabProps> = ({ events }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sharedConfirmations, setSharedConfirmations] = useState<SharedConfirmation[]>([]);

  // Lugares que el usuario compartió y la gente que confirmó que irá con él.
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const shares = await placeSharesService.getSharesByUser(user.id);
        const results = await Promise.all(
          shares.map(async (s) => ({
            shareId: s.id,
            placeId: s.placeId,
            placeName: s.placeName,
            confirmations: await placeSharesService.getConfirmations(s.id),
          }))
        );
        setSharedConfirmations(results.filter(r => r.confirmations.length > 0));
      } catch {}
    })();
  }, [user]);

  const isEmpty = events.length === 0 && sharedConfirmations.length === 0;

  if (isEmpty) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">0 confirmaciones</p>
        <div className="bg-white rounded-2xl p-12 text-center border border-primary-100/40">
          <CheckCircle2 className="w-10 h-10 text-primary-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-primary mb-1">No asistes a nada todavía</h3>
          <p className="text-xs text-text-secondary mb-4">Confirma tu asistencia a eventos o comparte un lugar para que tus amigos confirmen ir contigo.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-600 transition-all">
            Explorar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Eventos a los que asistirá */}
      {events.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">{events.length} {events.length === 1 ? 'evento' : 'eventos'}</p>
          <div className="space-y-2">
            {events.slice(0, 30).map(event => (
              <Link key={event.id} to={`/event/${event.id}`}
                className="block bg-white rounded-xl p-4 border border-primary-100/40 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary-50 shrink-0">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${event.image || ''})` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-text-primary truncate">{event.name}</h4>
                    <p className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3 h-3" /> {event.dateStart.toLocaleDateString()} | {event.timeStart}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lugares que compartió y quién confirmó ir con él */}
      {sharedConfirmations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-purple-500" />
            Lugares que compartiste
          </p>
          <div className="space-y-3">
            {sharedConfirmations.map((sc) => (
              <div key={sc.shareId} className="bg-white rounded-xl p-4 border border-purple-100/40">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-sm font-semibold text-text-primary truncate">
                    {sc.placeName || 'Lugar'}
                  </h4>
                  <button onClick={() => navigate(`/place/${sc.placeId}`)}
                    className="text-[11px] font-semibold text-purple-500 hover:text-purple-600 flex items-center gap-1 shrink-0">
                    <ExternalLink className="w-3 h-3" /> Ver
                  </button>
                </div>
                <p className="text-[11px] text-text-secondary mb-2">
                  {sc.confirmations.length} {sc.confirmations.length === 1 ? 'persona confirmó' : 'personas confirmaron'} ir contigo
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {sc.confirmations.slice(0, 12).map((c) => (
                    <div key={c.id} className="flex items-center gap-1 px-2 py-1 bg-purple-50/60 rounded-full border border-purple-100">
                      {c.userAvatar ? (
                        <img src={c.userAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-purple-200 text-[8px] font-bold text-purple-700 flex items-center justify-center">
                          {c.userName?.charAt(0) || '?'}
                        </div>
                      )}
                      <span className="text-[10px] font-medium text-purple-700">{c.userName}</span>
                    </div>
                  ))}
                  {sc.confirmations.length > 12 && (
                    <span className="text-[10px] text-stone-400">+{sc.confirmations.length - 12} más</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendingEventsTab;
