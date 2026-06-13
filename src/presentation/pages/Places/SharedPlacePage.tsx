import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSmartBack } from '@presentation/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Star, CheckCircle, Users, ExternalLink, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@lib/supabase/client';
import { placesService, placeSharesService } from '@lib/supabase';
import { useAuth } from '@presentation/context';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import { Place, PlaceShareConfirmation } from '@domain/entities';

const SharedPlacePage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const goBack = useSmartBack('/');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [place, setPlace] = useState<Place | null>(null);
  const [sharer, setSharer] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmations, setConfirmations] = useState<PlaceShareConfirmation[]>([]);
  const [showAllConfirmers, setShowAllConfirmers] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  useSEO({ title: 'Invitación a lugar', description: 'Te invitaron a visitar un lugar en Lugabiz' });

  useEffect(() => {
    if (!shareId) return;
    (async () => {
      try {
        const share = await placeSharesService.getShareById(shareId);
        if (!share) { toast.error('Invitación no encontrada'); navigate('/'); return; }

        const [placeData, sharerData] = await Promise.all([
          placesService.getPlaceById(share.placeId),
          supabase.from('users').select('id, name, avatar').eq('id', share.sharedBy).single(),
        ]);

        if (!placeData) { toast.error('Lugar no encontrado'); navigate('/'); return; }

        setPlace(placeData);
        setSharer(sharerData.data);

        const confirmations = await placeSharesService.getConfirmations(shareId);
        setConfirmations(confirmations);

        if (user) {
          const already = confirmations.find(c => c.userId === user.id);
          if (already) setConfirmed(true);
        }

        setLoading(false);
      } catch {
        if (!user) {
          setNeedsAuth(true);
          setLoading(false);
        } else {
          toast.error('Error al cargar');
          navigate('/');
        }
      }
    })();
  }, [shareId, user, navigate]);

  useEffect(() => {
    if (!shareId) return;
    const unsub = placeSharesService.subscribeToConfirmations(shareId, async () => {
      const confirmations = await placeSharesService.getConfirmations(shareId);
      setConfirmations(confirmations);
    });
    return () => unsub.then(fn => fn());
  }, [shareId]);

  const handleConfirm = async () => {
    if (!user) { toast.error('Inicia sesión para confirmar'); return; }
    if (!shareId) return;
    setConfirming(true);
    try {
      await placeSharesService.confirmShare(shareId, user.id);
      setConfirmed(true);
      const confirmations = await placeSharesService.getConfirmations(shareId);
      setConfirmations(confirmations);
      toast.success('Asistencia confirmada!');
    } catch { toast.error('Error al confirmar'); }
    setConfirming(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 flex items-center justify-center">
      <div className="w-8 h-8 border-[3px] border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (needsAuth && !place) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-purple-100/60 shadow-xl shadow-purple-200/20 p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-8 h-8 text-purple-500" />
        </div>
        <h2 className="text-xl font-bold text-stone-800 mb-2">Inicia sesión</h2>
        <p className="text-sm text-stone-500 mb-6 leading-relaxed">
          Debes iniciar sesión para ver los detalles de esta invitación y confirmar tu asistencia.
        </p>
        <Link to="/?auth=login"
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-200/40 transition-all">
          <LogIn className="w-4 h-4" /> Iniciar sesión
        </Link>
        <button onClick={goBack} className="mt-3 w-full py-2.5 text-stone-500 text-sm hover:text-stone-700 transition-colors">
          Volver
        </button>
      </motion.div>
    </div>
  );

  if (!place || !sharer) return null;

  const visibleConfirmers = showAllConfirmers ? confirmations : confirmations.slice(0, 5);
  const remaining = confirmations.length - 5;

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50">
      <div className="purple-blob w-72 h-72 bg-purple-200/30 -top-20 -left-20" />
      <div className="purple-blob w-80 h-80 bg-amber-200/20 top-1/3 -right-32" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6">
        <button onClick={goBack}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors mb-4">
          <ArrowLeft className="w-5 h-5" /> Volver
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-purple-100/60 shadow-xl shadow-purple-200/20 overflow-hidden">
          {/* Hero */}
          <div className="relative h-48 sm:h-56 bg-gradient-to-br from-purple-600 via-purple-700 to-amber-600 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-3">
                {sharer.avatar ? (
                  <img src={sharer.avatar} alt="" className="w-12 h-12 rounded-full ring-2 ring-white/60 object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/20 ring-2 ring-white/60 flex items-center justify-center text-white font-bold text-lg">
                    {sharer.name.charAt(0)}
                  </div>
                )}
                <div className="text-white">
                  <p className="text-sm font-semibold drop-shadow-sm">
                    <span className="font-bold">{sharer.name}</span> te invitó
                  </p>
                  <p className="text-xs text-white/80 drop-shadow-sm">a visitar este lugar</p>
                </div>
              </div>
            </div>
          </div>

          {/* Place info */}
          <div className="p-5">
            {place.image && (
              <div className="relative -mt-20 mb-4 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                <img src={place.image} alt={place.name} className="w-full h-44 object-cover" />
              </div>
            )}

            <h1 className="text-xl font-bold text-stone-800 mb-1">{place.name}</h1>

            {place.category && (
              <span className="inline-block text-[11px] font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full mb-3">
                {place.category.name}
              </span>
            )}

            <p className="text-sm text-stone-600 leading-relaxed mb-4">{place.description}</p>

            <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-stone-700">{place.rating}</span>
                <span>({place.reviewCount})</span>
              </div>
              {place.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <span className="text-xs truncate max-w-[200px]">{place.address}</span>
                </div>
              )}
            </div>

            {/* Confirm button */}
            {user ? (
              confirmed ? (
                <div className="flex items-center gap-2 py-3 px-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-semibold">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Confirmaste tu asistencia
                </div>
              ) : (
                <button onClick={handleConfirm} disabled={confirming}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-2xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-200/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {confirming ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <CheckCircle className="w-5 h-5" />}
                  {confirming ? 'Confirmando...' : 'Confirmar asistencia'}
                </button>
              )
            ) : (
              <div className="space-y-2">
                <button disabled
                  className="w-full py-3.5 bg-stone-100 text-stone-400 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-stone-200">
                  <CheckCircle className="w-5 h-5" /> Confirmar asistencia
                </button>
                <p className="text-center text-xs text-stone-500">
                  <Link to="/?auth=login" className="text-purple-600 font-semibold hover:underline">Inicia sesión</Link> para confirmar tu asistencia
                </p>
              </div>
            )}

            {/* View place */}
            <Link to={`/place/${place.id}`}
              className="mt-3 w-full py-2.5 bg-stone-50 border border-stone-200 text-stone-600 rounded-2xl font-medium text-sm hover:bg-stone-100 transition-all flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" /> Ver lugar completo
            </Link>

            {/* Confirmers */}
            {confirmations.length > 0 && (
              <div className="mt-6 pt-5 border-t border-stone-100">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                    {confirmations.length} confirmaron
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AnimatePresence>
                    {visibleConfirmers.map((c, i) => (
                      <motion.div key={c.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 rounded-full border border-purple-100">
                        {c.userAvatar ? (
                          <img src={c.userAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 text-[9px] font-bold flex items-center justify-center">
                            {c.userName?.charAt(0) || '?'}
                          </div>
                        )}
                        <span className="text-[11px] font-medium text-purple-700">{c.userName}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {!showAllConfirmers && remaining > 0 && (
                    <button onClick={() => setShowAllConfirmers(true)}
                      className="text-[11px] font-semibold text-purple-500 hover:text-purple-600 transition-colors px-2">
                      +{remaining} más
                    </button>
                  )}
                  {showAllConfirmers && confirmations.length > 5 && (
                    <button onClick={() => setShowAllConfirmers(false)}
                      className="text-[11px] font-semibold text-purple-500 hover:text-purple-600 transition-colors px-2">
                      Mostrar menos
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SharedPlacePage;
