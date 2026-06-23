import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, User, Bell, Home, Search, Users, Compass } from 'lucide-react';
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
    function handleOpenSearch() { setShowSearch(true); }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('lugabiz:open-search', handleOpenSearch);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('lugabiz:open-search', handleOpenSearch);
    };
  }, []);

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/comunidad', label: 'Comunidad' },
    { to: '/asesor', label: 'Asesor' },
  ];

  return (
    <>
      {/* ── Desktop Top Navbar ── */}
      <nav className="hidden md:block sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[62px] gap-6">

            {/* Logo */}
            <Link to="/" className="shrink-0">
              <span className="text-white font-bold text-xl tracking-tight">Lugabiz</span>
            </Link>

            {/* Center nav links */}
            <div className="flex items-center gap-0.5">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'text-white bg-white/10'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Search pill */}
              <button onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/45 hover:text-white/75 hover:bg-white/8 hover:border-white/20 transition-all text-sm">
                <Search className="w-3.5 h-3.5" />
                <span>Buscar</span>
                <kbd className="ml-0.5 px-1.5 py-0.5 rounded text-[10px] text-white/25 font-mono bg-white/8 border border-white/10">⌘K</kbd>
              </button>

              {/* Publicar */}
              <Link to="/add-place"
                className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-full text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm">
                <Plus className="w-3.5 h-3.5" />
                Publicar
              </Link>

              {user ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowNotifs(v => !v)}
                    className="relative p-2.5 rounded-full hover:bg-white/8 transition-colors">
                    <Bell className="w-5 h-5 text-white/45" />
                    {totalUnread > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                        {totalUnread > 9 ? '9+' : totalUnread}
                      </span>
                    )}
                  </button>
                  <button onClick={() => navigate('/profile')}
                    className="p-1 rounded-full hover:bg-white/8 transition-colors">
                    <img src={user.avatar || '/avatar.png'} alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-400/40" />
                  </button>
                </div>
              ) : (
                <button onClick={onAuthClick}
                  className="px-4 py-2 rounded-full border border-white/20 text-white/75 text-sm font-medium hover:bg-white/8 hover:border-white/30 hover:text-white transition-all">
                  Acceder
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Navigation — floating pill ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom pb-safe">
        <div className="mx-3 mb-2">
          <div className="flex items-center justify-around h-[58px] px-1 bg-[#0d0620]/90 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl shadow-black/60">

            <Link to="/"
              className={`flex flex-col items-center gap-1 py-2 px-2.5 rounded-xl transition-all ${isActive('/') ? 'text-white' : 'text-white/35'}`}>
              <Home className={`w-5 h-5 ${isActive('/') ? 'text-primary-400' : ''}`} />
              <span className="text-[9px] font-medium">Inicio</span>
            </Link>

            <Link to="/asesor"
              className={`flex flex-col items-center gap-1 py-2 px-2.5 rounded-xl transition-all ${isActive('/asesor') ? 'text-white' : 'text-white/35'}`}>
              <Compass className={`w-5 h-5 ${isActive('/asesor') ? 'text-primary-400' : ''}`} />
              <span className="text-[9px] font-medium">Asesor</span>
            </Link>

            <button onClick={() => setShowSearch(true)}
              className="flex flex-col items-center gap-1 py-2 px-2.5 rounded-xl transition-all text-white/35">
              <Search className="w-5 h-5" />
              <span className="text-[9px] font-medium">Buscar</span>
            </button>

            <Link to="/add-place"
              className={`flex flex-col items-center gap-1 py-2 px-2.5 rounded-xl transition-all ${isActive('/add-place') ? 'text-primary-400' : 'text-white/35'}`}>
              <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center shadow-md shadow-primary-500/30">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="text-[9px] font-medium">Publicar</span>
            </Link>

            <Link to="/comunidad"
              className={`flex flex-col items-center gap-1 py-2 px-2.5 rounded-xl transition-all ${isActive('/comunidad') ? 'text-white' : 'text-white/35'}`}>
              <Users className={`w-5 h-5 ${isActive('/comunidad') ? 'text-primary-400' : ''}`} />
              <span className="text-[9px] font-medium">Comunidad</span>
            </Link>

            <button onClick={() => setShowNotifs(v => !v)}
              className="relative flex flex-col items-center gap-1 py-2 px-2.5 rounded-xl transition-all text-white/35">
              <Bell className="w-5 h-5" />
              <span className="text-[9px] font-medium">Notis</span>
              {totalUnread > 0 && (
                <span className="absolute top-1 right-0.5 w-3.5 h-3.5 bg-pink-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
            </button>

            {user ? (
              <Link to="/profile"
                className={`flex flex-col items-center gap-1 py-2 px-2.5 rounded-xl transition-all ${isActive('/profile') ? 'text-white' : 'text-white/35'}`}>
                <div className={`w-5 h-5 rounded-full overflow-hidden ${isActive('/profile') ? 'ring-1 ring-primary-400' : ''}`}>
                  <img src={user.avatar || '/avatar.png'} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] font-medium">Perfil</span>
              </Link>
            ) : (
              <button onClick={onAuthClick}
                className="flex flex-col items-center gap-1 py-2 px-2.5 rounded-xl transition-all text-white/35">
                <User className="w-5 h-5" />
                <span className="text-[9px] font-medium">Acceder</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <NotificationDropdown open={showNotifs} onClose={() => setShowNotifs(false)} />
      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};

export default Navbar;
