import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, UserPlus, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@presentation/context';
import { useCreatePlan, useFriendSearch, useUserSearch, useLockBodyScroll } from '@presentation/hooks';
import { friendshipsService } from '@lib/supabase';
import { PlanVisibility } from '@domain/entities';
import FriendPickerItem from './FriendPickerItem';
import UserSearchResultItem from './UserSearchResultItem';
import PushEnableBanner from './PushEnableBanner';

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
  const { user } = useAuth();
  useLockBodyScroll(isOpen);
  const [friendFilter, setFriendFilter] = useState('');
  const [showAddPeople, setShowAddPeople] = useState(false);
  const [peopleQuery, setPeopleQuery] = useState('');
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);

  const { options: friendOptions, isLoading: isLoadingFriends } = useFriendSearch(friendFilter, 20, isOpen);
  const { results: peopleResults, isSearching: isSearchingPeople } = useUserSearch(peopleQuery);

  const {
    planDate, setPlanDate, planTime, setPlanTime, visibility, setVisibility,
    note, setNote, invitees, toggleInvitee, isSubmitting, submit,
  } = useCreatePlan({ placeId, eventId }, isOpen, onClose);

  const handleSendRequest = async (targetId: string) => {
    if (!user) return;
    setSendingId(targetId);
    try {
      await friendshipsService.sendRequest(user.id, targetId);
      setSentIds((prev) => new Set(prev).add(targetId));
      toast.success('Solicitud enviada. Vas a poder invitarlo cuando la acepte.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar la solicitud');
    } finally {
      setSendingId(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const noFriendsAtAll = !friendFilter.trim() && !isLoadingFriends && friendOptions.length === 0;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
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
              <PushEnableBanner />
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
                      className={`px-2 py-2.5 rounded-xl border-2 text-center transition-all ${
                        visibility === opt.value
                          ? 'bg-primary-500 border-primary-500 shadow-sm'
                          : 'bg-white border-primary-100 hover:border-primary-200 hover:bg-primary-50/40'
                      }`}>
                      <p className={`text-xs font-semibold ${visibility === opt.value ? 'text-white' : 'text-text-primary'}`}>
                        {opt.label}
                      </p>
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

                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
                  <input type="text" value={friendFilter} onChange={(e) => setFriendFilter(e.target.value)}
                    placeholder="Buscar entre tus amigos..."
                    className="w-full pl-8 pr-3 py-2 bg-primary-50/50 border border-primary-100 rounded-lg text-xs outline-none focus:border-primary-300 focus:bg-white transition-all" />
                </div>

                {noFriendsAtAll ? (
                  <div className="text-center py-6 bg-primary-50/40 rounded-xl">
                    <Users className="w-6 h-6 text-primary-300 mx-auto mb-2" />
                    <p className="text-xs text-text-secondary">Todavía no tenés amigos. Buscalos abajo por @usuario.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {friendOptions.map((friend) => (
                      <FriendPickerItem
                        key={friend.friendshipId}
                        friend={friend}
                        selected={invitees.some((i) => i.id === friend.userId)}
                        onToggle={() => toggleInvitee({ id: friend.userId, name: friend.name, username: friend.username || '', avatar: friend.avatar })}
                      />
                    ))}
                    {!isLoadingFriends && friendFilter.trim() && friendOptions.length === 0 && (
                      <p className="text-xs text-text-secondary text-center py-3">Sin resultados entre tus amigos.</p>
                    )}
                  </div>
                )}

                <button type="button" onClick={() => setShowAddPeople((v) => !v)}
                  className="w-full flex items-center justify-center gap-1.5 mt-2 py-2 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  <UserPlus className="w-3.5 h-3.5" /> {showAddPeople ? 'Ocultar búsqueda' : '¿No encuentras a tus amigos? Buscar y agregar'}
                </button>

                {showAddPeople && (
                  <div className="mt-1 space-y-2">
                    <input type="text" value={peopleQuery} onChange={(e) => setPeopleQuery(e.target.value)}
                      placeholder="Buscar por @usuario..." autoFocus
                      className="w-full px-3 py-2 bg-primary-50/50 border border-primary-100 rounded-lg text-xs outline-none focus:border-primary-300 focus:bg-white transition-all" />
                    {isSearchingPeople && <p className="text-[11px] text-text-secondary text-center py-2">Buscando...</p>}
                    {!isSearchingPeople && peopleQuery.trim().length >= 3 && peopleResults.length === 0 && (
                      <p className="text-[11px] text-text-secondary text-center py-2">No encontramos a nadie con ese apodo.</p>
                    )}
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {peopleResults.map((result) => (
                        <UserSearchResultItem
                          key={result.id}
                          result={result}
                          onAdd={() => handleSendRequest(result.id)}
                          isSending={sendingId === result.id}
                          sent={sentIds.has(result.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-5 mb-12 border-t border-primary-100">
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
    </AnimatePresence>,
    document.body
  );
};

export default CreatePlanModal;
