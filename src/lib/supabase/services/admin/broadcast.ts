import { supabase } from '@lib/supabase/client';

const FUNCTION_NAME = 'admin-broadcast';

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
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { action: 'preview', audience, userIds },
    });
    if (error) throw new Error(error.message ?? 'No se pudo calcular la audiencia.');
    if ((data as Record<string, unknown>)?.error) throw new Error((data as Record<string, unknown>).error as string);
    return { total: ((data as Record<string, unknown>).total as number) ?? 0 };
  },

  /** Envía la campaña por campana + push del navegador. Devuelve el resumen. */
  async send(campaign: BroadcastCampaign): Promise<BroadcastResult> {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { action: 'send', ...campaign },
    });
    if (error) throw new Error(error.message ?? 'No se pudo enviar la campaña.');
    if ((data as Record<string, unknown>)?.error) throw new Error((data as Record<string, unknown>).error as string);
    return {
      recipients: ((data as Record<string, unknown>).recipients as number) ?? 0,
      inApp: ((data as Record<string, unknown>).inApp as number) ?? 0,
      pushSent: ((data as Record<string, unknown>).pushSent as number) ?? 0,
      push: (data as Record<string, unknown>).push as BroadcastPush | undefined,
      fcmSent: ((data as Record<string, unknown>).fcmSent as number) ?? 0,
      fcm: (data as Record<string, unknown>).fcm as BroadcastFcm | undefined,
    };
  },
};
