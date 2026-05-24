import { Link, useLocation, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
<<<<<<< HEAD
import { Plus, User, Bell, Home, Search } from 'lucide-react';
=======
import { Plus, User, LogOut, Menu, Bell } from 'lucide-react';
>>>>>>> main
=======
import { Plus, User, LogOut, Menu, Bell } from 'lucide-react';
>>>>>>> main
import { useAuth } from '@presentation/context/AuthContext';

const Navbar = ({ onAuthClick }: { onAuthClick: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
<<<<<<< HEAD
<<<<<<< HEAD
  const { user, unreadCount } = useAuth();
=======
=======
>>>>>>> main
  const { user, logout, unreadCount, markAllNotifsAsRead } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
>>>>>>> main
  const isActive = (path: string) => location.pathname === path;
  return (
<<<<<<< HEAD
<<<<<<< HEAD
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden md:block bg-white/90 backdrop-blur-xl border-b border-primary-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary-800">Lugabiz</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium ${isActive('/') ? 'bg-primary-50 text-primary-600' : 'text-text-secondary hover:bg-primary-50/50 hover:text-primary-500'
                  }`}>
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </Link>
              <Link to="/add-place"
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all text-sm font-medium shadow-xs">
                <Plus className="w-4 h-4" />
                <span>Publicar</span>
              </Link>

              {user ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate('/profile')}
                    className="relative p-2.5 rounded-xl hover:bg-primary-50 transition-colors">
                    <Bell className="w-5 h-5 text-text-secondary" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <button onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-primary-50 transition-colors">
                    <img src={user.avatar || '/avatar.png'} alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-primary-200" />
                    <span className="text-sm font-medium text-text-primary hidden lg:inline">{user.name}</span>
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

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-primary-100/50 safe-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          <Link to="/"
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${isActive('/') ? 'text-primary-500' : 'text-text-secondary'
              }`}>
            <Home className={`w-5 h-5 ${isActive('/') ? 'fill-primary-100' : ''}`} />
            <span className="text-[10px] font-medium">Inicio</span>
          </Link>
          <button onClick={onAuthClick}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${isActive('/add-place') ? 'text-primary-500' : 'text-text-secondary'
              }`}>
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Acceder</span>
          </button>
          <Link to="/add-place"
            className="flex items-center justify-center w-14 h-14 -mt-10 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition-all active:scale-90">
            <Plus className="w-6 h-6" />
          </Link>
          <Link to="/profile"
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${isActive('/profile') ? 'text-primary-500' : 'text-text-secondary'
              }`}>
            <Bell className="w-5 h-5" />
            <span className="text-[10px] font-medium">Notis</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link to="/profile"
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${isActive('/profile') ? 'text-primary-500' : 'text-text-secondary'
              }`}>
            {user ? (
              <img src={user.avatar || '/avatar.png'} alt={user.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-primary-200" />
            ) : (
              <User className="w-5 h-5" />
            )}
            <span className="text-[10px] font-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </>
=======
=======
>>>>>>> main
    <nav
      className="bg-white/80 backdrop-blur-lg border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-stone-800">
              Lugabiz
            </span>
          </Link>

          <button className="md:hidden flex items-center p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
            <Menu className="w-6 h-6 text-stone-600" />
          </button>

          <div className="hidden md:flex items-center space-x-2">
            <Link to="/add-place"
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                isActive('/add-place')
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-amber-50 hover:text-amber-600'
              }`}>
              <Plus className="w-4 h-4" />
              <span>Publicar</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <button onClick={() => { markAllNotifsAsRead(); navigate('/profile'); }}
                  className="relative p-2.5 rounded-xl hover:bg-stone-50 transition-colors">
                  <Bell className="w-5 h-5 text-stone-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <button onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2 px-3 py-2 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors">
                  <img src={user.avatar || '/avatar.png'} alt={user.name}
                    className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-sm font-medium text-stone-700 hidden sm:inline">{user.name}</span>
                </button>

                <button onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 text-stone-500 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all text-sm">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <button onClick={onAuthClick}
                className="flex items-center cursor-pointer space-x-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all text-sm font-medium shadow-sm">
                <User className="w-4 h-4" />
                <span>Acceder</span>
              </button>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/add-place" onClick={() => setMenuOpen(false)}
              className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-xl text-stone-600 hover:bg-amber-50 hover:text-amber-600 transition-all">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Publicar</span>
            </Link>
            {user ? (
              <>
                <button onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                  className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-50 w-full">
                  <img src={user.avatar || '/avatar.png'} alt="" className="w-6 h-6 rounded-full object-cover" />
                  <span className="font-medium">{user.name}</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </button>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 w-full">
                  <LogOut className="w-4 h-4" />
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <button onClick={() => { onAuthClick(); setMenuOpen(false); }}
                className="flex items-center space-x-2 cursor-pointer px-4 py-2 bg-amber-500 text-white rounded-xl w-full justify-center font-medium">
                <User className="w-4 h-4" />
                <span>Acceder</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
  );
};

export default Navbar;
