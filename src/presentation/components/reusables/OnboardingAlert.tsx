import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, MapPin, Check } from 'lucide-react';
import LubiMascot from '@presentation/components/features/chatbot/LubiMascot';

interface OnboardingAlertProps {
  type: 'login' | 'notifications' | 'geolocation';
  isOpen: boolean;
  onAction: () => void;
  onDismiss: () => void;
}

const config = {
  login: {
    icon: Check,
    gradient: 'from-purple-600 to-pink-500',
    title: 'Descubre Lugabiz',
    message: 'Lugabiz se disfruta más con opciones personalizadas. Crea tu perfil y descubre lugares hechos para ti.',
    actionLabel: 'Iniciar Sesión',
  },
  notifications: {
    icon: Bell,
    gradient: 'from-primary-500 to-primary-700',
    title: 'No te pierdas nada',
    message: 'Activa las notificaciones y entérate al instante de nuevos eventos, lugares y promociones cerca de ti.',
    actionLabel: 'Activar Notificaciones',
  },
  geolocation: {
    icon: MapPin,
    gradient: 'from-emerald-500 to-teal-500',
    title: 'Explora cerca de ti',
    message: 'Permite tu ubicación para descubrir los mejores lugares y eventos alrededor tuyo.',
    actionLabel: 'Activar Ubicación',
  },
};

// Toast esquina inferior izquierda: Lubi a la izquierda + contenido a la derecha.
const OnboardingAlert: React.FC<OnboardingAlertProps> = ({ type, isOpen, onAction, onDismiss }) => {
  const c = config[type];
  const Icon = c.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-130%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-130%', opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260, mass: 0.9 }}
          className="fixed left-3 right-3 sm:right-auto sm:left-6 bottom-24 md:bottom-6 z-[60] sm:w-[400px] pointer-events-auto"
          role="status"
        >
          <div className="relative flex overflow-hidden rounded-2xl shadow-2xl shadow-primary-900/25 ring-1 ring-primary-100 bg-white">
            {/* Botón cerrar */}
            <button
              onClick={onDismiss}
              aria-label="Cerrar"
              className="absolute top-2.5 right-2.5 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {/* Lado izquierdo: Lubi */}
            <div className={`relative shrink-0 w-[92px] sm:w-[104px] bg-gradient-to-br ${c.gradient} flex flex-col items-center justify-center gap-1.5 py-4`}>
              <div className="absolute inset-0 opacity-20"
                style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.7), transparent 60%)' }} />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <LubiMascot size={54} variant="button" animated />
              </motion.div>
              <span className="relative text-[11px] font-bold text-white/95 tracking-wide">Lubi</span>
            </div>

            {/* Lado derecho: contenido */}
            <div className="flex-1 min-w-0 p-4 pr-9">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </span>
                <h3 className="font-bold text-sm text-stone-800 leading-tight">{c.title}</h3>
              </div>
              <p className="text-[13px] text-stone-500 mt-1.5 leading-relaxed line-clamp-3">{c.message}</p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={onAction}
                  className={`px-3.5 py-2 rounded-xl bg-gradient-to-r ${c.gradient} text-white text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm`}
                >
                  {c.actionLabel}
                </button>
                <button
                  onClick={onDismiss}
                  className="px-3 py-2 rounded-xl text-stone-400 text-xs font-medium hover:text-stone-600 hover:bg-stone-100 transition-all"
                >
                  Ahora no
                </button>
              </div>
            </div>

            {/* Barra de progreso del gradiente */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${c.gradient} opacity-40`} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingAlert;
