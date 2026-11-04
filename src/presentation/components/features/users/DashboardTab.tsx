import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Star, Megaphone, BarChart3 } from 'lucide-react';
import { Place, Event, MarketSurvey } from '@domain/entities';
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
  const upcomingEvents = myEvents.filter(e => new Date(e.dateStart) > new Date());
  const totalAttendees = myEvents.reduce((a, e) => a + e.attendeesCount, 0);

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
          className="w-full py-3 bg-lg-accent text-lg-ink rounded-xl font-semibold text-sm hover:bg-lg-accent transition-all flex items-center justify-center gap-2 shadow-xs">
          <Megaphone className="w-4 h-4" /> Enviar Anuncio
        </button>
        <button onClick={onSurveyCreate}
          className="w-full py-3 bg-lg-accent text-lg-ink rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-xs">
          <BarChart3 className="w-4 h-4" /> Crear Encuesta
        </button>
      </div>
      {mySurveys.length > 0 && (
        <div className="bg-lg-surface rounded-xl p-4 border border-lg-surface-2">
          <h3 className="font-semibold text-sm text-lg-text mb-3">Tus Encuestas ({mySurveys.length})</h3>
          <div className="space-y-2">
            {mySurveys.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-lg-surface-2 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-lg-text truncate">{s.title}</p>
                  <p className="text-[11px] text-lg-dim">{s.responseCount} respuestas</p>
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
        <div className="bg-lg-surface rounded-xl p-4 border border-lg-surface-2">
          <h3 className="font-semibold text-sm text-lg-text mb-3">Tus lugares ({myPlaces.length})</h3>
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
    </div>
  );
};

export default DashboardTab;
