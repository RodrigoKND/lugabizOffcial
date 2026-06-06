import { Link } from 'react-router-dom';

export default function PlaceNotFound() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🦕</div>
        <h2 className="text-xl font-bold text-stone-800 mb-4">Lugar no encontrado</h2>
        <Link to="/" className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-medium hover:bg-amber-600 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
