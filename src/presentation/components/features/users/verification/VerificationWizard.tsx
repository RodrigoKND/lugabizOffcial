import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Camera, CreditCard, FileCheck2, Loader2, Clock, CheckCircle2, ChevronRight, ChevronLeft, Lock, Sparkles, AlertTriangle, RotateCcw, BadgeCheck } from 'lucide-react';
import { useAuth } from '@presentation/context';
import { ownerVerificationService, type OwnerVerification, type IdentityPrecheck } from '@lib/supabase';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'intro' | 'business' | 'identity' | 'analyzing' | 'review' | 'docs' | 'sending' | 'done' | 'pending' | 'verified';

// Selector de un solo archivo con vista previa, estilo de la app (primary-*)
const FilePicker: React.FC<{
  label: string;
  hint: string;
  icon: React.ReactNode;
  file: File | null;
  onSelect: (f: File | null) => void;
}> = ({ label, hint, icon, file, onSelect }) => {
  const ref = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <button type="button" onClick={() => ref.current?.click()}
      className="w-full flex items-center gap-3 p-3 bg-primary-50/50 border border-primary-100 rounded-xl text-left hover:border-primary-300 transition-all">
      <div className="w-12 h-12 rounded-lg bg-white border border-primary-100 flex items-center justify-center overflow-hidden shrink-0">
        {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary truncate">{file ? file.name : label}</p>
        <p className="text-[11px] text-text-secondary">{file ? 'Toca para cambiar' : hint}</p>
      </div>
      {file && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)} />
    </button>
  );
};

