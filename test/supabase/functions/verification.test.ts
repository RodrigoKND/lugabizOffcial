import { describe, it, expect } from 'vitest';
import {
  stripReasoning, extractJson, buildVisionRequest, identityVerdict,
  VISION_MODEL, MAX_VISION_IMAGES,
} from '../../../supabase/functions/owner-verification/verification';

const img = (n: number) => ({ mime: 'image/jpeg', data: `AAA${n}` });

describe('stripReasoning', () => {
  it('quita el bloque de razonamiento <think>…</think>', () => {
    expect(stripReasoning('<think>pienso { "a": 1 }</think>{"ok":true}')).toBe('{"ok":true}');
  });

  it('quita un razonamiento que quedó sin cerrar', () => {
    expect(stripReasoning('{"ok":true}<think>me quedé sin tokens')).toBe('{"ok":true}');
  });

  it('deja intacto el texto normal', () => {
    expect(stripReasoning('  hola ')).toBe('hola');
  });
});

describe('extractJson', () => {
  it('lee un JSON limpio', () => {
    expect(extractJson('{"a":1,"b":{"c":2}}')).toEqual({ a: 1, b: { c: 2 } });
  });

  it('lo encuentra dentro de texto o de ```', () => {
    expect(extractJson('Claro:\n```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('ignora llaves del razonamiento y toma el JSON final', () => {
    expect(extractJson('<think>quizá {"x":0}</think>{"faceMatch":0.9}')).toEqual({ faceMatch: 0.9 });
  });

  it('devuelve null si no hay JSON válido', () => {
    expect(extractJson('')).toBeNull();
    expect(extractJson('sin json')).toBeNull();
    expect(extractJson('{"a":')).toBeNull();
  });
});

describe('buildVisionRequest', () => {
  it('usa el modelo de visión actual y el modo JSON', () => {
    const body = buildVisionRequest(VISION_MODEL, 'sys', 'prompt', [img(1)]);
    expect(body.model).toBe('qwen/qwen3.8-27b');
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.max_tokens).toBeGreaterThanOrEqual(600);
  });

  it('no manda más de 3 imágenes (límite del modelo)', () => {
    const body = buildVisionRequest(VISION_MODEL, 's', 'p', [img(1), img(2), img(3), img(4), img(5)]);
    const parts = body.messages[1].content;
    expect(parts.filter(p => p.type === 'image_url')).toHaveLength(MAX_VISION_IMAGES);
  });

  it('manda cada imagen como data URL', () => {
    const body = buildVisionRequest(VISION_MODEL, 's', 'p', [img(7)]);
    const part = body.messages[1].content.find(p => p.type === 'image_url');
    expect(part).toMatchObject({ image_url: { url: 'data:image/jpeg;base64,AAA7' } });
  });

  it('apaga el razonamiento para que no gaste los tokens de la respuesta', () => {
    expect(buildVisionRequest(VISION_MODEL, 's', 'p', [img(1)]).reasoning_effort).toBe('none');
  });

  it('puede reintentarse sin parámetros de razonamiento', () => {
    expect('reasoning_effort' in buildVisionRequest(VISION_MODEL, 's', 'p', [img(1)], false)).toBe(false);
  });
});

describe('identityVerdict', () => {
  const good = { readable: true, isRealId: true, nameMatches: true, faceMatch: 0.9, liveness: 0.8 };

  it('si el análisis no estuvo disponible NO culpa al usuario: pasa a revisión manual', () => {
    const v = identityVerdict(null, 'Ana Pérez');
    expect(v.verdict).toBe('warn');
    expect(v.message).toContain('una persona de nuestro equipo');
    expect(v.aiScore).toBeNull();
    expect(v.extracted).toMatchObject({ claimedName: 'Ana Pérez', manualReview: true });
  });

  it('todo en regla: ok y puntaje 60% rostro + 40% vida', () => {
    const v = identityVerdict(good, 'Ana');
    expect(v.verdict).toBe('ok');
    expect(v.aiScore).toBe(0.86);
  });

  it('el nombre no coincide: falla y lo dice', () => {
    const v = identityVerdict({ ...good, nameMatches: false }, 'Ana');
    expect(v.verdict).toBe('fail');
    expect(v.message).toContain('el nombre que ingresaste no coincide');
  });

  it('carnet ilegible: pide una foto nítida y no suma el reclamo del nombre', () => {
    const v = identityVerdict({ ...good, readable: false, nameMatches: false }, 'Ana');
    expect(v.verdict).toBe('fail');
    expect(v.message).toContain('foto nítida');
    expect(v.message).not.toContain('no coincide con el de tu carnet');
  });

  it('rostro distinto o selfie de pantalla: falla', () => {
    expect(identityVerdict({ ...good, faceMatch: 0.2 }, 'Ana').verdict).toBe('fail');
    expect(identityVerdict({ ...good, liveness: 0.1 }, 'Ana').message).toContain('en vivo');
  });

  it('valores raros del modelo no rompen (sin NaN)', () => {
    const v = identityVerdict({ readable: true, isRealId: true, nameMatches: true, faceMatch: 'x', liveness: null }, 'Ana');
    expect(v.verdict).toBe('fail');
    expect(Number.isFinite(v.aiScore as number)).toBe(true);
  });
});
