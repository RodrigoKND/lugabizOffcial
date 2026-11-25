import { describe, it, expect } from 'vitest';
import { journeyStages, currentStage } from '@/presentation/components/features/users/journey/journeyStages';

const status = (s: ReturnType<typeof journeyStages>) => s.map(x => x.status);

describe('journeyStages', () => {
  it('usuario nuevo: explorador listo y verificar identidad es la parada actual', () => {
    const stages = journeyStages({ identityVerified: false, placesCount: 0, docsApproved: false });
    expect(status(stages)).toEqual(['done', 'current', 'todo', 'todo']);
    expect(currentStage(stages)?.id).toBe('identity');
    expect(currentStage(stages)?.action).toBe('verify');
  });

  it('verificado sin lugares: toca publicar el negocio', () => {
    const stages = journeyStages({ identityVerified: true, placesCount: 0, docsApproved: false });
    expect(status(stages)).toEqual(['done', 'done', 'current', 'todo']);
    expect(currentStage(stages)?.action).toBe('add-place');
  });

  it('con lugar pero sin documentos aprobados: toca la insignia dorada', () => {
    const stages = journeyStages({ identityVerified: true, placesCount: 2, docsApproved: false });
    expect(status(stages)).toEqual(['done', 'done', 'done', 'current']);
    expect(currentStage(stages)?.id).toBe('docs');
    expect(currentStage(stages)?.action).toBe('verify');
  });

  it('todo completo: ninguna parada actual', () => {
    const stages = journeyStages({ identityVerified: true, placesCount: 1, docsApproved: true });
    expect(status(stages)).toEqual(['done', 'done', 'done', 'done']);
    expect(currentStage(stages)).toBeUndefined();
  });

  it('con datos incoherentes (docs aprobados sin identidad) la actual es la primera pendiente', () => {
    const stages = journeyStages({ identityVerified: false, placesCount: 0, docsApproved: true });
    expect(status(stages)).toEqual(['done', 'current', 'todo', 'done']);
  });

  it('siempre son 4 paradas con título y pista cortos', () => {
    const stages = journeyStages({ identityVerified: false, placesCount: 0, docsApproved: false });
    expect(stages).toHaveLength(4);
    stages.forEach(s => { expect(s.title.length).toBeGreaterThan(0); expect(s.hint.length).toBeGreaterThan(0); });
  });
});
