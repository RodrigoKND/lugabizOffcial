export type Slot = 'madrugada' | 'manana' | 'mediodia' | 'tarde' | 'noche';
export type Intent = 'desayuno' | 'almuerzo' | 'tarde' | 'noche' | 'calor' | 'frio';

export const HOT_C = 26;
export const COLD_C = 14;

// Palabras que, dentro del nombre de la categoría o del lugar, indican que encaja con cada momento.
export const INTENT_KEYWORDS: Record<Intent, string[]> = {
  desayuno: ['desayun', 'panader', 'cafe', 'salten', 'juguer'],
  almuerzo: ['restaur', 'comida', 'almuerzo', 'pique', 'silpancho', 'parrill', 'pizz'],
  tarde: ['cafe', 'postre', 'helad', 'pastel', 'reposter', 'parque'],
  noche: ['bar', 'noche', 'disco', 'club', 'trago', 'pena', 'karaoke', 'music', 'cena', 'pizz'],
  calor: ['helad', 'jugo', 'juguer', 'refresc', 'parque'],
  frio: ['cafe', 'sopa', 'chocolate', 'salten', 'panader'],
};

export const INTENT_HEADLINE: Record<Intent, (name: string) => string> = {
  desayuno: name => `¿Ya desayunaste? Prueba ${name}`,
  almuerzo: name => `¿Ganas de almorzar rico? Ve a ${name}`,
  tarde: name => `Hora de algo rico: ${name}`,
  noche: name => `¿Plan de noche? Prueba ${name}`,
  calor: name => `Con este calor, algo fresco en ${name}`,
  frio: name => `Con este frío, algo calientito en ${name}`,
};

export const SLOT_INTENT: Record<Slot, Intent | null> = {
  madrugada: null, manana: 'desayuno', mediodia: 'almuerzo', tarde: 'tarde', noche: 'noche',
};

export function slotForHour(hour: number): Slot {
  if (hour >= 6 && hour <= 10) return 'manana';
  if (hour >= 11 && hour <= 14) return 'mediodia';
  if (hour >= 15 && hour <= 18) return 'tarde';
  if (hour >= 19 && hour <= 23) return 'noche';
  return 'madrugada';
}

// Hora actual en Cochabamba (La Paz, UTC-4), sin depender de la zona horaria del navegador.
export function hourInLaPaz(now: Date): number {
  const h = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/La_Paz' }).format(now);
  return Number(h) % 24;
}
