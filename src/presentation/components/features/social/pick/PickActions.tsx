import type { PickPrimaryAction } from '@domain/rules/groupPickState';
import type { GroupPickStatus } from '@domain/entities';

interface PickActionsProps {
  action: PickPrimaryAction;
  status: GroupPickStatus;
  canCancel: boolean;
  onClose: () => void;
  onGo: () => void;
  onCancel: () => void;
}

const BIG = 'flex h-14 w-full items-center justify-center rounded-lg text-lg font-black text-lg-ink transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lg-text';

// Un solo botón principal según el estado: votar (sin botón, se vota en las tarjetas) → cerrar y elegir → ¡Vamos!.
export default function PickActions({ action, status, canCancel, onClose, onGo, onCancel }: PickActionsProps) {
  const hint = (text: string) => <p className="rounded-lg bg-lg-surface-2 p-3 text-center text-sm font-semibold text-lg-text">{text}</p>;

  return (
    <div className="space-y-2">
      {action === 'vote' && hint('Vota cada opción con un toque.')}
      {action === 'close' && <button type="button" onClick={onClose} className={`${BIG} bg-lg-accent`}>Cerrar y elegir</button>}
      {action === 'go' && <button type="button" onClick={onGo} className={`${BIG} bg-lg-maiz`}>¡Vamos!</button>}
      {action === 'wait' && hint(status === 'decided' ? 'Ya hay ganador. El plan lo arma quien creó la votación.' : 'Esperando a los demás…')}
      {action === 'none' && hint('Esta votación se canceló.')}
      {canCancel && (
        <button type="button" onClick={onCancel} className="h-11 w-full text-sm font-bold text-lg-dim transition-colors hover:text-lg-coral">
          Cancelar votación
        </button>
      )}
    </div>
  );
}
