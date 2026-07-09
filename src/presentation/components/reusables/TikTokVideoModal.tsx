import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import TikTokHeroEmbed from './TikTokHeroEmbed';

interface TikTokVideoModalProps {
  open: boolean;
  onClose: () => void;
  videoId: string;
  videoUrl: string;
}

const TikTokVideoModal: React.FC<TikTokVideoModalProps> = ({ open, onClose, videoId, videoUrl }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, pointerEvents: 'auto' }}
        exit={{ opacity: 0, pointerEvents: 'none' }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-sm h-[80vh] max-h-[720px] bg-black rounded-2xl overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-black/80 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <TikTokHeroEmbed videoId={videoId} videoUrl={videoUrl} />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default TikTokVideoModal;
