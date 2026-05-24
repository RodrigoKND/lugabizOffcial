import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Search, Sparkles } from 'lucide-react';

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
  const [selectedOption, setSelectedOption] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedOption.trim()) {
      onSearch?.(selectedOption);
      setSelectedOption('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400" />

            <button onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors z-10">
              <X className="w-4 h-4 text-stone-500" />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-800">Hola, soy <span className="text-amber-600">Lubi</span></h2>
                  <p className="text-sm text-stone-500">¿Qué tienes planeado hoy?</p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Sugerencias</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} type="button" onClick={() => setSelectedOption(s.name)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedOption === s.name
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-amber-200 hover:bg-amber-50/50'
                      }`}>
                      <Sparkles className="w-3 h-3 inline mr-1.5 opacity-60" />
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <textarea
                    placeholder="Quiero lugares para pasar el tiempo con amigos..."
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                    rows={3} maxLength={250}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('chat-submit')?.click(); } }}
                  />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[11px] text-stone-400">{selectedOption.length}/250</span>
                  <button id="chat-submit" type="submit" disabled={!selectedOption.trim() || isLoading}
                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                      selectedOption.trim() && !isLoading
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}>
                    {isLoading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Buscando...</>
                    ) : (
                      <><Search className="w-4 h-4" /> Buscar lugares</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatModal;
