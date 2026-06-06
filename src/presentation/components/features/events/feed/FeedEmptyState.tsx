import { Calendar, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FeedEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-white">
      <Calendar className="w-16 h-16 text-white/20 mb-4" />
      <p className="text-lg font-bold mb-1">No hay eventos</p>
      <p className="text-white/50 text-sm">Próximamente nuevos eventos</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-6 py-3 rounded-2xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
      >
        Volver
      </button>
    </div>
  );
}
