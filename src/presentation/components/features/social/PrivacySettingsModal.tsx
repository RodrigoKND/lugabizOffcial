import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@presentation/context';
import { useLockBodyScroll } from '@presentation/hooks';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  useLockBodyScroll(isOpen);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); onClose(); }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-primary-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary-500" />
                <h3 className="text-base font-bold text-text-primary">Privacidad</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-sm text-text-primary">Aparecer en la búsqueda por @usuario</span>
                <input
                  type="checkbox"
                  checked={user?.searchable ?? true}
                  onChange={(e) => updateProfile({ searchable: e.target.checked })}
                  className="w-4 h-4 accent-primary-500 shrink-0"
                />
              </label>
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-sm text-text-primary">Permitir solicitudes de cualquiera</span>
                <input
                  type="checkbox"
                  checked={(user?.whoCanRequest ?? 'everyone') === 'everyone'}
                  onChange={(e) => updateProfile({ whoCanRequest: e.target.checked ? 'everyone' : 'nobody' })}
                  className="w-4 h-4 accent-primary-500 shrink-0"
                />
              </label>
              <p className="text-[11px] text-text-secondary">
                Aunque desactives esto, ya nadie puede invitarte a un plan sin que primero aceptes su solicitud de amistad.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PrivacySettingsModal;
