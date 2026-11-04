import { useState } from 'react';
import { Check, Loader2, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPlanWhen, planShareText, planShareUrl, renderPlanImage, type PlanSummary } from '@presentation/hooks/social/planShare';

interface PlanShareViewProps {
  targetName: string;
  placeId?: string;
  eventId?: string;
  summary: PlanSummary;
  onDone: () => void;
}

// Paso final al crear un plan: tarjeta lista para mandar a los panas (imagen + enlace).
const PlanShareView: React.FC<PlanShareViewProps> = ({ targetName, placeId, eventId, summary, onDone }) => {
  const [sharing, setSharing] = useState(false);
  const when = formatPlanWhen(summary.planDate, summary.planTime);
  const url = planShareUrl(window.location.origin, { eventId, placeId });
  const text = planShareText(targetName, when);

  const share = async () => {
    setSharing(true);
    try {
      const blob = await renderPlanImage(targetName, when, summary.note);
      const file = new File([blob], 'plan-lugabiz.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, url });
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(link.href);
        await navigator.clipboard?.writeText(`${text} ${url}`);
        toast.success('Imagen descargada y mensaje copiado');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') toast.error('No se pudo compartir el plan');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="p-5 space-y-4">
      <div className="rounded-3xl bg-lg-ground p-5">
        <p className="font-flyer-sm text-sm text-lg-accent">Vamos pues, panas</p>
        <p className="font-flyer text-3xl text-lg-text mt-2 leading-none">{targetName}</p>
        <p className="mt-3 font-bold text-lg-accent">{when}</p>
        {summary.note && <p className="mt-2 text-sm text-lg-dim">{summary.note}</p>}
      </div>
      <button onClick={share} disabled={sharing}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-lg-accent py-3 text-sm font-extrabold text-lg-ink hover:brightness-110 transition disabled:opacity-60">
        {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
        Compartir con los panas
      </button>
      <button onClick={onDone} className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-lg-dim hover:text-lg-text transition-colors">
        <Check className="w-4 h-4" /> Listo
      </button>
    </div>
  );
};

export default PlanShareView;
