import { describe, it, expect } from 'vitest';
import {
  canCreateGroupPick, MAX_INVITEES, MIN_OPTIONS, MAX_OPTIONS,
} from '@domain/rules/groupPickLimits';

const ok = { inviteeCount: 2, optionCount: 3, planDate: '2026-12-05', planTime: '20:00' };

describe('canCreateGroupPick', () => {
  it('límites del producto: hasta 5 amigos y entre 2 y 4 opciones', () => {
    expect([MAX_INVITEES, MIN_OPTIONS, MAX_OPTIONS]).toEqual([5, 2, 4]);
  });

  it('con todo en regla se puede crear', () => {
    expect(canCreateGroupPick(ok)).toBeNull();
  });

  it('pide al menos un amigo', () => {
    expect(canCreateGroupPick({ ...ok, inviteeCount: 0 })).toBe('Invita al menos a un amigo.');
  });

  it('no deja pasar de 5 amigos', () => {
    expect(canCreateGroupPick({ ...ok, inviteeCount: 6 })).toBe('Máximo 5 amigos.');
  });

  it('pide al menos 2 opciones y no más de 4', () => {
    expect(canCreateGroupPick({ ...ok, optionCount: 1 })).toBe('Agrega al menos 2 opciones.');
    expect(canCreateGroupPick({ ...ok, optionCount: 5 })).toBe('Máximo 4 opciones.');
  });

  it('pide fecha y hora', () => {
    expect(canCreateGroupPick({ ...ok, planDate: '' })).toBe('Elige la fecha y la hora.');
    expect(canCreateGroupPick({ ...ok, planTime: '' })).toBe('Elige la fecha y la hora.');
  });
});
