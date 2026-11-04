import { Link, useLocation } from 'react-router-dom';
import { Plus, User, Home, Users, Compass } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@presentation/context/AuthContext';
import { CdnImage } from '@presentation/components/reusables';

interface MobileBottomNavProps {
  onAuthClick: () => void;
}

const ITEM = 'relative flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-colors';
const LABEL = 'text-[10px] font-semibold';

// Menú inferior móvil. Búsqueda y notificaciones viven en el header (HomeHeroTopBar), no se repiten aquí.
const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onAuthClick }) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const tone = (path: string) => (pathname === path ? 'text-lg-text' : 'text-lg-dim');
  const icon = (path: string) => (pathname === path ? 'text-lg-accent' : '');

  const linkItem = (to: string, label: string, Icon: LucideIcon) => (
    <Link to={to} className={`${ITEM} ${tone(to)}`}>
      <Icon className={`w-5 h-5 ${icon(to)}`} />
      <span className={LABEL}>{label}</span>
    </Link>
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom pb-safe">
      <div className="mx-3 mb-2 flex items-center justify-around h-[62px] px-1 bg-lg-surface/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/50">
        {linkItem('/', 'Inicio', Home)}
        {linkItem('/asesor', 'Asesor', Compass)}

        <Link to="/add-place" className={`${ITEM} ${tone('/add-place')}`}>
          <span className="w-9 h-9 -mt-1 rounded-xl bg-lg-accent text-lg-ink flex items-center justify-center -rotate-6 shadow-md shadow-black/30">
            <Plus className="w-5 h-5" strokeWidth={3} />
          </span>
          <span className={LABEL}>Publicar</span>
        </Link>

        {linkItem('/comunidad', 'Comunidad', Users)}

        {user ? (
          <Link to="/profile" className={`${ITEM} ${tone('/profile')}`}>
            <span className={`w-5 h-5 rounded-full overflow-hidden ${pathname === '/profile' ? 'ring-2 ring-lg-accent' : ''}`}>
              <CdnImage src={user.avatar || '/avatar.png'} width={40} alt={user.name} className="w-full h-full object-cover" />
            </span>
            <span className={LABEL}>Perfil</span>
          </Link>
        ) : (
          <button onClick={onAuthClick} className={`${ITEM} text-lg-dim`}>
            <User className="w-5 h-5" />
            <span className={LABEL}>Acceder</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
