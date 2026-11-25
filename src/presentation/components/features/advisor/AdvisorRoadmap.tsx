import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BusinessAdvisorReport } from '@lib/supabase/services/ai/businessAdvisorService';
import { useAuth } from '@presentation/context';
import { useAdvisorProgress } from '@presentation/hooks/advisor/useAdvisorProgress';
import { AuthModal } from '@presentation/components/features';
import { buildRoadmap, type DetailTab } from './roadmap';
import RoadmapStopCard from './RoadmapStopCard';

interface AdvisorRoadmapProps {
  report: BusinessAdvisorReport;
  onOpenDetail: (tab: DetailTab) => void;
}

// El informe del asesor como camino: paradas con resumen, progreso guardado y, al final, abrir el negocio en Lugabiz.
export default function AdvisorRoadmap({ report, onOpenDetail }: AdvisorRoadmapProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  const stops = useMemo(() => buildRoadmap(report), [report]);
  const order = useMemo(() => stops.filter(s => s.id !== 'lugabiz').map(s => s.id), [stops]);
  const { done, toggle, currentId } = useAdvisorProgress(report, order);

  const handleFinish = () => (user ? navigate('/profile?verify=1') : setShowAuth(true));

  return (
    <section aria-label="Tu camino para abrir el negocio">
      <ol className="space-y-3">
        {stops.map((stop, i) => (
          <RoadmapStopCard key={stop.id} stop={stop} index={i} isLast={i === stops.length - 1}
            isDone={done.includes(stop.id)}
            isCurrent={stop.id === currentId || (stop.id === 'lugabiz' && currentId === undefined)}
            onToggle={() => toggle(stop.id)}
            onDetail={() => stop.tab && onOpenDetail(stop.tab)}
            onFinish={handleFinish} />
        ))}
      </ol>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialMode="register" />
    </section>
  );
}
