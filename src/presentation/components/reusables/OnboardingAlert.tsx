import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, MapPin, Check } from 'lucide-react';

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
    shadow: 'shadow-purple-500/20',
    title: 'Descubre Lugabiz',
    message: 'Lugabiz se disfruta más con opciones personalizadas. Crea tu perfil y descubre lugares hechos para ti.',
    actionLabel: 'Iniciar Sesión',
  },
  notifications: {
    icon: Bell,
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/20',
    title: 'No te pierdas nada',
    message: 'Activa las notificaciones y entérate al instante de nuevos eventos, lugares y promociones cerca de ti.',
    actionLabel: 'Activar Notificaciones',
  },
  geolocation: {
    icon: MapPin,
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/20',
    title: 'Explora cerca de ti',
    message: 'Permite tu ubicación para descubrir los mejores lugares y eventos alrededor tuyo.',
    actionLabel: 'Activar Ubicación',
  },
};

const OnboardingAlert: React.FC<OnboardingAlertProps> = ({ type, isOpen, onAction, onDismiss }) => {
  const c = config[type];
  const Icon = c.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 120, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 120, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
          className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-md"
        >
          <div className={`relative overflow-hidden rounded-2xl bg-white shadow-xl ${c.shadow} border border-white/20`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-5`} />

            <div className="relative p-5">
              <button
                onClick={onDismiss}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <div className="flex items-start gap-4">
                <div className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-bold text-base text-stone-800">{c.title}</h3>
                  <p className="text-sm text-stone-500 mt-1 leading-relaxed">{c.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={onAction}
                  className={`flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r ${c.gradient} text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-md`}
                >
                  {c.actionLabel}
                </button>
                <button
                  onClick={onDismiss}
                  className="px-4 py-2.5 rounded-xl text-stone-400 text-sm font-medium hover:text-stone-600 hover:bg-stone-100 transition-all"
                >
                  Ahora no
                </button>
              </div>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${c.gradient} opacity-30`} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingAlert;
