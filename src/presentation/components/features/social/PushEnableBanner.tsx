import { useState } from 'react';
import { BellRing, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@presentation/hooks/usePushNotifications';

// Casi toda la feature "Planes" (solicitudes, invitaciones, respuestas) se
// avisa por push — sin permiso concedido, el usuario se pierde todo lo que no
// vea abriendo la app a mano. Este banner aparece en los puntos donde más
// importa (crear plan, agregar amigos) para maximizar cuántos lo activan.
function getPermission(): NotificationPermission {
  return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'granted';
}

interface PushEnableBannerProps {
  className?: string;
}

const PushEnableBanner: React.FC<PushEnableBannerProps> = ({ className = '' }) => {
  const { enablePushNotifications } = usePushNotifications();
  const [permission, setPermission] = useState<NotificationPermission>(getPermission());
  const [isLoading, setIsLoading] = useState(false);

  if (permission === 'granted') return null;

  const handleEnable = async () => {
    setIsLoading(true);
    await enablePushNotifications();
    setPermission(getPermission());
    setIsLoading(false);
  };

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-primary-50 border border-primary-100/60 ${className}`}>
      <BellRing className="w-4 h-4 text-primary-500 shrink-0" />
      <p className="text-[11px] text-primary-700 flex-1 leading-snug font-medium">
        {permission === 'denied'
          ? 'Las notificaciones están bloqueadas: activalas desde el candado del navegador para no perderte respuestas.'
          : 'Activá las notificaciones para enterarte al instante de solicitudes e invitaciones.'}
      </p>
      {permission !== 'denied' && (
        <button onClick={handleEnable} disabled={isLoading}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-primary-600 text-white rounded-lg text-[10px] font-bold hover:bg-primary-700 transition-colors disabled:opacity-60">
          {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          Activar
        </button>
      )}
    </div>
  );
};

export default PushEnableBanner;
