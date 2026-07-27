import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { friendshipsService } from '@lib/supabase';
import { useUserSearch } from '@presentation/hooks';
import { useAuth } from '@presentation/context';
import UserSearchResultItem from './UserSearchResultItem';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);
  const { results, isSearching } = useUserSearch(query);

  const handleAdd = async (targetId: string) => {
    if (!user) return;
    setSendingId(targetId);
    try {
      await friendshipsService.sendRequest(user.id, targetId);
      setSentIds((prev) => new Set(prev).add(targetId));
      toast.success('Solicitud enviada');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar la solicitud');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); onClose(); }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-primary-100">
              <h3 className="text-base font-bold text-text-primary">Agregar amigos</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="p-5 pb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre de usuario..."
                  className="w-full pl-10 pr-4 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all"
                />
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5">Escribí al menos 3 letras del @usuario exacto.</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
              {isSearching && <p className="text-xs text-text-secondary text-center py-4">Buscando...</p>}
              {!isSearching && query.trim().length >= 3 && results.length === 0 && (
                <p className="text-xs text-text-secondary text-center py-4">No encontramos a nadie con ese apodo.</p>
              )}
              {results.map((result) => (
                <UserSearchResultItem
                  key={result.id}
                  result={result}
                  onAdd={() => handleAdd(result.id)}
                  isSending={sendingId === result.id}
                  sent={sentIds.has(result.id)}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddFriendModal;
