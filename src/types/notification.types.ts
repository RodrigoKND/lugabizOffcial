// Extensión de tipos para NotificationOptions con propiedades no estándar

export interface ExtendedNotificationOptions extends NotificationOptions {
  /**
   * Patrón de vibración para dispositivos móviles
   * Ejemplo: [200, 100, 200] = vibrar 200ms, pausa 100ms, vibrar 200ms
   */
  vibrate?: number[];
  
  /**
   * Badge/ícono pequeño mostrado en la barra de notificaciones (Android)
   */
  badge?: string;
  
  /**
   * Imagen grande que se muestra en la notificación expandida
   */
  image?: string;
}

/**
 * Helper para crear notificaciones con tipado completo
 */
export const createNotification = (
  title: string,
  options: ExtendedNotificationOptions
): Notification => {
  return new Notification(title, options as NotificationOptions);
};