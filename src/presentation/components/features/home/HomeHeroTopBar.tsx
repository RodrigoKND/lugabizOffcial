import { Search, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@presentation/context';
import { useUnreadSurveys } from '@presentation/hooks/useSurveys';
import { CdnImage } from '@presentation/components/reusables';

// Solo mobile: el top bar de escritorio (Navbar.tsx) ya cubre logo+búsqueda+
// notificaciones+avatar ahí. En mobile ese bar no existe (solo la nav inferior),
// así que esta fila lo replica dentro del hero de la Home, sin duplicar en desktop.
const HomeHeroTopBar: React.FC = () => {
  const { user, unreadCount } = useAuth();
  const { unreadCount: surveyUnread } = useUnreadSurveys();
  const totalUnread = unreadCount + surveyUnread;

  const openSearch = () => document.dispatchEvent(new CustomEvent('lugabiz:open-search'));
  const openNotifications = () => document.dispatchEvent(new CustomEvent('lugabiz:open-notifications'));

  return (
    <div className="md:hidden relative z-20 flex items-center justify-between mb-6">
      <div>
        <span className="font-flyer text-2xl text-lg-text">Luga<span className="text-lg-accent">biz</span></span>
        <p className="text-[11px] text-lg-dim mt-1">
          Descubre. Conecta. Vive Cochabamba <span className="text-lg-accent">♥</span>
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={openSearch} aria-label="Buscar"
          className="w-10 h-10 rounded-full bg-lg-surface flex items-center justify-center text-lg-text hover:bg-lg-surface-2 transition-colors">
          <Search className="w-[18px] h-[18px]" />
        </button>
        <button onClick={openNotifications} aria-label="Notificaciones"
          className="relative w-10 h-10 rounded-full bg-lg-surface flex items-center justify-center text-lg-text hover:bg-lg-surface-2 transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-lg-accent text-lg-ink text-[9px] font-extrabold rounded-full flex items-center justify-center">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>
        {user && (
          <Link to="/profile" className="ml-1">
            <CdnImage src={user.avatar || '/avatar.png'} width={64} alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-lg-accent ring-offset-2 ring-offset-lg-ground" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default HomeHeroTopBar;
