import { describe, it, expect } from 'vitest';
import { groupPickPrimaryAction, planInviteeIds } from '@domain/rules/groupPickState';

const base = { status: 'open' as const, isOpen: true, isCreator: false, myVotedAll: false, hasWinner: true };

describe('groupPickPrimaryAction', () => {
  it('si me falta votar, lo primero es votar', () => {
    expect(groupPickPrimaryAction(base)).toBe('vote');
    expect(groupPickPrimaryAction({ ...base, isCreator: true })).toBe('vote');
  });

  it('el creador que ya votó puede cerrar y elegir', () => {
    expect(groupPickPrimaryAction({ ...base, isCreator: true, myVotedAll: true })).toBe('close');
  });

  it('sin ganador todavía, el creador espera', () => {
    expect(groupPickPrimaryAction({ ...base, isCreator: true, myVotedAll: true, hasWinner: false })).toBe('wait');
  });

  it('un invitado que ya votó solo espera', () => {
    expect(groupPickPrimaryAction({ ...base, myVotedAll: true })).toBe('wait');
  });

  it('vencida por tiempo: el creador puede cerrar aunque falte votar', () => {
    expect(groupPickPrimaryAction({ ...base, isOpen: false, isCreator: true })).toBe('close');
    expect(groupPickPrimaryAction({ ...base, isOpen: false })).toBe('wait');
  });

  it('decidida: el creador va al plan, los demás esperan', () => {
    expect(groupPickPrimaryAction({ ...base, status: 'decided', isOpen: false, isCreator: true })).toBe('go');
    expect(groupPickPrimaryAction({ ...base, status: 'decided', isOpen: false })).toBe('wait');
  });

  it('cancelada: no hay acción', () => {
    expect(groupPickPrimaryAction({ ...base, status: 'cancelled', isOpen: false, isCreator: true })).toBe('none');
  });
});

describe('planInviteeIds', () => {
  const members = [{ userId: 'me' }, { userId: 'a' }, { userId: 'b' }, { userId: 'c' }];

  it('invita a quienes votaron, sin incluirme', () => {
    const votes = [{ userId: 'a' }, { userId: 'a' }, { userId: 'me' }, { userId: 'c' }];
    expect(planInviteeIds(members, votes, 'me')).toEqual(['a', 'c']);
  });

  it('si nadie más votó, invita a todos los miembros menos a mí', () => {
    expect(planInviteeIds(members, [{ userId: 'me' }], 'me')).toEqual(['a', 'b', 'c']);
  });
});
