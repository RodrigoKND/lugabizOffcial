import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { Place } from '@domain/entities';

interface SavedPlacesTabProps {
  places: Place[];
}

const SavedPlacesTab: React.FC<SavedPlacesTabProps> = ({ places }) => {
  const navigate = useNavigate();

  if (places.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">0 lugares guardados</p>
        <div className="bg-white rounded-2xl p-12 text-center border border-primary-100/40">
          <Bookmark className="w-10 h-10 text-primary-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-primary mb-1">Tu colección está vacía</h3>
          <p className="text-sm text-text-secondary mb-5">Explora y guarda lugares que te gusten</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-600 transition-all">
            Explorar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">{places.length} lugares guardados</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {places.map(place => (
          <button key={place.id} onClick={() => navigate(`/place/${place.id}`)}
            className="group relative rounded-xl overflow-hidden bg-white border border-primary-100/40 shadow-xs hover:shadow-md transition-all active:scale-[0.97]">
            <div className="aspect-[4/3] relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                style={{ backgroundImage: `url(${place.image || ''})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 z-10">
                <p className="text-white font-semibold text-xs truncate">{place.name}</p>
                <p className="text-white/60 text-[10px]">{place.category?.name}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SavedPlacesTab;
