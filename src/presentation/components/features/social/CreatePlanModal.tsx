import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Users, X } from 'lucide-react';
import { useCreatePlan, useFriendRequests } from '@presentation/hooks';
import { PlanVisibility } from '@domain/entities';
import FriendPickerItem from './FriendPickerItem';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  placeId?: string;
  eventId?: string;
}

const VISIBILITY_OPTIONS: { value: PlanVisibility; label: string; hint: string }[] = [
  { value: 'private', label: 'Privado', hint: 'Solo lo ven los invitados' },
  { value: 'friends', label: 'Amigos', hint: 'Tus amigos lo pueden ver y pedir unirse' },
  { value: 'public', label: 'Público', hint: 'Cualquiera lo puede ver en el lugar/evento' },
];

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ isOpen, onClose, targetName, placeId, eventId }) => {
  const { friends } = useFriendRequests();
  const [friendFilter, setFriendFilter] = useState('');
  const {
    planDate, setPlanDate, planTime, setPlanTime, visibility, setVisibility,
    note, setNote, invitees, toggleInvitee, isSubmitting, submit,
  } = useCreatePlan({ placeId, eventId }, onClose);

  const filteredFriends = friends.filter((f) =>
    f.otherUserName.toLowerCase().includes(friendFilter.toLowerCase())
    || f.otherUserUsername?.toLowerCase().includes(friendFilter.toLowerCase())
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); onClose(); }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-primary-100">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-text-primary">Crear plan</h3>
                <p className="text-xs text-text-secondary truncate">{targetName}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-primary-50 transition-colors shrink-0">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Fecha</label>
                  <input type="date" min={today} value={planDate} onChange={(e) => setPlanDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Hora</label>
                  <input type="time" value={planTime} onChange={(e) => setPlanTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Visibilidad</label>
                <div className="grid grid-cols-3 gap-2">
                  {VISIBILITY_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setVisibility(opt.value)}
                      className={`px-2 py-2 rounded-xl border text-center transition-colors ${
                        visibility === opt.value ? 'bg-primary-50 border-primary-300' : 'border-primary-100 hover:bg-primary-50/40'
                      }`}>
                      <p className="text-xs font-semibold text-text-primary">{opt.label}</p>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-text-secondary mt-1.5">
                  {VISIBILITY_OPTIONS.find((o) => o.value === visibility)?.hint}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Nota (opcional)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                  className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">
                  Invitar amigos {invitees.length > 0 && `(${invitees.length})`}
                </label>
                {friends.length === 0 ? (
                  <div className="text-center py-6 bg-primary-50/40 rounded-xl">
                    <Users className="w-6 h-6 text-primary-300 mx-auto mb-2" />
                    <p className="text-xs text-text-secondary">Agregá amigos primero desde la pestaña "Amigos".</p>
                  </div>
                ) : (
                  <>
                    <input type="text" value={friendFilter} onChange={(e) => setFriendFilter(e.target.value)}
                      placeholder="Filtrar por nombre..."
                      className="w-full px-3 py-2 mb-2 bg-primary-50/50 border border-primary-100 rounded-lg text-xs outline-none focus:border-primary-300 focus:bg-white transition-all" />
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {filteredFriends.map((friend) => (
                        <FriendPickerItem
                          key={friend.id}
                          friend={friend}
                          selected={invitees.some((i) => i.id === friend.otherUserId)}
                          onToggle={() => toggleInvitee({ id: friend.otherUserId, name: friend.otherUserName, username: friend.otherUserUsername || '', avatar: friend.otherUserAvatar })}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-primary-100">
              <button onClick={submit} disabled={isSubmitting || !planDate || !planTime}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all disabled:opacity-50">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear plan
              </button>
              <button onClick={onClose}
                className="flex-1 py-2.5 bg-primary-50 text-text-secondary rounded-xl font-semibold text-sm hover:bg-primary-100 transition-all">
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePlanModal;
