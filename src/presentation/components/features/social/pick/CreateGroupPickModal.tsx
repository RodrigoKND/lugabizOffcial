import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '@presentation/hooks';
import type { PickOptionDraft } from '@presentation/hooks/social/useCreateGroupPick';
import CreateGroupPickForm from './CreateGroupPickForm';

interface CreateGroupPickModalProps {
  isOpen: boolean;
  onClose: () => void;
  initial?: PickOptionDraft;
}

// "¿Dónde vamos?": arma una votación con amigos. Al crearla te lleva directo a votar.
export default function CreateGroupPickModal({ isOpen, onClose, initial }: CreateGroupPickModalProps) {
  const navigate = useNavigate();
  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-lg-ground/80 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="pick-modal-title" onClick={e => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-xl border-2 border-lg-text bg-lg-surface sm:rounded-xl poster-shadow">
        <div className="flex items-center justify-between border-b-2 border-lg-surface-2 px-4 py-2">
          <h2 id="pick-modal-title" className="font-flyer-sm text-2xl text-lg-text">¿Dónde vamos?</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-11 w-11 items-center justify-center rounded-lg text-lg-dim hover:bg-lg-surface-2 hover:text-lg-text">
            <X className="h-5 w-5" />
          </button>
        </div>
        <CreateGroupPickForm initial={initial} onCreated={id => { onClose(); navigate(`/votacion/${id}`); }} />
      </div>
    </div>,
    document.body,
  );
}
