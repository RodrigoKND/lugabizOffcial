import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Zap, Tag, Copy, Check, Store, X, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { BusinessPost } from '@domain/entities/Post';
import { postsService } from '@lib/supabase/services/posts/posts';
import { useAuth } from '@presentation/context';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const REACTIONS = [
  { key: 'heart', emoji: '❤️' },
  { key: 'fire',  emoji: '🔥' },
  { key: 'wow',   emoji: '😍' },
  { key: 'clap',  emoji: '👏' },
] as const;

function useCountdown(expiresAt?: string) {
  const [, forceUpdate] = useState(0);
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expirado';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  setTimeout(() => forceUpdate(n => n + 1), 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

interface BusinessPostCardProps {
  post: BusinessPost;
  onReactionUpdate?: (postId: string, emoji: string | null) => void;
  onDeleted?: (postId: string) => void;
}

const BusinessPostCard: React.FC<BusinessPostCardProps> = ({ post, onReactionUpdate, onDeleted }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const [localPost, setLocalPost] = useState(post);
  const [showOffer, setShowOffer] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const countdown = useCountdown(localPost.flashOffer?.expiresAt);

  const isOwner = user?.id === localPost.userId;
  const totalReactions = Object.values(localPost.reactionsCount).reduce((a, b) => a + b, 0);
  const offer = localPost.flashOffer;
  const offerExpired = offer && new Date(offer.expiresAt) < new Date();
  const offerFull = offer?.totalSlots && offer.claimedSlots >= offer.totalSlots;
  const offerActive = offer && !offerExpired && !offerFull;

  async function handleReact(emoji: 'heart' | 'fire' | 'wow' | 'clap') {
    if (!user || reacting) return;
    setReacting(true);
    const prev = localPost.userReaction;
    const isSame = prev === emoji;
    setLocalPost(p => {
      const counts = { ...p.reactionsCount };
      if (prev) counts[prev] = Math.max(0, counts[prev] - 1);
      if (!isSame) counts[emoji] = counts[emoji] + 1;
      return { ...p, userReaction: isSame ? null : emoji, reactionsCount: counts };
    });
    try {
      await postsService.reactToPost(localPost.id, user.id, emoji);
      onReactionUpdate?.(localPost.id, isSame ? null : emoji);
    } catch {
      setLocalPost(post);
    } finally {
      setReacting(false);
    }
  }

  async function copyCode() {
    if (!offer?.code) return;
    await navigator.clipboard.writeText(offer.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
    toast.success('Código copiado');
  }

  async function handleDelete() {
    if (!isOwner || deleting) return;
    setDeleting(true);
    setShowMenu(false);
    try {
      await postsService.deletePost(localPost.id);
      toast.success('Post eliminado');
      onDeleted?.(localPost.id);
    } catch {
      toast.error('Error al eliminar el post');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-primary-100/40 shadow-sm overflow-hidden flex flex-col"
    >
      {/* ── Imagen ── */}
      <div
        className="relative bg-stone-100 overflow-hidden"
        style={{ aspectRatio: '4/3' }}
      >
        {localPost.images.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIndex}
              src={localPost.images[imgIndex]}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => { setGalleryIndex(imgIndex); setGalleryOpen(true); }}
            />
          </AnimatePresence>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <Store className="w-8 h-8 text-primary-300" />
          </div>
        )}

        {/* Carousel arrows */}
        {localPost.images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setImgIndex(i => Math.max(0, i - 1)) }}
              disabled={imgIndex === 0}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-20 transition-opacity"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setImgIndex(i => Math.min(localPost.images.length - 1, i + 1)) }}
              disabled={imgIndex === localPost.images.length - 1}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-20 transition-opacity"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
              {localPost.images.map((_, i) => (
                <div key={i} className={`h-1 rounded-full bg-white transition-all ${i === imgIndex ? 'w-3' : 'w-1 opacity-50'}`} />
              ))}
            </div>
          </>
        )}

        {/* Oferta badge */}
        {offerActive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-amber-500 rounded-md shadow-sm">
            <Zap className="w-2.5 h-2.5 text-white" />
            <span className="text-[10px] font-bold text-white">{countdown}</span>
          </div>
        )}

        {/* Owner menu */}
        {isOwner && (
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
              className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-7 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden z-10 min-w-[110px]">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleting ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Contenido ── */}
      <div className="px-3 pt-2.5 pb-2 flex flex-col gap-2 flex-1">

        {/* Negocio */}
        <button
          onClick={() => localPost.placeId && navigate(`/place/${localPost.placeId}`)}
          className="flex items-center gap-1.5 min-w-0 text-left"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden bg-primary-100 ring-1 ring-primary-200 shrink-0">
            {localPost.userAvatar ? (
              <img src={localPost.userAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                <Store className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <p className="text-[12px] font-semibold text-text-primary truncate">{localPost.businessName}</p>
        </button>

        {/* Descripción */}
        <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2 flex-1">
          {localPost.description}
        </p>

        {/* Oferta expandible — sin animación de height para evitar layout jump */}
        {offerActive && (
          <div className="rounded-lg border border-amber-200 overflow-hidden">
            <button
              onClick={() => setShowOffer(v => !v)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-amber-50 text-left"
            >
              <Zap className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="text-[11px] font-semibold text-amber-800 flex-1 truncate">{offer.title}</span>
              {offer.totalSlots && (
                <span className="text-[10px] text-amber-600 shrink-0">
                  {offer.totalSlots - offer.claimedSlots} restantes
                </span>
              )}
            </button>

            {/* CSS max-height en lugar de framer-motion height para evitar el brinco */}
            <div
              style={{
                maxHeight: showOffer ? '200px' : '0px',
                transition: 'max-height 0.22s ease',
                overflow: 'hidden',
              }}
              className="bg-white border-t border-amber-100"
            >
              <div className="px-2.5 py-2 space-y-2">
                {offer.description && (
                  <p className="text-[11px] text-amber-800">{offer.description}</p>
                )}
                {offer.code && (
                  <div className="flex items-center gap-2 p-1.5 bg-amber-50 rounded-lg border border-amber-200">
                    <Tag className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="font-mono font-bold text-amber-800 flex-1 text-[12px] tracking-wider">{offer.code}</span>
                    <button onClick={copyCode} className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                      {codeCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {codeCopied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                )}
                {offer.totalSlots && (
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-text-secondary">{offer.claimedSlots} de {offer.totalSlots} usados</span>
                      <span className="text-amber-600 font-semibold">{offer.totalSlots - offer.claimedSlots} disponibles</span>
                    </div>
                    <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                        style={{ width: `${Math.min(100, (offer.claimedSlots / offer.totalSlots) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Reacciones ── */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-0.5">
            {REACTIONS.map(({ key, emoji }) => (
              <button
                key={key}
                onClick={() => handleReact(key)}
                className={`flex items-center gap-0.5 px-1.5 py-1 rounded-lg text-sm transition-all active:scale-90 ${
                  localPost.userReaction === key ? 'bg-primary-100 scale-110' : 'hover:bg-stone-50'
                }`}
              >
                <span className="text-[14px]">{emoji}</span>
                {localPost.reactionsCount[key] > 0 && (
                  <span className="text-[10px] text-text-secondary font-medium">{localPost.reactionsCount[key]}</span>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>
    </motion.article>

    {/* ── Galería lightbox ── */}
    <AnimatePresence>
      {galleryOpen && localPost.images.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
          onClick={() => setGalleryOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="relative max-w-2xl w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setGalleryOpen(false)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={localPost.images[galleryIndex]}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto block"
            />
            {localPost.images.length > 1 && (
              <>
                <button
                  onClick={() => setGalleryIndex(i => Math.max(0, i - 1))}
                  disabled={galleryIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-10 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/25 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGalleryIndex(i => Math.min(localPost.images.length - 1, i + 1))}
                  disabled={galleryIndex === localPost.images.length - 1}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-10 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/25 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="flex justify-center gap-1.5 mt-4">
                  {localPost.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setGalleryIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${i === galleryIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
};

export default BusinessPostCard;
