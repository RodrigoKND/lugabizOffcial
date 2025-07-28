import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WelcomeMessage: React.FC = () => {
  const { user, isNewUser, setWelcomeShown } = useAuth();

  if (!isNewUser || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
        >
          <button
            onClick={setWelcomeShown}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="bg-gradient-to-br from-purple-400 via-primary-500 to-tomato p-8 text-center relative overflow-hidden">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="text-8xl mb-4"
            >
              🦕
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Bienvenido a Lugabiz!
              </h2>
              <p className="text-white/90 text-lg">
                Hola {user.name} 👋
              </p>
            </motion.div>

            {/* Elementos decorativos */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute top-4 left-4"
            >
              <Sparkles className="w-6 h-6 text-white/60" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="absolute bottom-4 right-4"
            >
              <Heart className="w-6 h-6 text-white/60" />
            </motion.div>
          </div>

          <div className="p-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¡Estás listo para explorar!
              </h3>
              <p className="text-gray-600 mb-6">
                Descubre lugares únicos, guarda tus favoritos y comparte tus propias recomendaciones con la comunidad.
              </p>
              
              <div className="space-y-3 text-sm text-gray-500 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span>Explora lugares por categorías</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-tomato rounded-full"></div>
                  <span>Guarda tus lugares favoritos</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Publica tus propias recomendaciones</span>
                </div>
              </div>

              <button
                onClick={setWelcomeShown}
                className="bg-gradient-to-r from-primary-500 to-tomato text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                ¡Empezar a explorar!
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WelcomeMessage;