import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, MapPin, User, LogOut, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@presentation/context/AuthContext';

const Navbar = ({ onAuthClick }: { onAuthClick: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/80 backdrop-blur-lg border-b border-purple-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-linear-to-br from-primary-500 to-tomato rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-primary-600 to-tomato bg-clip-text text-transparent">
              Lugabiz
            </span>
          </Link>

          <button
            className="md:hidden flex items-center p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6 text-primary-600" />
          </button>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/add-place"
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${isActive('/add-place')
                ? 'bg-tomato text-white shadow-lg'
                : 'text-gray-600 hover:bg-orange-50 hover:text-tomato'
                }`}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Publicar</span>
            </Link>
            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <img
                    src={user.avatar || '/assets/images/avatar.png'}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center cursor-pointer space-x-2 px-4 py-2 bg-linear-to-r from-primary-500 to-tomato text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Acceder</span>
              </button>
            )}
          </div>
        </div>

        <div className={`md:hidden transition-all duration-300 ${menuOpen ? 'block' : 'hidden'}`}>
          <div className="flex flex-col space-y-2 pb-4">
            <Link
              to="/add-place"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center cursor-pointer  space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${isActive('/add-place')
                ? 'bg-tomato text-white shadow-lg'
                : 'text-gray-600 hover:bg-orange-50 hover:text-tomato'
                }`}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Publicar</span>
            </Link>
            {user ? (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setMenuOpen(false);
                  }}
                  className="flex items-center cursor-pointer space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50'}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="flex items-center cursor-pointer space-x-1 px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onAuthClick();
                  setMenuOpen(false);
                }}
                className="flex items-center space-x-2 cursor-pointer px-4 py-2 bg-linear-to-r from-primary-500 to-tomato text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Acceder</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;