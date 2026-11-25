import type { GroupPickStatus } from '@domain/entities/GroupPick';

export type PickPrimaryAction = 'vote' | 'close' | 'go' | 'wait' | 'none';

export interface PickStateInput {
  status: GroupPickStatus;
  // Abierta = status 'open' y todavía no venció el plazo.
  isOpen: boolean;
  isCreator: boolean;
  myVotedAll: boolean;
  hasWinner: boolean;
}

// Una sola acción principal por estado (la pantalla solo muestra ese botón): votar → cerrar y elegir → ir al plan.
export function groupPickPrimaryAction({ status, isOpen, isCreator, myVotedAll, hasWinner }: PickStateInput): PickPrimaryAction {
  if (status === 'cancelled') return 'none';
  if (status === 'decided') return isCreator ? 'go' : 'wait';
  if (!isOpen) return isCreator && hasWinner ? 'close' : 'wait';
  if (!myVotedAll) return 'vote';
  return isCreator && hasWinner ? 'close' : 'wait';
}

// A quién invitar al plan ganador: quienes votaron (menos yo); si nadie más votó, todos los miembros.
export function planInviteeIds(members: Array<{ userId: string }>, votes: Array<{ userId: string }>, myId: string): string[] {
  const voters = new Set(votes.map(v => v.userId));
  const others = members.map(m => m.userId).filter(id => id !== myId);
  const voted = others.filter(id => voters.has(id));
  return voted.length > 0 ? voted : others;
}
