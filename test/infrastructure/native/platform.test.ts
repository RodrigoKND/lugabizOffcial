import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isNativeApp, appPlatform } from '@/infrastructure/native/platform';

const cap = vi.hoisted(() => ({ isNativePlatform: vi.fn(), getPlatform: vi.fn() }));
vi.mock('@capacitor/core', () => ({ Capacitor: cap }));

describe('platform', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('en el navegador no es app nativa y la plataforma es web', () => {
    cap.isNativePlatform.mockReturnValue(false);
    cap.getPlatform.mockReturnValue('web');
    expect(isNativeApp()).toBe(false);
    expect(appPlatform()).toBe('web');
  });

  it('reconoce Android e iOS', () => {
    cap.isNativePlatform.mockReturnValue(true);
    cap.getPlatform.mockReturnValue('android');
    expect(appPlatform()).toBe('android');
    cap.getPlatform.mockReturnValue('ios');
    expect(appPlatform()).toBe('ios');
    expect(isNativeApp()).toBe(true);
  });

  it('una plataforma desconocida se trata como web', () => {
    cap.getPlatform.mockReturnValue('electron');
    expect(appPlatform()).toBe('web');
  });
});
