import { useNavigate } from 'react-router-dom';

export default function EventDetailNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center space-y-4">
      <div className="text-6xl">🦕</div>
      <p className="text-stone-500 font-medium">Evento no encontrado</p>
      <button onClick={() => navigate('/')} className="text-amber-600 font-bold hover:text-amber-700">Volver al inicio</button>
    </div>
  );
}
