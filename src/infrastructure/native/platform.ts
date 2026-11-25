import { Capacitor } from '@capacitor/core';

export type AppPlatform = 'ios' | 'android' | 'web';

// ¿Corre dentro de la app instalada (Capacitor) o en el navegador? Todo lo nativo se activa solo en la app.
export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

export function appPlatform(): AppPlatform {
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android' ? platform : 'web';
}
