import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Zap, Plus, Trash2, Clock, AlertCircle, Lock } from 'lucide-react';
import { postsService } from '@lib/supabase/services/posts/posts';
import { storageService } from '@lib/supabase/services/storageImages/storageImages';
import { useAuth } from '@presentation/context';
import { BusinessPost, FlashOffer } from '@domain/entities/Post';
import { moderateContent } from '@lib/supabase/services/moderation/moderationService';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (post: BusinessPost) => void;
}

const MAX_IMAGES = 4;
const MAX_TOTAL_MB = 10;
const MAX_DESC = 280;

function toLocalDatetimeInput(isoStr: string): string {
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [withOffer, setWithOffer] = useState(false);
  const [offer, setOffer] = useState<Partial<FlashOffer>>({ claimedSlots: 0 });
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setImages([]); setPreviews([]); setDescription('');
    setWithOffer(false); setOffer({ claimedSlots: 0 });
  }

  function handleClose() { resetForm(); onClose(); }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    const totalFiles = images.length + arr.length;
    if (totalFiles > MAX_IMAGES) {
      toast.error(`Máximo ${MAX_IMAGES} imágenes`);
      return;
    }
    const totalSize = [...images, ...arr].reduce((s, f) => s + f.size, 0);
    if (totalSize > MAX_TOTAL_MB * 1024 * 1024) {
      toast.error(`Las imágenes no pueden superar ${MAX_TOTAL_MB} MB en total`);
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const invalid = arr.find(f => !validTypes.includes(f.type));
    if (invalid) { toast.error('Solo se permiten imágenes JPG, PNG, WEBP o GIF'); return; }

    setImages(prev => [...prev, ...arr]);
    arr.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  }

  function removeImage(i: number) {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    if (!user) return;
    if (!description.trim()) { toast.error('Escribe una descripción'); return; }
    if (withOffer && !user.identityVerified) { toast.error('Verificá tu identidad para crear ofertas con código'); return; }
    if (withOffer && !offer.title?.trim()) { toast.error('La oferta necesita un título'); return; }
    if (withOffer && !offer.expiresAt) { toast.error('Define cuándo expira la oferta'); return; }

    const contentToCheck = `${description} ${offer.title ?? ''}`.trim();
    const modResult = await moderateContent(contentToCheck, 'post', user.id, user.name);
    if (!modResult.approved) {
      toast.error(`Contenido no permitido: ${modResult.reason ?? 'Infringe las normas de la comunidad'}`);
      return;
    }

    setLoading(true);
    try {
      const urls: string[] = [];
      for (const file of images) {
        const url = await postsService.uploadPostImage(file);
        urls.push(url);
      }

      if (urls.length > 0) {
        const imgModResult = await moderateContent('', 'post', user.id, user.name, urls);
        if (!imgModResult.approved) {
          storageService.deleteImagesByUrls(urls).catch(() => {});
          toast.error(`Imagen no permitida: ${imgModResult.reason ?? 'Infringe las normas'}`);
          setLoading(false);
          return;
        }
      }

      const flashOffer: FlashOffer | undefined = withOffer && offer.title && offer.expiresAt
        ? { title: offer.title, description: offer.description, expiresAt: offer.expiresAt, totalSlots: offer.totalSlots, claimedSlots: 0, code: offer.code }
        : undefined;

      const post = await postsService.createPost({
        userId: user.id,
        images: urls,
        description: description.trim(),
        flashOffer,
      });

      if (post) {
        onCreated(post);
        toast.success('¡Post publicado!');
        handleClose();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error al publicar');
    } finally {
      setLoading(false);
    }
  }

  const totalSize = images.reduce((s, f) => s + f.size, 0);
  const totalMB = (totalSize / (1024 * 1024)).toFixed(1);
  const canSubmit = description.trim().length > 0 && !loading;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 pb-14 sm:pb-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <div>
                <h2 className="font-bold text-text-primary">Nuevo post del negocio</h2>
                <p className="text-[11px] text-text-secondary">Solo visible para dueños de negocios</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-xl hover:bg-stone-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {/* Description */}
              <div>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value.slice(0, MAX_DESC))}
                  placeholder="¿Qué quieres compartir con la comunidad? Novedades, ofertas, fotos del día…"
                  rows={4}
                  className="w-full text-sm text-text-primary placeholder:text-stone-400 resize-none border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-[11px] ${description.length > MAX_DESC * 0.9 ? 'text-amber-500' : 'text-text-secondary'}`}>
                    {description.length}/{MAX_DESC}
                  </span>
                </div>
              </div>

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    Imágenes ({images.length}/{MAX_IMAGES})
                  </label>
                  {images.length > 0 && (
                    <span className="text-[11px] text-text-secondary">{totalMB} MB / {MAX_TOTAL_MB} MB</span>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <button onClick={() => fileRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-primary-200 flex flex-col items-center justify-center gap-1 text-primary-400 hover:bg-primary-50 hover:border-primary-300 transition-all">
                      <Image className="w-5 h-5" />
                      <span className="text-[10px] font-medium">Agregar</span>
                    </button>
                  )}
                </div>

                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => handleFiles(e.target.files)} />
              </div>

              {/* Flash Offer toggle — requiere identidad verificada (anti-estafa) */}
              <div>
                {!user?.identityVerified ? (
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-stone-50">
                    <Lock className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-text-secondary">
                      <p className="font-semibold text-text-primary">Ofertas con código bloqueadas</p>
                      <p>Verificá tu identidad en tu perfil para crear ofertas. Así protegemos a la comunidad de estafas. Mientras tanto, podés publicar fotos y novedades sin límite.</p>
                    </div>
                  </div>
                ) : (
                <>
                <button
                  onClick={() => setWithOffer(v => !v)}
                  className={`flex items-center gap-2 w-full px-4 py-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                    withOffer
                      ? 'border-amber-400 bg-amber-50 text-amber-800'
                      : 'border-dashed border-stone-200 text-text-secondary hover:border-amber-300 hover:text-amber-600'
                  }`}
                >
                  <Zap className={`w-4 h-4 ${withOffer ? 'text-amber-500' : ''}`} />
                  {withOffer ? 'Oferta Flash incluida' : 'Agregar Oferta Flash (opcional)'}
                  {!withOffer && <Plus className="w-3.5 h-3.5 ml-auto" />}
                  {withOffer && <X className="w-3.5 h-3.5 ml-auto" onClick={(e) => { e.stopPropagation(); setWithOffer(false); }} />}
                </button>

                <AnimatePresence>
                  {withOffer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="flex items-start gap-2 text-[11px] text-amber-700">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>La Oferta Flash crea urgencia: muestra un contador, cupos disponibles y un código exclusivo que los clientes pueden reclamar.</span>
                        </div>

                        <input
                          value={offer.title || ''}
                          onChange={e => setOffer(o => ({ ...o, title: e.target.value }))}
                          placeholder="Título de la oferta (ej: 20% de descuento hoy)"
                          className="w-full text-sm border border-amber-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />

                        <input
                          value={offer.description || ''}
                          onChange={e => setOffer(o => ({ ...o, description: e.target.value }))}
                          placeholder="Descripción breve (opcional)"
                          className="w-full text-sm border border-amber-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide block mb-1">
                              <Clock className="w-3 h-3 inline mr-1" />Expira
                            </label>
                            <input
                              type="datetime-local"
                              value={offer.expiresAt ? toLocalDatetimeInput(offer.expiresAt) : ''}
                              onChange={e => setOffer(o => ({ ...o, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                              min={toLocalDatetimeInput(new Date().toISOString())}
                              className="w-full text-sm border border-amber-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide block mb-1">
                              Cupos (opcional)
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={offer.totalSlots || ''}
                              onChange={e => setOffer(o => ({ ...o, totalSlots: parseInt(e.target.value) || undefined }))}
                              placeholder="Ej: 50"
                              className="w-full text-sm border border-amber-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                            />
                          </div>
                        </div>

                        <input
                          value={offer.code || ''}
                          onChange={e => setOffer(o => ({ ...o, code: e.target.value.toUpperCase() }))}
                          placeholder="Código de descuento (ej: LUGABIZ20)"
                          className="w-full text-sm font-mono border border-amber-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 uppercase"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-stone-100 flex items-center gap-3">
              <button onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-text-secondary text-sm font-semibold hover:bg-stone-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={!canSubmit}
                className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-bold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Publicando…
                  </>
                ) : 'Publicar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
