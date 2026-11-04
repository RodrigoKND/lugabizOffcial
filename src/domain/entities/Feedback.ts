export type FeedbackType = 'idea' | 'problema' | 'opinion' | 'otro';
export type FeedbackStatus = 'nuevo' | 'visto' | 'planeado' | 'hecho' | 'archivado';

export const FEEDBACK_TYPES: { id: FeedbackType; label: string }[] = [
  { id: 'idea', label: 'Idea' },
  { id: 'problema', label: 'Problema' },
  { id: 'opinion', label: 'Opinión' },
  { id: 'otro', label: 'Otro' },
];

export const FEEDBACK_STATUSES: { id: FeedbackStatus; label: string }[] = [
  { id: 'nuevo', label: 'Nuevas' },
  { id: 'visto', label: 'Vistas' },
  { id: 'planeado', label: 'Planeadas' },
  { id: 'hecho', label: 'Hechas' },
  { id: 'archivado', label: 'Archivadas' },
];

export const FEEDBACK_MIN = 5;
export const FEEDBACK_MAX = 1000;

export interface FeedbackItem {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  type: FeedbackType;
  message: string;
  rating?: number;
  page?: string;
  status: FeedbackStatus;
  createdAt: string;
}

export interface FeedbackPage {
  items: FeedbackItem[];
  nextCursor: string | null;
}

export type FeedbackCounts = Record<FeedbackStatus, number>;

// Devuelve el motivo del rechazo, o null si el mensaje es válido.
export function validateFeedback(message: string): string | null {
  const len = message.trim().length;
  if (len < FEEDBACK_MIN) return `Cuéntanos un poco más (mínimo ${FEEDBACK_MIN} caracteres)`;
  if (len > FEEDBACK_MAX) return `Máximo ${FEEDBACK_MAX} caracteres`;
  return null;
}
