import { BadgeCheck, Clock, AlertTriangle } from 'lucide-react';
import type { OwnerBusiness } from '@lib/supabase';

const StatusBadge: React.FC<{ status: OwnerBusiness['docsStatus'] }> = ({ status }) => {
  if (status === 'approved') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold ring-1 ring-amber-200"><BadgeCheck className="w-3 h-3" /> Verificado</span>
  );
  if (status === 'pending') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold ring-1 ring-blue-200"><Clock className="w-3 h-3" /> En revisión</span>
  );
  if (status === 'rejected') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold ring-1 ring-red-200"><AlertTriangle className="w-3 h-3" /> No aprobado</span>
  );
  return null;
};

export default StatusBadge;
