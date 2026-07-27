import { useEffect, useState } from 'react';
import { Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { placeFakeReportsService } from '@lib/supabase';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';

interface ReportFakePlaceActionProps {
  placeId: string;
  authorId: string;
  userId?: string;
}

// Deliberadamente discreto (texto chico, sin ícono de alerta grande): la
// mayoría de los lugares son reales y no queremos que esto parezca una
// acusación por defecto. Un solo click no hace nada por sí solo — hace falta
// que 20 usuarios distintos reporten para que el lugar se oculte.
const ReportFakePlaceAction: React.FC<ReportFakePlaceActionProps> = ({ placeId, authorId, userId }) => {
  const [hasReported, setHasReported] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    placeFakeReportsService.hasReported(placeId, userId).then(setHasReported).catch(() => {});
  }, [placeId, userId]);

  if (!userId || userId === authorId) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await placeFakeReportsService.reportFake(placeId, userId);
      setHasReported(true);
      toast.success('Gracias, tu reporte quedó registrado.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar el reporte');
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={hasReported}
        className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/50 transition-colors disabled:hover:text-white/25 mt-2"
      >
        <Flag className="w-3 h-3" />
        {hasReported ? 'Reportado' : '¿Este lugar no es un negocio real?'}
      </button>
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Reportar lugar"
        message="Tu reporte es anónimo para el dueño. Solo se oculta automáticamente si muchos usuarios distintos lo reportan, así que un reporte aislado no afecta al lugar."
        confirmLabel={isSubmitting ? 'Enviando...' : 'Reportar'}
        variant="danger"
      />
    </>
  );
};

export default ReportFakePlaceAction;
