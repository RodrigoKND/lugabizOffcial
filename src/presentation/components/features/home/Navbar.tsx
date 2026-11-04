import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Bell, Search } from 'lucide-react';
import { useAuth } from '@presentation/context/AuthContext';
import { useUnreadSurveys } from '@presentation/hooks/useSurveys';
import { SearchModal } from '@presentation/components/ui/SearchModal';
import NotificationDropdown from '@presentation/components/features/notifications/NotificationDropdown';
import { CdnImage } from '@presentation/components/reusables';
import MobileBottomNav from './MobileBottomNav';

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

  // La campana del header móvil (HomeHeroTopBar) avisa con este evento; sin sesión se pide iniciarla.
  useEffect(() => {
    function handleOpenNotifications() {
      if (user) setShowNotifs(true);
      else onAuthClick();
    }
    document.addEventListener('lugabiz:open-notifications', handleOpenNotifications);
    return () => document.removeEventListener('lugabiz:open-notifications', handleOpenNotifications);
  }, [user, onAuthClick]);

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
              <span className="font-flyer text-2xl text-lg-text">Luga<span className="text-lg-accent">biz</span></span>
            </Link>

            {/* Center nav links */}
            <div className="flex items-center gap-0.5">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'text-lg-text bg-lg-surface-2'
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
                className="flex items-center gap-1.5 px-4 py-2 bg-lg-accent text-lg-ink rounded-full text-sm font-bold hover:brightness-110 transition shadow-sm">
                <Plus className="w-3.5 h-3.5" />
                Publicar
              </Link>

              {user ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowNotifs(v => !v)}
                    className="relative p-2.5 rounded-full hover:bg-white/8 transition-colors">
                    <Bell className="w-5 h-5 text-white/45" />
                    {totalUnread > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-lg-accent text-lg-ink text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-sm">
                        {totalUnread > 9 ? '9+' : totalUnread}
                      </span>
                    )}
                  </button>
                  <button onClick={() => navigate('/profile')}
                    className="p-1 rounded-full hover:bg-white/8 transition-colors">
                    <CdnImage src={user.avatar || '/avatar.png'} width={64} alt={user.name}
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

      <MobileBottomNav onAuthClick={onAuthClick} />

      <NotificationDropdown open={showNotifs} onClose={() => setShowNotifs(false)} />
      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};

export default Navbar;
