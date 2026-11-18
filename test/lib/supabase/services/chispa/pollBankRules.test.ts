import { describe, it, expect } from 'vitest';
import { validatePollInput, validateSchedule, laPazToday } from '@/lib/supabase/services/chispa/pollBankRules';

describe('validatePollInput', () => {
  it('exige pregunta y dos opciones distintas', () => {
    expect(validatePollInput({ question: '', optionA: 'a', optionB: 'b' })).not.toBeNull();
    expect(validatePollInput({ question: '¿A o B?', optionA: 'A', optionB: '' })).not.toBeNull();
    expect(validatePollInput({ question: '¿A o B?', optionA: 'Sí', optionB: ' sí ' })).not.toBeNull();
  });
  it('limita el largo para que entre en la tarjeta', () => {
    expect(validatePollInput({ question: 'x'.repeat(101), optionA: 'A', optionB: 'B' })).not.toBeNull();
    expect(validatePollInput({ question: '¿A?', optionA: 'x'.repeat(31), optionB: 'B' })).not.toBeNull();
  });
  it('acepta una pregunta válida', () => {
    expect(validatePollInput({ question: '¿Trufi o micro?', optionA: 'Trufi', optionB: 'Micro' })).toBeNull();
  });
});

describe('validateSchedule', () => {
  it('no permite hoy ni fechas pasadas (hoy ya la resolvió el sistema)', () => {
    expect(validateSchedule('2026-11-06', '2026-11-06', [])).not.toBeNull();
    expect(validateSchedule('2026-11-01', '2026-11-06', [])).not.toBeNull();
  });
  it('no permite una fecha ya ocupada', () => {
    expect(validateSchedule('2026-11-10', '2026-11-06', ['2026-11-10'])).not.toBeNull();
  });
  it('acepta una fecha futura libre', () => {
    expect(validateSchedule('2026-11-10', '2026-11-06', ['2026-11-11'])).toBeNull();
  });
});

describe('laPazToday', () => {
  it('usa la fecha de La Paz (UTC-4), no la de UTC', () => {
    expect(laPazToday(new Date('2026-11-07T02:00:00Z'))).toBe('2026-11-06');
    expect(laPazToday(new Date('2026-11-06T18:00:00Z'))).toBe('2026-11-06');
  });
});
