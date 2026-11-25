import { useState } from 'react';
import { Vote } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@presentation/context';
import type { PickOptionDraft } from '@presentation/hooks/social/useCreateGroupPick';
import CreateGroupPickModal from './CreateGroupPickModal';

interface GroupPickButtonProps {
  draft: PickOptionDraft;
  className?: string;
}

// Desde un lugar o evento: "¿Dónde vamos?" con ese sitio ya como primera opción.
export default function GroupPickButton({ draft, className = '' }: GroupPickButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!user) { toast.error('Inicia sesión para armar una votación'); return; }
    setOpen(true);
  };

  return (
    <>
      <button type="button" onClick={handleClick}
        className={`flex h-12 items-center justify-center gap-2 rounded-lg bg-lg-surface-2 px-4 text-sm font-bold text-lg-text transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lg-text ${className}`}>
        <Vote className="h-4 w-4" /> ¿Dónde vamos?
      </button>
      <CreateGroupPickModal isOpen={open} onClose={() => setOpen(false)} initial={draft} />
    </>
  );
}
