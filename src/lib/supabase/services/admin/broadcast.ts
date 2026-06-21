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

export interface BroadcastResult {
  recipients: number;
  inApp: number;     // notificaciones de campana insertadas
  pushSent: number;  // pushes del navegador entregados
  push?: BroadcastPush;
}

export const broadcastService = {
  /** Cuántos destinatarios alcanzaría la audiencia. */
  async previewAudience(audience: BroadcastAudience, userIds?: string[]): Promise<{ total: number }> {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { action: 'preview', audience, userIds },
    });
    if (error) throw new Error(error.message ?? 'No se pudo calcular la audiencia.');
    if ((data as any)?.error) throw new Error((data as any).error);
    return { total: (data as any).total ?? 0 };
  },

  /** Envía la campaña por campana + push del navegador. Devuelve el resumen. */
  async send(campaign: BroadcastCampaign): Promise<BroadcastResult> {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { action: 'send', ...campaign },
    });
    if (error) throw new Error(error.message ?? 'No se pudo enviar la campaña.');
    if ((data as any)?.error) throw new Error((data as any).error);
    return {
      recipients: (data as any).recipients ?? 0,
      inApp: (data as any).inApp ?? 0,
      pushSent: (data as any).pushSent ?? 0,
      push: (data as any).push,
    };
  },
};
