import { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@presentation/context';
import CreatePlanModal from './CreatePlanModal';

interface PlanButtonProps {
  targetName: string;
  placeId?: string;
  eventId?: string;
  variant?: 'card' | 'detail';
  theme?: 'dark' | 'light';
  className?: string;
}

const DETAIL_THEME_CLASSES = {
  dark: 'bg-white/6 border-white/10 text-white/55 hover:bg-white/10 hover:text-white/80',
  light: 'bg-primary-50 border-primary-100 text-primary-600 hover:bg-primary-100',
};

const PlanButton: React.FC<PlanButtonProps> = ({ targetName, placeId, eventId, variant = 'card', theme = 'dark', className = '' }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { toast.error('Inicia sesión para crear un plan'); return; }
    setIsOpen(true);
  };

  if (variant === 'detail') {
    return (
      <>
        <button onClick={handleClick}
          className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-2xl font-medium transition-all text-sm ${DETAIL_THEME_CLASSES[theme]} ${className}`}>
          <CalendarPlus className="w-4 h-4" /> Planes
        </button>
        <CreatePlanModal isOpen={isOpen} onClose={() => setIsOpen(false)} targetName={targetName} placeId={placeId} eventId={eventId} />
      </>
    );
  }

  return (
    <>
      <button onClick={handleClick} aria-label="Crear plan"
        className={`w-9 h-9 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-colors ${className}`}>
        <CalendarPlus className="w-4 h-4" />
      </button>
      <CreatePlanModal isOpen={isOpen} onClose={() => setIsOpen(false)} targetName={targetName} placeId={placeId} eventId={eventId} />
    </>
  );
};

export default PlanButton;
