export type JourneyAction = 'verify' | 'add-place';
export type JourneyStatus = 'done' | 'current' | 'todo';

export interface JourneyStage {
  id: 'explorer' | 'identity' | 'place' | 'docs';
  title: string;
  hint: string;
  status: JourneyStatus;
  action?: JourneyAction;
}

export interface JourneyInput {
  identityVerified: boolean;
  placesCount: number;
  docsApproved: boolean;
}

// Las 4 paradas del dueño. La actual es la primera sin completar; explorador siempre está listo.
export function journeyStages({ identityVerified, placesCount, docsApproved }: JourneyInput): JourneyStage[] {
  const base: Array<Omit<JourneyStage, 'status'> & { done: boolean }> = [
    { id: 'explorer', title: 'Explorador', hint: 'Ya estás dentro de Lugabiz.', done: true },
    { id: 'identity', title: 'Verifica quién eres', hint: 'Con tu CI y una selfie. Así la gente confía.', done: identityVerified, action: 'verify' },
    { id: 'place', title: 'Publica tu negocio', hint: 'Sube tu lugar y recibe tu cartel.', done: placesCount > 0, action: 'add-place' },
    { id: 'docs', title: 'Insignia dorada', hint: 'Presenta los documentos de tu negocio.', done: docsApproved, action: 'verify' },
  ];
  const firstPending = base.findIndex(s => !s.done);
  return base.map(({ done, ...stage }, i) => ({
    ...stage,
    status: done ? 'done' : i === firstPending ? 'current' : 'todo',
  }));
}

export const currentStage = (stages: JourneyStage[]) => stages.find(s => s.status === 'current');
