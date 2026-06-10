import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Zap, Tag, Copy, Check, Store, Loader2 } from 'lucide-react';
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
}

const BusinessPostCard: React.FC<BusinessPostCardProps> = ({ post, onReactionUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const [localPost, setLocalPost] = useState(post);
  const [showOffer, setShowOffer] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const countdown = useCountdown(localPost.flashOffer?.expiresAt);

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

  async function handleClaimOffer(e: React.MouseEvent) {
    e.stopPropagation();
    if (!offer || claiming) return;
    if (!user) { toast.error('Inicia sesión para reclamar la oferta'); return; }
    setClaiming(true);
    try {
      const result = await postsService.claimFlashOffer(localPost.id);
      setLocalPost(p => ({
        ...p,
        flashOffer: p.flashOffer ? { ...p.flashOffer, claimedSlots: result.claimedSlots } : undefined,
      }));
      setShowOffer(true);
      toast.success('¡Oferta reclamada!');
    } catch (e: any) {
      const msg = e?.message;
      if (msg === 'expired') toast.error('Esta oferta ya expiró');
      else if (msg === 'full') toast.error('No quedan slots disponibles');
      else toast.error('No se pudo reclamar la oferta');
    } finally {
      setClaiming(false);
    }
  }

  async function copyCode() {
    if (!offer?.code) return;
    await navigator.clipboard.writeText(offer.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
    toast.success('Código copiado');
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-primary-100/40 shadow-sm overflow-hidden flex flex-col"
    >
      {/* ── Imagen ── */}
      <div
        className="relative bg-stone-100 overflow-hidden cursor-pointer"
        style={{ aspectRatio: '4/3' }}
        onClick={() => localPost.placeId && navigate(`/place/${localPost.placeId}`)}
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
              className="w-full h-full object-cover"
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

        {/* Oferta badge sobre la imagen */}
        {offerActive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-amber-500 rounded-md shadow-sm">
            <Zap className="w-2.5 h-2.5 text-white" />
            <span className="text-[10px] font-bold text-white">{countdown}</span>
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

        {/* Oferta expandible */}
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

            <AnimatePresence>
              {showOffer && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-white border-t border-amber-100"
                >
                  <div className="px-2.5 py-2">
                    {offer.totalSlots && (
                      <div className="mb-2">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-text-secondary">{offer.claimedSlots} de {offer.totalSlots} reclamados</span>
                        </div>
                        <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                            style={{ width: `${Math.min(100, (offer.claimedSlots / offer.totalSlots) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {offer.code && showOffer ? (
                      <div className="flex items-center gap-2 p-1.5 bg-amber-50 rounded-lg border border-amber-200">
                        <Tag className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="font-mono font-bold text-amber-800 flex-1 text-[12px] tracking-wider">{offer.code}</span>
                        <button onClick={copyCode} className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                          {codeCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {codeCopied ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleClaimOffer}
                        disabled={claiming}
                        className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[12px] font-bold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        {claiming
                          ? <><Loader2 className="w-3 h-3 animate-spin" />Reclamando...</>
                          : (offer.code ? '¡Revelar código!' : 'Reclamar oferta')
                        }
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
          {totalReactions > 0 && (
            <span className="text-[10px] text-text-secondary">{totalReactions} reacciones</span>
          )}
        </div>

      </div>
    </motion.article>
  );
};

export default BusinessPostCard;
