export interface PollInput {
  question: string;
  optionA: string;
  optionB: string;
}

const MAX_QUESTION = 100;
const MAX_OPTION = 30;

// Devuelve el motivo del rechazo, o null si la pregunta es válida.
export function validatePollInput({ question, optionA, optionB }: PollInput): string | null {
  const q = question.trim(), a = optionA.trim(), b = optionB.trim();
  if (!q || !a || !b) return 'Completa la pregunta y las dos opciones';
  if (q.length > MAX_QUESTION) return `La pregunta admite máximo ${MAX_QUESTION} caracteres`;
  if (a.length > MAX_OPTION || b.length > MAX_OPTION) return `Cada opción admite máximo ${MAX_OPTION} caracteres`;
  if (a.toLowerCase() === b.toLowerCase()) return 'Las dos opciones no pueden ser iguales';
  return null;
}

// Hoy ya lo resolvió el sistema (la votación se crea sola al primer pedido), así que solo se programa a futuro.
export function validateSchedule(date: string, today: string, taken: string[]): string | null {
  if (date <= today) return 'Elige una fecha futura: hoy ya tiene pregunta';
  if (taken.includes(date)) return 'Ese día ya tiene otra pregunta programada';
  return null;
}

// YYYY-MM-DD según el reloj de La Paz (la votación cierra a medianoche de allí).
export function laPazToday(now: Date = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' });
}
