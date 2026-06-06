import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles, Compass } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

const SUGGESTIONS = [
  { name: 'Comida tradicional', category: 'Comida' },
  { name: 'Negocios en crecimiento', category: 'Negocios' },
  { name: 'Día de pasta', category: 'Día de la semana' },
  { name: 'Día de descanso', category: 'Día de la semana' }
];

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
      setQuery('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-200 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden sm:mx-4"
          >
            <div className="absolute inset-x-0 top-0 h-2 bg-linear-to-r from-purple-400 via-purple-500 to-purple-400" />

            <button onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center hover:bg-purple-100 transition-colors z-10">
              <X className="w-4 h-4 text-purple-600" />
            </button>

            <div className="p-6 sm:p-8 pt-8 sm:pt-8">
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    <Compass className="w-8 h-8 mr-2 inline" />
                    ¿Qué planes tienes hoy?
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Ideas rápidas
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} type="button" onClick={() => setQuery(s.name)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${query === s.name
                          ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-purple-200 hover:bg-purple-50/50'
                        }`}>
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6">
                <div className="relative">
                  <Search className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                  <textarea
                    placeholder="Busca lugares para salir con amigos..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                    rows={3} maxLength={250}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('chat-submit')?.click(); } }}
                  />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[11px] text-slate-400">{query.length}/250</span>
                  <button id="chat-submit" type="submit" disabled={!query.trim() || isLoading}
                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${query.trim() && !isLoading
                        ? 'bg-linear-to-r from-purple-500 to-violet-500 text-white shadow-md shadow-purple-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}>
                    {isLoading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Buscando...</>
                    ) : (
                      <><Search className="w-4 h-4" /> Descubrir</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatModal;
