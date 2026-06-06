import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Zap, Tag, MessageCircle, Share2, Store, Copy, Check } from 'lucide-react';
import { BusinessPost } from '@domain/entities/Post';
import { postsService } from '@lib/supabase/services/posts/posts';
import { useAuth } from '@presentation/context';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const REACTIONS = [
  { key: 'heart', emoji: '❤️', label: 'Me encanta' },
  { key: 'fire', emoji: '🔥', label: 'Tremendo' },
  { key: 'wow', emoji: '😍', label: 'Increíble' },
  { key: 'clap', emoji: '👏', label: 'Bravo' },
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
  const [showOfferCode, setShowOfferCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [reacting, setReacting] = useState(false);
  const countdown = useCountdown(localPost.flashOffer?.expiresAt);

  const totalReactions = Object.values(localPost.reactionsCount).reduce((a, b) => a + b, 0);

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

  async function handleClaimOffer() {
    if (!localPost.flashOffer) return;
    if (!user) { toast.error('Inicia sesión para reclamar la oferta'); return; }
    if (showOfferCode) return;

    try {
      await postsService.claimFlashOffer(localPost.id);
      setLocalPost(p => ({
        ...p,
        flashOffer: p.flashOffer ? { ...p.flashOffer, claimedSlots: p.flashOffer.claimedSlots + 1 } : undefined,
      }));
    } catch {}
    setShowOfferCode(true);
  }

  async function copyCode() {
    if (!localPost.flashOffer?.code) return;
    await navigator.clipboard.writeText(localPost.flashOffer.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
    toast.success('Código copiado');
  }

  const offer = localPost.flashOffer;
  const offerExpired = offer && new Date(offer.expiresAt) < new Date();
  const offerFull = offer?.totalSlots && offer.claimedSlots >= offer.totalSlots;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-primary-100/40 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button onClick={() => localPost.placeId && navigate(`/place/${localPost.placeId}`)}
          className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 ring-2 ring-primary-200">
              {localPost.userAvatar ? (
                <img src={localPost.userAvatar} alt={localPost.businessName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                  <Store className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
              <Store className="w-2.5 h-2.5 text-white" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-text-primary truncate">{localPost.businessName}</p>
            <p className="text-[11px] text-text-secondary">
              {localPost.createdAt.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' · '}
              <span className="inline-flex items-center gap-0.5 text-primary-500 font-medium">
                <Store className="w-2.5 h-2.5" /> Negocio verificado
              </span>
            </p>
          </div>
        </button>
      </div>

      {/* Images */}
      {localPost.images.length > 0 && (
        <div className="relative aspect-video bg-stone-100 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIndex}
              src={localPost.images[imgIndex]}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          {localPost.images.length > 1 && (
            <>
              <button onClick={() => setImgIndex(i => Math.max(0, i - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors disabled:opacity-30"
                disabled={imgIndex === 0}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setImgIndex(i => Math.min(localPost.images.length - 1, i + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors disabled:opacity-30"
                disabled={imgIndex === localPost.images.length - 1}>
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {localPost.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Description */}
      <div className="px-4 pt-3">
        <p className="text-sm text-text-primary leading-relaxed">{localPost.description}</p>
      </div>

      {/* Flash Offer */}
      {offer && (
        <div className={`mx-4 mt-3 rounded-xl overflow-hidden border ${offerExpired || offerFull ? 'opacity-60 border-stone-200' : 'border-amber-200'}`}>
          <div className={`px-4 py-2 flex items-center gap-2 ${offerExpired || offerFull ? 'bg-stone-50' : 'bg-gradient-to-r from-amber-50 to-orange-50'}`}>
            <Zap className={`w-4 h-4 shrink-0 ${offerExpired || offerFull ? 'text-stone-400' : 'text-amber-500'}`} />
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm truncate ${offerExpired || offerFull ? 'text-stone-500' : 'text-amber-800'}`}>
                {offer.title}
              </p>
              {offer.description && (
                <p className="text-[11px] text-amber-700/80 line-clamp-1">{offer.description}</p>
              )}
            </div>
            {!offerExpired && !offerFull && (
              <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-orange-600">
                <Clock className="w-3 h-3" />
                {countdown}
              </div>
            )}
          </div>

          {offer.totalSlots && (
            <div className="px-4 py-1.5 bg-white border-t border-amber-100/60">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-text-secondary">{offer.claimedSlots} de {offer.totalSlots} reclamados</span>
                <span className={`font-semibold ${offerFull ? 'text-red-500' : 'text-amber-600'}`}>
                  {offerFull ? 'Agotado' : `${offer.totalSlots - offer.claimedSlots} disponibles`}
                </span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (offer.claimedSlots / offer.totalSlots) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {!offerExpired && !offerFull && (
            <div className="px-4 py-2 bg-white border-t border-amber-100/60">
              {showOfferCode && offer.code ? (
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-mono font-bold text-amber-800 flex-1 text-sm tracking-wider">{offer.code}</span>
                  <button onClick={copyCode}
                    className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold hover:text-amber-800 transition-colors">
                    {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {codeCopied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              ) : (
                <button onClick={handleClaimOffer}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all active:scale-[0.98]">
                  {offer.code ? '¡Revelar código!' : 'Reclamar oferta'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reactions + actions */}
      <div className="px-4 pt-3 pb-4">
        {totalReactions > 0 && (
          <div className="flex items-center gap-1 mb-2 text-[11px] text-text-secondary">
            <span>{REACTIONS.filter(r => localPost.reactionsCount[r.key] > 0).map(r => r.emoji).join('')}</span>
            <span>{totalReactions} {totalReactions === 1 ? 'reacción' : 'reacciones'}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {REACTIONS.map(({ key, emoji, label }) => (
              <button
                key={key}
                onClick={() => handleReact(key)}
                title={label}
                className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-sm transition-all active:scale-90 ${
                  localPost.userReaction === key
                    ? 'bg-primary-100 scale-110 shadow-sm'
                    : 'hover:bg-stone-50'
                }`}
              >
                <span>{emoji}</span>
                {localPost.reactionsCount[key] > 0 && (
                  <span className="text-[10px] text-text-secondary font-medium">{localPost.reactionsCount[key]}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {localPost.commentsCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                <MessageCircle className="w-3.5 h-3.5" />
                {localPost.commentsCount}
              </span>
            )}
            <button className="p-1.5 rounded-xl hover:bg-stone-50 transition-colors text-text-secondary">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default BusinessPostCard;
