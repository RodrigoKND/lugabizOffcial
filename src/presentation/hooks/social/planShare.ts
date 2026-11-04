export interface PlanSummary {
  planDate: string;
  planTime: string;
  note?: string;
}

const W = 1080;
const H = 1350;

// "2026-11-08" + "19:30" → "sáb 8 nov · 19:30". Se arma con partes locales para no correr el día por zona horaria.
export function formatPlanWhen(planDate: string, planTime: string): string {
  const [y, m, d] = planDate.split('-').map(Number);
  const day = new Date(y, m - 1, d).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
  return `${day} · ${planTime}`;
}

export function planShareUrl(origin: string, target: { eventId?: string; placeId?: string }): string {
  if (target.eventId) return `${origin}/event/${target.eventId}`;
  if (target.placeId) return `${origin}/place/${target.placeId}`;
  return origin;
}

export function planShareText(name: string, when: string): string {
  return `Plan: ${name}, ${when}. ¿Vamos pues, panas?`;
}

// Parte un texto en líneas que caben en `maxWidth` según la función `measure`.
export function wrapLines(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = current ? `${current} ${word}` : word;
    if (current && measure(next) > maxWidth) { lines.push(current); current = word; }
    else current = next;
  }
  if (current) lines.push(current);
  return lines;
}

// Dibuja la tarjeta del plan (1080x1350, formato historia/feed) y la devuelve como PNG.
export async function renderPlanImage(name: string, when: string, note?: string): Promise<Blob> {
  await document.fonts?.load('900 100px Archivo').catch(() => {});
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas no disponible');

  ctx.fillStyle = '#1f1033'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#2d1949'; ctx.fillRect(60, 60, W - 120, H - 120);
  ctx.textBaseline = 'top';

  ctx.fillStyle = '#b794ff'; ctx.font = '900 54px Archivo, sans-serif';
  ctx.fillText('VAMOS PUES, PANAS', 120, 130);

  ctx.fillStyle = '#f4eeff'; ctx.font = '900 130px Archivo, sans-serif';
  const titleLines = wrapLines(name, W - 240, s => ctx.measureText(s).width).slice(0, 4);
  titleLines.forEach((l, i) => ctx.fillText(l, 120, 290 + i * 140));

  const y = 290 + titleLines.length * 140 + 40;
  ctx.fillStyle = '#b794ff'; ctx.font = '800 64px Archivo, sans-serif';
  ctx.fillText(when, 120, y);

  if (note) {
    ctx.fillStyle = '#b8a6d6'; ctx.font = '600 44px Figtree, sans-serif';
    wrapLines(note, W - 240, s => ctx.measureText(s).width).slice(0, 3).forEach((l, i) => ctx.fillText(l, 120, y + 120 + i * 60));
  }

  ctx.fillStyle = '#b794ff'; ctx.fillRect(120, H - 220, 260, 90);
  ctx.fillStyle = '#1b0b2e'; ctx.font = '900 48px Archivo, sans-serif';
  ctx.fillText('lugabiz', 150, H - 197);

  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('sin imagen'))), 'image/png'));
}
