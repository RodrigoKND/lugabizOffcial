import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, User, Bell, Home, Search, Users } from 'lucide-react';
import { useAuth } from '@presentation/context/AuthContext';
import { useUnreadSurveys } from '@presentation/hooks/useSurveys';
import { SearchModal } from '@presentation/components/ui/SearchModal';
import NotificationDropdown from '@presentation/components/features/notifications/NotificationDropdown';

const Navbar = ({ onAuthClick }: { onAuthClick: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, unreadCount } = useAuth();
  const { unreadCount: surveyUnread } = useUnreadSurveys();
  const totalUnread = unreadCount + surveyUnread;
  const isActive = (path: string) => location.pathname === path;
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden md:block bg-white/90 backdrop-blur-xl border-b border-primary-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-800">Lugabiz</span>
            </Link>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium text-text-secondary hover:bg-primary-50/50 hover:text-primary-500">
                <Search className="w-4 h-4" />
                <span>Buscar</span>
                <kbd className="ml-1 px-1.5 py-0.5 bg-stone-100 text-[10px] text-stone-400 rounded border border-stone-200 font-mono">⌘K</kbd>
              </button>
              <Link to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium ${isActive('/') ? 'bg-primary-50 text-primary-600' : 'text-text-secondary hover:bg-primary-50/50 hover:text-primary-500'
                  }`}>
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </Link>
              <Link to="/comunidad"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium ${isActive('/comunidad') ? 'bg-primary-50 text-primary-600' : 'text-text-secondary hover:bg-primary-50/50 hover:text-primary-500'
                  }`}>
                <Users className="w-4 h-4" />
                <span>Comunidad</span>
              </Link>
              <Link to="/add-place"
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all text-sm font-medium shadow-xs">
                <Plus className="w-4 h-4" />
                <span>Publicar</span>
              </Link>

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button onClick={() => setShowNotifs(v => !v)}
                      className="relative p-2.5 rounded-xl hover:bg-primary-50 transition-colors">
                      <Bell className="w-5 h-5 text-text-secondary" />
                      {totalUnread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                          {totalUnread > 9 ? '9+' : totalUnread}
                        </span>
                      )}
                    </button>
                    <NotificationDropdown open={showNotifs} onClose={() => setShowNotifs(false)} />
                  </div>
                  <button onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-primary-50 transition-colors">
                    <img src={user.avatar || '/avatar.png'} alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-200" />
                  </button>
                </div>
              ) : (
                <button onClick={onAuthClick}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all text-sm font-medium shadow-xs">
                  <User className="w-4 h-4" />
                  <span>Acceder</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation — sin backdrop-blur para no crear stacking context */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-primary-100/50 safe-bottom pb-safe">
        <div className="flex items-center justify-around h-14 px-1">
          <Link to="/"
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive('/') ? 'text-primary-500' : 'text-text-secondary'}`}>
            <Home className={`w-5 h-5 ${isActive('/') ? 'fill-primary-100' : ''}`} />
            <span className="text-[10px] font-medium">Inicio</span>
          </Link>

          <button onClick={() => setShowSearch(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all text-text-secondary">
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Buscar</span>
          </button>

          <Link to="/add-place"
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive('/add-place') ? 'text-primary-500' : 'text-text-secondary'}`}>
            <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-medium">Publicar</span>
          </Link>

          <Link to="/comunidad"
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive('/comunidad') ? 'text-primary-500' : 'text-text-secondary'}`}>
            <Users className={`w-5 h-5 ${isActive('/comunidad') ? 'fill-primary-100' : ''}`} />
            <span className="text-[10px] font-medium">Comunidad</span>
          </Link>

          <button onClick={() => setShowNotifs(v => !v)}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive('/profile') ? 'text-primary-500' : 'text-text-secondary'}`}>
            <Bell className="w-5 h-5" />
            <span className="text-[10px] font-medium">Notis</span>
            {totalUnread > 0 && (
              <span className="absolute top-1 right-1.5 w-4 h-4 bg-pink-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>

          {user ? (
            <Link to="/profile"
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive('/profile') ? 'text-primary-500' : 'text-text-secondary'}`}>
              <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-primary-200">
                <img src={user.avatar || '/avatar.png'} alt={user.name}
                  className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-medium">Perfil</span>
            </Link>
          ) : (
            <button onClick={onAuthClick}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all text-text-secondary">
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">Acceder</span>
            </button>
          )}
        </div>
      </nav>

      {/* Notification dropdown — renderizado fuera del nav para evitar problemas de z-index */}
      <NotificationDropdown open={showNotifs} onClose={() => setShowNotifs(false)} />

      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};

export default Navbar;
