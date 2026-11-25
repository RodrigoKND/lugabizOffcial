const SKIP_UNDER_BYTES = 1_000_000;

// Tamaño final respetando la proporción: el lado largo no pasa de `maxSide` y nunca se agranda.
export function fitWithin(width: number, height: number, maxSide: number): { width: number; height: number } {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

// Las fotos de celular pesan varios MB: se reducen antes de subirlas (sube más rápido y el análisis de IA las acepta).
// Si el navegador no puede decodificar la imagen (p. ej. HEIC) o algo falla, se sube el archivo original sin tocarlo.
export async function resizeImageFile(file: File, maxSide = 1600, quality = 0.85): Promise<File> {
  try {
    if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return file;
    const bitmap = await createImageBitmap(file);
    const { width, height } = fitWithin(bitmap.width, bitmap.height, maxSide);
    const unchanged = width === bitmap.width && height === bitmap.height;
    if (unchanged && file.type === 'image/jpeg' && file.size <= SKIP_UNDER_BYTES) { bitmap.close?.(); return file; }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) { bitmap.close?.(); return file; }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || (unchanged && blob.size >= file.size)) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
