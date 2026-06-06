import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Star, Megaphone, BarChart3, Share2, ExternalLink } from 'lucide-react';
import { Place, Event, MarketSurvey, PlaceShareConfirmation } from '@domain/entities';
import { placeSharesService } from '@lib/supabase';
import { useAuth } from '@presentation/context';
import StatCard from './StatCard';

interface DashboardTabProps {
  myPlaces: Place[];
  myEvents: Event[];
  mySurveys: MarketSurvey[];
  onAnnouncement: () => void;
  onSurveyCreate: () => void;
  onSurveyStats: (survey: MarketSurvey) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ myPlaces, myEvents, mySurveys, onAnnouncement, onSurveyCreate, onSurveyStats }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const upcomingEvents = myEvents.filter(e => new Date(e.dateStart) > new Date());
  const totalAttendees = myEvents.reduce((a, e) => a + e.attendeesCount, 0);
  const [sharedConfirmations, setSharedConfirmations] = useState<{ shareId: string; placeId: string; confirmations: PlaceShareConfirmation[] }[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const shares = await placeSharesService.getSharesByUser(user.id);
        const results = await Promise.all(
          shares.map(async (s) => {
            const confirmations = await placeSharesService.getConfirmations(s.id);
            return { shareId: s.id, placeId: s.placeId, confirmations };
          })
        );
        setSharedConfirmations(results.filter(r => r.confirmations.length > 0));
      } catch {}
    })();
  }, [user]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={MapPin} label="Lugares" value={myPlaces.length} />
        <StatCard icon={Calendar} label="Eventos" value={myEvents.length} />
        <StatCard icon={Users} label="Asistentes" value={totalAttendees} color="text-pink-500" />
        <StatCard icon={Star} label="Próximos" value={upcomingEvents.length} color="text-amber-500" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={onAnnouncement}
          className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-xs">
          <Megaphone className="w-4 h-4" /> Enviar Anuncio
        </button>
        <button onClick={onSurveyCreate}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-xs">
          <BarChart3 className="w-4 h-4" /> Crear Encuesta
        </button>
      </div>
      {mySurveys.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <h3 className="font-semibold text-sm text-stone-800 mb-3">Tus Encuestas ({mySurveys.length})</h3>
          <div className="space-y-2">
            {mySurveys.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-700 truncate">{s.title}</p>
                  <p className="text-[11px] text-stone-400">{s.responseCount} respuestas</p>
                </div>
                <button onClick={() => onSurveyStats(s)}
                  className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-200 transition-colors shrink-0">
                  Ver Stats
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {myPlaces.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-primary-100/40">
          <h3 className="font-semibold text-sm text-text-primary mb-3">Tus lugares ({myPlaces.length})</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {myPlaces.slice(0, 20).map(place => (
              <button key={place.id} onClick={() => navigate(`/place/${place.id}`)}
                className="snap-start shrink-0 w-28 aspect-[4/3] rounded-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundImage: `url(${place.image || ''})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-1.5 left-1.5 right-1.5 text-white font-semibold text-[10px] truncate">{place.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {sharedConfirmations.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-purple-100/40">
          <h3 className="font-semibold text-sm text-text-primary mb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-purple-500" />
            Confirmaciones de lugares compartidos
          </h3>
          <div className="space-y-3">
            {sharedConfirmations.map((sc) => {
              const place = myPlaces.find(p => p.id === sc.placeId);
              return (
                <div key={sc.shareId} className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/40">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-stone-700 truncate">
                      {place?.name || 'Lugar'}
                    </p>
                    {place && (
                      <button onClick={() => navigate(`/place/${place.id}`)}
                        className="text-[10px] font-semibold text-purple-500 hover:text-purple-600 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Ver
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {sc.confirmations.slice(0, 10).map((c) => (
                      <div key={c.id} className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-purple-100">
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
                    {sc.confirmations.length > 10 && (
                      <span className="text-[10px] text-stone-400">+{sc.confirmations.length - 10} más</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTab;