const VerificationWizard: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(true);

  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [selfie, setSelfie] = useState<File | null>(null);
  const [ciFront, setCiFront] = useState<File | null>(null);
  const [ciBack, setCiBack] = useState<File | null>(null);
  const [bizDocs, setBizDocs] = useState<File[]>([]);
  const [precheck, setPrecheck] = useState<IdentityPrecheck | null>(null);
  // docsOnly = el dueño ya tiene la identidad verificada y solo sube documentos de negocio.
  const [docsOnly, setDocsOnly] = useState(false);
  // Inicializamos una sola vez por montaje: así cerrar/abrir la modal NO borra el
  // progreso (el estado vive en memoria). Tras un refresh el componente se vuelve a
  // montar y restauramos el BORRADOR desde el servidor (datos sensibles nunca en el navegador).
  const initedRef = useRef(false);

  useEffect(() => {
    if (!isOpen || !user || initedRef.current) return;
    initedRef.current = true;
    setLoading(true);
    ownerVerificationService.getMyVerifications(user.id)
      .then((vs: OwnerVerification[]) => {
        const pendingIdentity = vs.find(v => v.kind === 'identity' && v.status === 'pending');
        const pendingDocs = vs.find(v => v.kind === 'business_docs' && v.status === 'pending');
        if (pendingIdentity || pendingDocs) { setStep('pending'); return; }

        // Si el admin ya verificó la identidad, no se rehace: solo faltan los documentos de negocio.
        if (user.identityVerified) {
          if (user.businessDocsVerified) { setStep('verified'); return; }
          setDocsOnly(true);
          setBusinessName(user.ownerBusinessName || '');
          setStep('docs');
          return;
        }

        const draft = vs.find(v => v.kind === 'identity' && v.status === 'draft');
        if (draft) {
          const ex = (draft.extracted ?? {}) as any;
          setBusinessName(draft.businessName || user.ownerBusinessName || '');
          setFullName(ex.claimedName || '');
          setPrecheck({
            verdict: ex.verdict === 'fail' ? 'fail' : ex.verdict === 'warn' ? 'warn' : 'ok',
            message: draft.aiNotes ?? '',
            extracted: ex,
            aiScore: draft.aiScore ?? null,
            docPaths: draft.docUrls ?? [],
          });
          setStep('review');
          return;
        }
        setBusinessName(user.ownerBusinessName || '');
        setStep('intro');
      })
      .catch(() => setStep('intro'))
      .finally(() => setLoading(false));
  }, [isOpen, user]);

  if (!user) return null;

  const reset = () => {
    setStep('intro'); setFullName(''); setSelfie(null); setCiFront(null); setCiBack(null); setBizDocs([]); setPrecheck(null); setDocsOnly(false);
  };
  const close = () => {
    // No reseteamos al cerrar: conservamos el progreso. Solo limpiamos tras enviar
    // (done) para que la próxima apertura muestre el estado "en revisión".
    if (step === 'done') { reset(); initedRef.current = false; }
    onClose();
  };

  // Paso 1 del check: la IA analiza las fotos y devuelve veredicto + sugerencias.
  const runPrecheck = async () => {
    if (!selfie || !ciFront || !ciBack || !fullName.trim()) return;
    setStep('analyzing');
    try {
      const result = await ownerVerificationService.precheckIdentity(user.id, {
        businessName: businessName.trim(), fullName: fullName.trim(), selfieFile: selfie, ciFrontFile: ciFront, ciBackFile: ciBack ?? undefined,
      });
      setPrecheck(result);
      setStep('review');
    } catch (e: any) {
      toast.error(e?.message ?? 'No se pudo analizar. Intentá de nuevo.');
      setStep('identity');
    }
  };

  // Reintentar: descarta el borrador en el servidor y vuelve a tomar las fotos.
  const retake = () => {
    ownerVerificationService.discardIdentityDraft().catch(() => {});
    setSelfie(null); setCiFront(null); setCiBack(null); setPrecheck(null);
    setStep('identity');
  };

  // Paso 2: enviar a revisión (solo si la IA no marcó 'fail').
  const submit = async () => {
    if (!precheck || precheck.verdict === 'fail' || !businessName.trim()) return;
    setStep('sending');
    try {
      await ownerVerificationService.submitIdentity(user.id, { businessName: businessName.trim(), precheck });
      if (bizDocs.length) {
        await ownerVerificationService.submitBusinessDocs(user.id, { businessName: businessName.trim(), docFiles: bizDocs });
      }
      // No marcamos al usuario como dueño aquí: el rol se otorga solo cuando el
      // admin aprueba la identidad. Mientras tanto la solicitud queda "en revisión".
      setStep('done');
    } catch (e: any) {
      toast.error(e?.message ?? 'No se pudo enviar la verificación.');
      setStep('review');
    }
  };

  // Envío SOLO de documentos de negocio (cuando la identidad ya está verificada).
  const submitDocsOnly = async () => {
    if (!bizDocs.length) return;
    setStep('sending');
    try {
      await ownerVerificationService.submitBusinessDocs(user.id, {
        businessName: (user.ownerBusinessName || businessName).trim() || 'Mi negocio',
        docFiles: bizDocs,
      });
      setStep('done');
    } catch (e: any) {
      toast.error(e?.message ?? 'No se pudieron enviar los documentos.');
      setStep('docs');
    }
  };

  const verdictStyles = {
    ok:   { wrap: 'bg-green-50 border-green-200', icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, text: 'text-green-700' },
    warn: { wrap: 'bg-amber-50 border-amber-200', icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, text: 'text-amber-700' },
    fail: { wrap: 'bg-red-50 border-red-200', icon: <AlertTriangle className="w-5 h-5 text-red-500" />, text: 'text-red-700' },
  } as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={close}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between p-5 border-b border-primary-100 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-500" />
                <h3 className="text-base font-bold text-text-primary">Verificar mi negocio</h3>
              </div>
              <button onClick={close} className="p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary-400 animate-spin" /></div>
              ) : step === 'pending' ? (
                <div className="text-center py-6 space-y-3">
                  <Clock className="w-12 h-12 text-amber-400 mx-auto" />
                  <h4 className="font-bold text-text-primary">Estamos revisando tu solicitud</h4>
                  <p className="text-sm text-text-secondary">Tu verificación está en revisión. Te avisaremos en tus notificaciones cuando tu negocio reciba la insignia.</p>
                </div>
              ) : step === 'verified' ? (
                <div className="text-center py-6 space-y-3">
                  <BadgeCheck className="w-12 h-12 text-amber-500 mx-auto" />
                  <h4 className="font-bold text-text-primary">Tu negocio ya está verificado</h4>
                  <p className="text-sm text-text-secondary">Tenés la insignia dorada de negocio verificado. ¡No necesitás hacer nada más!</p>
                  <button onClick={close} className="mt-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all">Entendido</button>
                </div>
              ) : step === 'done' ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                  <h4 className="font-bold text-text-primary">¡Solicitud enviada!</h4>
                  <p className="text-sm text-text-secondary">La revisaremos pronto y te avisaremos en tus notificaciones. La insignia de confianza aparecerá al aprobarse.</p>
                  <button onClick={close} className="mt-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all">Entendido</button>
                </div>
              ) : step === 'sending' ? (
                <div className="text-center py-10 space-y-3">
                  <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto" />
                  <p className="text-sm text-text-secondary">Enviando a revisión…</p>
                </div>
              ) : step === 'analyzing' ? (
                <div className="text-center py-10 space-y-3">
                  <div className="relative w-12 h-12 mx-auto">
                    <Loader2 className="w-12 h-12 text-primary-300 animate-spin" />
                    <Sparkles className="w-5 h-5 text-primary-500 absolute inset-0 m-auto" />
                  </div>
                  <p className="text-sm text-text-secondary">La IA está verificando tu identidad…</p>
                  <p className="text-[11px] text-text-secondary">Comparando tu selfie con el carnet</p>
                </div>
              ) : step === 'intro' ? (
                <div className="space-y-4">
                  <p className="text-sm text-text-secondary">
                    Verificá que detrás de tu negocio hay una persona real. Esto <strong>no te clasifica</strong> ni
                    comparte tus datos: solo genera confianza y te permite publicar ofertas. Tus documentos son
                    privados y solo los ve nuestro equipo de revisión.
                  </p>
                  <ul className="space-y-2 text-sm text-text-primary">
                    <li className="flex items-center gap-2"><Camera className="w-4 h-4 text-primary-500" /> Una selfie tuya</li>
                    <li className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary-500" /> Foto de tu carnet de identidad</li>
                    <li className="flex items-center gap-2"><FileCheck2 className="w-4 h-4 text-primary-500" /> (Opcional) NIT, SEPREC o licencia → insignia dorada</li>
                  </ul>
                  <button onClick={() => setStep('business')}
                    className="w-full py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all flex items-center justify-center gap-1">
                    Comenzar <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : step === 'business' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Nombre de tu negocio</label>
                    <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                      placeholder="Ej: Salteñería Doña Marta"
                      className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setStep('intro')} className="px-4 py-2.5 bg-primary-50 text-text-secondary rounded-xl font-semibold text-sm flex items-center gap-1"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setStep('identity')} disabled={!businessName.trim()}
                      className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center gap-1">
                      Continuar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : step === 'identity' ? (
                <div className="space-y-3">
                  <p className="text-xs text-text-secondary">Escribí tu nombre tal como figura en tu carnet y subí tu selfie y <strong>ambos lados</strong> del carnet (en Bolivia el nombre puede estar adelante o atrás). La IA verificará que coincidan.</p>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Nombre completo (como en el carnet)</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Ej: María Fernanda Quispe Mamani"
                      className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all" />
                  </div>
                  <FilePicker label="Subir selfie" hint="Tu rostro, buena luz" icon={<Camera className="w-5 h-5 text-primary-400" />} file={selfie} onSelect={setSelfie} />
                  <FilePicker label="Carnet (anverso)" hint="Lado con tu foto" icon={<CreditCard className="w-5 h-5 text-primary-400" />} file={ciFront} onSelect={setCiFront} />
                  <FilePicker label="Carnet (reverso)" hint="Lado posterior (suele tener el nombre)" icon={<CreditCard className="w-5 h-5 text-primary-400" />} file={ciBack} onSelect={setCiBack} />
                  <p className="flex items-center gap-1.5 text-[11px] text-text-secondary"><Lock className="w-3 h-3" /> Guardado de forma privada. No se muestra a otros usuarios.</p>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setStep('business')} className="px-4 py-2.5 bg-primary-50 text-text-secondary rounded-xl font-semibold text-sm flex items-center gap-1"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={runPrecheck} disabled={!selfie || !ciFront || !ciBack || !fullName.trim()}
                      className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Analizar con IA
                    </button>
                  </div>
                </div>
              ) : step === 'review' && precheck ? (
                <div className="space-y-4">
                  <div className={`flex items-start gap-3 p-4 rounded-xl border ${verdictStyles[precheck.verdict].wrap}`}>
                    {verdictStyles[precheck.verdict].icon}
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${verdictStyles[precheck.verdict].text}`}>
                        {precheck.verdict === 'fail' ? 'No podemos continuar' : 'Verificación correcta'}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">{precheck.message}</p>
                    </div>
                  </div>

                  {precheck.verdict === 'fail' ? (
                    <button onClick={retake}
                      className="w-full py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all flex items-center justify-center gap-1.5">
                      <RotateCcw className="w-4 h-4" /> Volver a tomar las fotos
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={retake} className="px-4 py-2.5 bg-primary-50 text-text-secondary rounded-xl font-semibold text-sm flex items-center gap-1" title="Volver a tomar"><RotateCcw className="w-4 h-4" /></button>
                      <button onClick={() => setStep('docs')}
                        className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all flex items-center justify-center gap-1">
                        Continuar <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : step === 'docs' ? (
                <div className="space-y-3">
                  {docsOnly ? (
                    <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <p className="text-xs text-green-700">Tu identidad ya está verificada. Subí tus documentos de negocio (NIT, SEPREC o licencia) para obtener la <strong>insignia dorada</strong> de negocio verificado.</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
                      <FileCheck2 className="w-5 h-5 text-amber-500 shrink-0" />
                      <p className="text-xs text-amber-700">Opcional. Si tu negocio está registrado (NIT, SEPREC, licencia), subilo para obtener la <strong>insignia dorada</strong> de máxima confianza. Si no lo tenés, podés saltarlo.</p>
                    </div>
                  )}
                  <FilePicker label="Documento de negocio" hint="NIT / SEPREC / licencia"
                    icon={<FileCheck2 className="w-5 h-5 text-primary-400" />}
                    file={bizDocs[0] ?? null}
                    onSelect={(f) => setBizDocs(f ? [f, ...bizDocs.slice(1)] : bizDocs.slice(1))} />
                  {bizDocs.length > 0 && (
                    <FilePicker label="Otro documento — opcional" hint="Agregar otro"
                      icon={<FileCheck2 className="w-5 h-5 text-primary-400" />}
                      file={bizDocs[1] ?? null}
                      onSelect={(f) => setBizDocs(f ? [bizDocs[0], f] : [bizDocs[0]])} />
                  )}
                  <div className="flex gap-2 pt-1">
                    {docsOnly ? (
                      <button onClick={close} className="px-4 py-2.5 bg-primary-50 text-text-secondary rounded-xl font-semibold text-sm">Después</button>
                    ) : (
                      <button onClick={() => setStep('review')} className="px-4 py-2.5 bg-primary-50 text-text-secondary rounded-xl font-semibold text-sm flex items-center gap-1"><ChevronLeft className="w-4 h-4" /></button>
                    )}
                    <button onClick={docsOnly ? submitDocsOnly : submit} disabled={docsOnly && bizDocs.length === 0}
                      className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center gap-1">
                      {docsOnly ? 'Enviar documentos' : 'Enviar a revisión'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VerificationWizard;
