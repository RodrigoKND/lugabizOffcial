import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Megaphone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { edgeService } from '@lib/supabase/services/notifications/edgeFunctions';

interface OwnerAnnouncementProps {
  isOpen: boolean;
  onClose: () => void;
}

const OwnerAnnouncement: React.FC<OwnerAnnouncementProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Completa todos los campos');
      return;
    }
    setSending(true);
    try {
      await edgeService.createOwnerAnnouncement(title.trim(), body.trim());
      toast.success('Anuncio enviado a todos los usuarios!');
      setTitle('');
      setBody('');
      onClose();
    } catch {
      toast.error('Error al enviar anuncio');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-primary-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-text-primary">Nuevo Anuncio</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-primary-50 rounded-lg transition-colors">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all"
              placeholder="Ej. Nuevo evento este sábado"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Mensaje</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all resize-none"
              placeholder="Escribe tu anuncio..."
              maxLength={500}
            />
            <p className="text-xs text-text-secondary mt-1 text-right">{body.length}/500</p>
          </div>
          <button
            type="submit"
            disabled={sending || !title.trim() || !body.trim()}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
            ) : (
              <><Send className="w-4 h-4" /> Enviar Anuncio</>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default OwnerAnnouncement;
