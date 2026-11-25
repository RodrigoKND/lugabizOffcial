import { Flame, ThumbsUp, Meh, type LucideIcon } from 'lucide-react';
import type { VerdictKey } from '@domain/entities';

export interface VerdictOption {
  key: VerdictKey;
  Icon: LucideIcon;
  label: string;
}

// Tres niveles de "juicio" en jerga boliviana. OJO: la clave 'jallalla' es interna (restricción de la tabla `verdicts`);
// lo que ve la gente es solo `label`, que se puede cambiar sin migrar.
export const VERDICT_OPTIONS: VerdictOption[] = [
  { key: 'jallalla', Icon: Flame, label: 'Al palo' },
  { key: 'bien', Icon: ThumbsUp, label: 'Bien nomás' },
  { key: 'ahi', Icon: Meh, label: 'Ahí nomás' },
];

// El voto que se da con doble toque en el celular.
export const DOUBLE_TAP_VERDICT: VerdictKey = 'jallalla';
