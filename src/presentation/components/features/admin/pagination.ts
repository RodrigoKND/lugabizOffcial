export const totalPagesFor = (total: number, pageSize: number): number => Math.max(1, Math.ceil(total / pageSize));

// Páginas a mostrar: primera, última y la actual con sus vecinas; los huecos grandes se resumen con "…".
export function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 1) return [];
  const keep = [...new Set([1, total, current - 1, current, current + 1].filter(n => n >= 1 && n <= total))].sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  keep.forEach((n, i) => {
    const prev = keep[i - 1];
    if (prev !== undefined) {
      if (n - prev === 2) out.push(prev + 1);
      else if (n - prev > 2) out.push('…');
    }
    out.push(n);
  });
  return out;
}
