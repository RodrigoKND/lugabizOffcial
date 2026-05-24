import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, User, LogOut, Menu, Bell } from 'lucide-react';
import { useAuth } from '@presentation/context/AuthContext';

const Navbar = ({ onAuthClick }: { onAuthClick: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, unreadCount, markAllNotifsAsRead } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isActive = (path: string) => location.pathname === path;

  return (
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
      </nav>

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
  );
};

export default Navbar;
