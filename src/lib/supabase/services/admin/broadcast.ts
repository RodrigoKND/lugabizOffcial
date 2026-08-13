import { pushServerFetch } from '@lib/pushServer';

/** Audiencia de una campaña de marketing. */
export type BroadcastAudience =
  | 'all'                 // todos los usuarios
  | 'owners'              // dueños de negocio (is_owner)
  | 'non_owners'          // usuarios que no son dueños
  | 'identity_verified'   // identidad verificada
  | 'business_verified'   // con insignia dorada (docs verificados)
  | 'specific';           // lista específica de usuarios

export interface BroadcastCampaign {
  audience: BroadcastAudience;
  userIds?: string[];   // requerido si audience === 'specific'
  heading: string;      // título (campana + push)
  message: string;      // cuerpo
  ctaUrl?: string;      // enlace al que lleva la notificación / el push
}

export interface BroadcastPush {
  sent: number;          // pushes entregados
  failed: number;        // intentos fallidos
  subscriptions: number; // suscripciones encontradas para la audiencia
  errors: string[];      // motivos reales de web-push (ej. 403 = claves VAPID no coinciden)
}

export interface BroadcastFcm {
  sent: number;    // pushes entregados a la app móvil (FCM)
  failed: number;  // intentos fallidos
  tokens: number;  // tokens FCM hallados para la audiencia
  errors: string[];
}

export interface BroadcastResult {
  recipients: number;
  inApp: number;     // notificaciones de campana insertadas
  pushSent: number;  // pushes del navegador entregados
  push?: BroadcastPush;
  fcmSent: number;   // pushes entregados a la app móvil (FCM)
  fcm?: BroadcastFcm;
}

export const broadcastService = {
  /** Cuántos destinatarios alcanzaría la audiencia. */
  async previewAudience(audience: BroadcastAudience, userIds?: string[]): Promise<{ total: number }> {
    const data = await pushServerFetch<{ total: number }>('/api/v1/notify/admin-broadcast/preview', { audience, userIds });
    return { total: data.total ?? 0 };
  },

  /** Envía la campaña por campana + push (navegador vía VAPID + móvil vía FCM). */
  async send(campaign: BroadcastCampaign): Promise<BroadcastResult> {
    const data = await pushServerFetch<{
      recipients: number; inApp: number; pushSent: number; push?: BroadcastPush;
      fcmSent: number; fcm?: BroadcastFcm;
    }>('/api/v1/notify/admin-broadcast/send', campaign);
    return {
      recipients: data.recipients ?? 0,
      inApp: data.inApp ?? 0,
      pushSent: data.pushSent ?? 0,
      push: data.push,
      fcmSent: data.fcmSent ?? 0,
      fcm: data.fcm,
    };
  },
};
