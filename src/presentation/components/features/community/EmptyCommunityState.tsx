import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyCommunityStateProps {
  query: string;
  activeTab: 'all' | 'places' | 'events';
}

const EmptyCommunityState: React.FC<EmptyCommunityStateProps> = ({ query, activeTab }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Search className="w-9 h-9 text-primary-300" />
      </div>

      <h3 className="font-bold text-lg text-text-primary mb-2">
        {query ? `Sin resultados para "${query}"` : 'Nada por aquí aún'}
      </h3>

      <p className="text-text-secondary text-sm max-w-xs mb-6 leading-relaxed">
        {query
          ? '¡Sé el primero en publicar información sobre este lugar o evento!'
          : activeTab === 'events'
          ? 'Todavía no hay eventos registrados. ¿Organizas algo pronto?'
          : 'Todavía no hay negocios registrados. ¡Agrega el primero!'}
      </p>

      <button
        onClick={() => navigate('/add-place')}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Publicar un negocio
      </button>
    </div>
  );
};

export default EmptyCommunityState;
