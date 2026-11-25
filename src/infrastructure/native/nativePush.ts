import { PushNotifications } from '@capacitor/push-notifications';
import { pushSubscriptionsService } from '@lib/supabase/services/push/pushSubscriptions';
import { appPlatform } from './platform';

// Registra este teléfono para recibir push nativos (FCM en Android, APNs vía FCM en iOS), incluso con la app cerrada.
// Guarda el token del dispositivo y abre la pantalla correcta al tocar una notificación. Devuelve la función para limpiar.
export async function registerNativePush(userId: string, onOpenUrl: (url: string) => void): Promise<() => Promise<void>> {
  const handles = await Promise.all([
    PushNotifications.addListener('registration', token => {
      const platform = appPlatform() === 'ios' ? 'ios' : 'android';
      pushSubscriptionsService.saveNative(userId, token.value, platform)
        .catch(err => console.error('[nativePush:saveToken]', err));
    }),
    PushNotifications.addListener('registrationError', err => console.error('[nativePush:registration]', err)),
    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      const url = action.notification.data?.url;
      if (typeof url === 'string' && url.startsWith('/')) onOpenUrl(url);
    }),
  ]);

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive === 'granted') await PushNotifications.register();

  return async () => { await Promise.all(handles.map(h => h.remove())); };
}
