import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '@presentation/context';
import { useOwnerBanner } from '@presentation/hooks/home/useOwnerBanner';

interface OwnerBannerProps {
  onLogin: () => void;
}

// Entrada visible para dueños: solo a quien aún no lo es. Sin sesión abre el registro; con sesión abre el asistente de verificación.
export default function OwnerBanner({ onLogin }: OwnerBannerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { visible, dismiss } = useOwnerBanner(!!user?.isOwner);

  if (!visible) return null;

  return (
    <aside aria-label="Registra tu negocio" className="mb-6 flex items-center gap-3 rounded-xl border-2 border-lg-text bg-lg-maiz p-3 text-lg-ink poster-shadow">
      <div className="min-w-0 flex-1">
        <p className="font-flyer-sm text-xl leading-none">¿Tienes un negocio?</p>
        <p className="mt-1 text-xs font-semibold">Sal en Lugabiz.</p>
      </div>
      <button type="button" onClick={() => (user ? navigate('/profile?verify=1') : onLogin())}
        className="h-11 shrink-0 rounded-lg bg-lg-ink px-4 text-sm font-bold text-lg-text transition-transform active:scale-95">
        Empezar
      </button>
      <button type="button" onClick={dismiss} aria-label="Cerrar"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-lg-ink/10">
        <X className="h-5 w-5" />
      </button>
    </aside>
  );
}
