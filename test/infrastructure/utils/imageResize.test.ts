import { describe, it, expect, vi, afterEach } from 'vitest';
import { fitWithin, resizeImageFile } from '@/infrastructure/utils/imageResize';

describe('fitWithin', () => {
  it('reduce el lado largo al máximo manteniendo la proporción', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it('no agranda una imagen que ya es chica', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it('nunca devuelve 0', () => {
    expect(fitWithin(10000, 1, 1600).height).toBe(1);
  });
});

describe('resizeImageFile', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('si el navegador no puede decodificar la imagen devuelve el archivo original', async () => {
    vi.stubGlobal('createImageBitmap', undefined);
    const file = new File(['x'], 'foto.heic', { type: 'image/heic' });
    expect(await resizeImageFile(file)).toBe(file);
  });

  it('si decodificar falla (p. ej. HEIC) también devuelve el original', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('no se puede decodificar')));
    const file = new File(['x'], 'foto.heic', { type: 'image/heic' });
    expect(await resizeImageFile(file)).toBe(file);
  });

  it('una foto chica y ya en JPEG no se vuelve a comprimir', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 800, height: 600, close: vi.fn() }));
    const file = new File(['x'], 'selfie.jpg', { type: 'image/jpeg' });
    expect(await resizeImageFile(file)).toBe(file);
  });
});
