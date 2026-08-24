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
    <div className="md:hidden relative z-20 flex items-center justify-between">
      <div>
        <span className="font-black text-lg tracking-tight leading-none">
          <span className="text-primary-600">LUGA</span><span className="text-sky-500">BIZ</span>
        </span>
        <p className="text-[10px] text-stone-500 mt-0.5">
          Descubre. Conecta. Vive Cochabamba <span className="text-primary-400">♥</span>
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={openSearch} aria-label="Buscar"
          className="w-9 h-9 rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-50 transition-colors">
          <Search className="w-[18px] h-[18px]" />
        </button>
        <button onClick={openNotifications} aria-label="Notificaciones"
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-50 transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          {totalUnread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>
        {user && (
          <Link to="/profile" className="ml-1">
            <CdnImage src={user.avatar || '/avatar.png'} width={64} alt={user.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-100" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default HomeHeroTopBar;
