import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Sparkles } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const PWAInstallBanner: React.FC = () => {
  const { showPrompt, handleInstall, dismissPrompt } = usePWAInstall();

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-gradient-to-r from-primary-200 to-tomato/20 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-primary-500 to-tomato p-2.5 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm mb-0.5">
                  ¡Instala Lugabiz!
                </h3>
                <p className="text-xs text-gray-600">
                  Acceso rápido y experiencia mejorada
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleInstall}
                  className="bg-gradient-to-r from-primary-500 to-tomato text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Instalar
                </button>
                <button
                  onClick={dismissPrompt}
                  className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress bar decorativo */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-1 bg-gradient-to-r from-primary-500 to-tomato origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallBanner;