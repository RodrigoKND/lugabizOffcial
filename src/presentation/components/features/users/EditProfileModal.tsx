import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Store } from 'lucide-react';
import { EditProfileData } from '@domain/entities/ProfileTypes';
import { UsernameField } from '@presentation/components/features/social';

interface EditProfileModalProps {
  isOpen: boolean;
  editData: EditProfileData;
  initialUsername?: string;
  onClose: () => void;
  onChange: (data: EditProfileData) => void;
  onSave: () => void;
  onVerify?: () => void;
  onManageBusinesses?: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, editData, initialUsername, onClose, onChange, onSave, onVerify, onManageBusinesses }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-lg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-lg-surface-2">
            <h3 className="text-base font-bold text-lg-text">Editar Perfil</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-lg-surface-2 transition-colors">
              <X className="w-4 h-4 text-lg-dim" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <UsernameField
              value={editData.username}
              onChange={(username) => onChange({ ...editData, username })}
              initialUsername={initialUsername}
            />
            <div>
              <label className="block text-xs font-semibold text-lg-dim uppercase mb-1.5">Nombre</label>
              <input type="text" value={editData.name} onChange={e => onChange({ ...editData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-lg-surface transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-lg-dim uppercase mb-1.5">Teléfono</label>
              <input type="text" value={editData.phone} onChange={e => onChange({ ...editData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-lg-surface transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-lg-dim uppercase mb-1.5">Bio</label>
              <textarea value={editData.bio} onChange={e => onChange({ ...editData, bio: e.target.value })}
                className="w-full px-4 py-2.5 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-lg-surface transition-all resize-none" rows={3} />
            </div>
            {editData.isOwner && (
              <div>
                <label className="block text-xs font-semibold text-lg-dim uppercase mb-1.5">Nombre del negocio</label>
                <input type="text" value={editData.ownerBusinessName} onChange={e => onChange({ ...editData, ownerBusinessName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-lg-surface transition-all" />
              </div>
            )}
            <button type="button" onClick={() => { onClose(); onVerify?.(); }}
              className="w-full flex items-center gap-3 p-3 bg-lg-surface-2 hover:bg-lg-surface-2 rounded-xl text-left transition-colors">
              <div className="w-9 h-9 rounded-lg bg-lg-accent flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-lg-text">
                  {editData.isOwner ? 'Verificar mi negocio' : 'Tengo un negocio'}
                </p>
                <p className="text-[11px] text-lg-dim">Suma confianza y desbloquea ofertas. Tus datos son privados.</p>
              </div>
            </button>
            {editData.isOwner && onManageBusinesses && (
              <button type="button" onClick={() => { onClose(); onManageBusinesses(); }}
                className="w-full flex items-center gap-3 p-3 bg-lg-surface-2 hover:bg-lg-surface-2 rounded-xl text-left transition-colors">
                <div className="w-9 h-9 rounded-lg bg-lg-surface-2 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-lg-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-lg-text">Mis negocios</p>
                  <p className="text-[11px] text-lg-dim">Registrá hasta 3 negocios o eliminá los que no uses.</p>
                </div>
              </button>
            )}
          </div>
          <div className="flex gap-3 p-5 border-t border-lg-surface-2">
            <button onClick={onSave} disabled={!editData.name.trim()}
              className="flex-1 py-2.5 bg-lg-accent text-lg-ink rounded-xl font-semibold text-sm hover:bg-lg-accent transition-all disabled:opacity-50">Guardar</button>
            <button onClick={onClose}
              className="flex-1 py-2.5 bg-lg-surface-2 text-lg-dim rounded-xl font-semibold text-sm hover:bg-lg-surface-2 transition-all">Cancelar</button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default EditProfileModal;
