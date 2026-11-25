export const MAX_INVITEES = 5;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 4;

export interface CreatePickDraft {
  inviteeCount: number;
  optionCount: number;
  planDate: string;
  planTime: string;
}

// Devuelve el motivo por el que aún no se puede crear la votación, o null si está lista. Los mismos límites los exige la base de datos.
export function canCreateGroupPick({ inviteeCount, optionCount, planDate, planTime }: CreatePickDraft): string | null {
  if (inviteeCount < 1) return 'Invita al menos a un amigo.';
  if (inviteeCount > MAX_INVITEES) return `Máximo ${MAX_INVITEES} amigos.`;
  if (optionCount < MIN_OPTIONS) return `Agrega al menos ${MIN_OPTIONS} opciones.`;
  if (optionCount > MAX_OPTIONS) return `Máximo ${MAX_OPTIONS} opciones.`;
  if (!planDate || !planTime) return 'Elige la fecha y la hora.';
  return null;
}
