import { describe, it, expect } from 'vitest';
import {
  tallyOptions, pickWinner, isVotingComplete, setVote, VERDICT_POINTS,
  type PickOption, type PickVote,
} from '@domain/rules/groupPickScoring';

const opts: PickOption[] = [{ id: 'a', position: 0 }, { id: 'b', position: 1 }, { id: 'c', position: 2 }];
const vote = (optionId: string, userId: string, verdict: PickVote['verdict']): PickVote => ({ optionId, userId, verdict });

describe('puntos por veredicto', () => {
  it('Al palo 2, Bien nomás 1, Ahí nomás 0', () => {
    expect(VERDICT_POINTS).toEqual({ jallalla: 2, bien: 1, ahi: 0 });
  });
});

describe('tallyOptions', () => {
  it('suma puntos y cuenta votos por opción', () => {
    const t = tallyOptions(opts, [vote('a', 'u1', 'jallalla'), vote('a', 'u2', 'bien'), vote('b', 'u1', 'ahi')]);
    const a = t.find(x => x.optionId === 'a')!;
    expect(a.score).toBe(3);
    expect(a.votes).toBe(2);
    expect(a.counts).toEqual({ jallalla: 1, bien: 1, ahi: 0 });
  });

  it('ordena de mayor a menor puntaje', () => {
    const t = tallyOptions(opts, [vote('a', 'u1', 'bien'), vote('b', 'u1', 'jallalla'), vote('c', 'u1', 'ahi')]);
    expect(t.map(x => x.optionId)).toEqual(['b', 'a', 'c']);
  });

  it('empate de puntos: gana la que tiene más "Al palo"', () => {
    // a: 2 × Bien nomás = 2 pts, 0 al palo. b: 1 Al palo + 1 Ahí nomás = 2 pts, 1 al palo.
    const t = tallyOptions(opts, [vote('a', 'u1', 'bien'), vote('a', 'u2', 'bien'), vote('b', 'u1', 'jallalla'), vote('b', 'u2', 'ahi')]);
    expect(t[0].optionId).toBe('b');
  });

  it('empate total: gana la opción agregada primero', () => {
    const t = tallyOptions(opts, [vote('b', 'u1', 'bien'), vote('a', 'u1', 'bien')]);
    expect(t.map(x => x.optionId).slice(0, 2)).toEqual(['a', 'b']);
  });

  it('ignora votos de opciones que no existen', () => {
    const t = tallyOptions(opts, [vote('zzz', 'u1', 'jallalla')]);
    expect(t.every(x => x.score === 0 && x.votes === 0)).toBe(true);
  });

  it('si una persona vota dos veces la misma opción, cuenta la última', () => {
    const t = tallyOptions(opts, [vote('a', 'u1', 'ahi'), vote('a', 'u1', 'jallalla')]);
    const a = t.find(x => x.optionId === 'a')!;
    expect(a.score).toBe(2);
    expect(a.votes).toBe(1);
  });
});

describe('pickWinner', () => {
  it('devuelve la opción con más puntos', () => {
    expect(pickWinner(tallyOptions(opts, [vote('c', 'u1', 'jallalla'), vote('a', 'u1', 'bien')]))).toBe('c');
  });

  it('sin ningún voto no hay ganador', () => {
    expect(pickWinner(tallyOptions(opts, []))).toBeNull();
    expect(pickWinner([])).toBeNull();
  });

  it('si todos votaron "Ahí nomás" igual hay ganador (por orden)', () => {
    expect(pickWinner(tallyOptions(opts, [vote('b', 'u1', 'ahi'), vote('a', 'u1', 'ahi')]))).toBe('a');
  });
});

describe('isVotingComplete', () => {
  const members = ['u1', 'u2'];
  const twoOpts = opts.slice(0, 2);

  it('es true cuando todos votaron todas las opciones', () => {
    const votes = ['u1', 'u2'].flatMap(u => twoOpts.map(o => vote(o.id, u, 'bien')));
    expect(isVotingComplete(members, twoOpts, votes)).toBe(true);
  });

  it('es false si falta algún voto', () => {
    const votes = [vote('a', 'u1', 'bien'), vote('b', 'u1', 'bien'), vote('a', 'u2', 'bien')];
    expect(isVotingComplete(members, twoOpts, votes)).toBe(false);
  });

  it('los votos de quien no es miembro no cuentan', () => {
    const votes = [...twoOpts.map(o => vote(o.id, 'u1', 'bien')), ...twoOpts.map(o => vote(o.id, 'intruso', 'bien'))];
    expect(isVotingComplete(members, twoOpts, votes)).toBe(false);
  });

  it('sin opciones o sin miembros nunca está completa', () => {
    expect(isVotingComplete(members, [], [])).toBe(false);
    expect(isVotingComplete([], twoOpts, [])).toBe(false);
  });
});

describe('setVote', () => {
  const base: PickVote[] = [vote('a', 'u1', 'bien'), vote('b', 'u2', 'ahi')];

  it('agrega un voto nuevo sin tocar la lista original', () => {
    const next = setVote(base, 'a', 'u2', 'jallalla');
    expect(next).toHaveLength(3);
    expect(base).toHaveLength(2);
  });

  it('cambiar de voto reemplaza el anterior de esa persona en esa opción', () => {
    const next = setVote(base, 'a', 'u1', 'jallalla');
    expect(next.filter(v => v.optionId === 'a' && v.userId === 'u1')).toEqual([vote('a', 'u1', 'jallalla')]);
    expect(next).toHaveLength(2);
  });

  it('null quita el voto', () => {
    expect(setVote(base, 'a', 'u1', null)).toEqual([vote('b', 'u2', 'ahi')]);
  });
});
