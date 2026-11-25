import { supabase } from '@lib/supabase/client';
import { resizeImageFile } from '@infrastructure/utils/imageResize';
import { userFacingMessage } from '@infrastructure/utils/userFacingError';

const BUCKET = 'verification-docs';
const FUNCTION_NAME = 'owner-verification';

export type VerificationKind = 'identity' | 'business_docs';
export type VerificationStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface OwnerVerification {
  id: string;
  userId: string;
  kind: VerificationKind;
  status: VerificationStatus;
  businessId?: string | null;
  businessName?: string | null;
  extracted?: Record<string, unknown>;
  docUrls?: string[];
  aiScore?: number | null;
  aiNotes?: string | null;
  reviewerNotes?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface PendingVerification extends OwnerVerification {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  docUrls: string[]; // URLs firmadas de corta duración (solo admin)
}

function mapRow(r: Record<string, unknown>): OwnerVerification {
  return {
    id: r.id,
    userId: r.user_id,
    kind: r.kind,
    status: r.status,
    businessId: r.business_id ?? null,
    businessName: r.business_name,
    extracted: r.extracted ?? {},
    docUrls: r.doc_urls ?? [],
    aiScore: r.ai_score,
    aiNotes: r.ai_notes,
    reviewerNotes: r.reviewer_notes,
    createdAt: r.created_at,
    reviewedAt: r.reviewed_at,
  };
}

// Cuando la función responde 4xx/5xx, supabase-js solo dice "Edge Function returned a non-2xx status code";
// el mensaje real (en español, pensado para la persona) viene en el cuerpo de la respuesta.
async function serverMessage(error: unknown): Promise<string> {
  const context = (error as { context?: unknown } | null)?.context;
  if (context instanceof Response) {
    try {
      const body = await context.clone().json();
      if (typeof body?.error === 'string') return body.error;
    } catch { /* el cuerpo no era JSON */ }
  }
  return error instanceof Error ? error.message : '';
}

// Llama a la edge function y devuelve su respuesta. Cualquier fallo sale como Error con un mensaje apto para mostrar:
// el detalle técnico (red, 5xx, permisos) queda solo en la consola.
async function invoke<T>(body: Record<string, unknown>, fallback: string): Promise<T> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, { body });
  if (error) {
    console.error('[ownerVerification:invoke]', body.action, error);
    throw new Error(userFacingMessage(await serverMessage(error), fallback));
  }
  const payload = data as Record<string, unknown> | null;
  if (payload?.error) {
    console.error('[ownerVerification:invoke]', body.action, payload.error);
    throw new Error(userFacingMessage(String(payload.error), fallback));
  }
  return payload as T;
}

async function uploadDoc(userId: string, kind: VerificationKind, slot: string, file: File): Promise<string> {
  // Las fotos de celular pesan varios MB: se reducen antes de subir (más rápido y el análisis de IA las acepta).
  const prepared = await resizeImageFile(file);
  const ext = prepared.name.split('.').pop() || 'jpg';
  // El primer segmento DEBE ser el userId (lo exige la RLS del bucket privado).
  const path = `${userId}/${kind}/${slot}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, prepared, {
    cacheControl: '3600',
    upsert: true,
    contentType: prepared.type,
  });
  if (error) {
    console.error('[ownerVerification:uploadDoc]', error);
    throw new Error('No pudimos subir tus fotos. Revisa tu conexión e intenta de nuevo.');
  }
  return path;
}

export interface IdentityPrecheck {
  verdict: 'ok' | 'warn' | 'fail';
  message: string;
  extracted: Record<string, unknown>;
  aiScore: number | null;
  docPaths: string[];
}

export const ownerVerificationService = {
  /**
   * Pre-chequeo con IA ANTES de enviar: sube las fotos y la IA las analiza,
   * devolviendo un veredicto + sugerencias. NO crea la solicitud. El wizard solo
   * deja enviar si verdict !== 'fail'.
   */
  async precheckIdentity(
    userId: string,
    params: { businessName: string; fullName: string; selfieFile: File; ciFrontFile: File; ciBackFile?: File },
  ): Promise<IdentityPrecheck> {
    const docPaths: string[] = [];
    docPaths.push(await uploadDoc(userId, 'identity', 'selfie', params.selfieFile));
    docPaths.push(await uploadDoc(userId, 'identity', 'ci-front', params.ciFrontFile));
    if (params.ciBackFile) docPaths.push(await uploadDoc(userId, 'identity', 'ci-back', params.ciBackFile));

    const data = await invoke<Record<string, unknown>>({
      action: 'precheck-identity',
      businessName: params.businessName,
      fullName: params.fullName,
      docPaths,
      selfiePath: docPaths[0],
      ciPath: docPaths[1],
    }, 'No pudimos revisar tus fotos. Intenta de nuevo en un momento.');
    return {
      verdict: data.verdict as IdentityPrecheck['verdict'],
      message: data.message as string,
      extracted: (data.extracted ?? {}) as Record<string, unknown>,
      aiScore: data.aiScore as number | null,
      docPaths,
    };
  },

  /**
   * Envía la verificación de IDENTIDAD a revisión. Reutiliza las rutas y el
   * veredicto del pre-chequeo (no vuelve a subir ni gasta otra llamada de IA).
   */
  async submitIdentity(
    userId: string,
    params: { businessName: string; precheck: IdentityPrecheck },
  ): Promise<OwnerVerification> {
    const { docPaths, verdict, extracted, aiScore, message } = params.precheck;
    const data = await invoke<Record<string, unknown>>({
      action: 'submit-identity',
      businessName: params.businessName,
      docPaths,
      selfiePath: docPaths[0],
      ciPath: docPaths[1],
      verdict, extracted, aiScore, message,
    }, 'No pudimos enviar tu verificación. Intenta de nuevo en un momento.');
    return mapRow(data.verification as Record<string, unknown>);
  },

  /** Envía documentos de negocio (NIT/SEPREC/licencia) de UN negocio concreto para su insignia dorada. */
  async submitBusinessDocs(
    userId: string,
    params: { businessId: string; businessName: string; docFiles: File[] },
  ): Promise<OwnerVerification> {
    const docPaths: string[] = [];
    for (let i = 0; i < params.docFiles.length; i++) {
      docPaths.push(await uploadDoc(userId, 'business_docs', `${params.businessId}-doc${i}`, params.docFiles[i]));
    }
    const data = await invoke<Record<string, unknown>>(
      { action: 'submit-business-docs', businessId: params.businessId, businessName: params.businessName, docPaths },
      'No pudimos enviar tus documentos. Intenta de nuevo en un momento.',
    );
    return mapRow(data.verification as Record<string, unknown>);
  },

  /** Descarta el borrador de identidad en el servidor (al reintentar fotos). */
  async discardIdentityDraft(): Promise<void> {
    await supabase.functions.invoke(FUNCTION_NAME, { body: { action: 'discard-identity-draft' } });
  },

  /** Solicitudes del usuario actual (para mostrar "en revisión" / resultado). */
  async getMyVerifications(userId: string): Promise<OwnerVerification[]> {
    const { data, error } = await supabase
      .from('owner_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  // --- Solo admin (vía edge function con service role) ----------------------

  /** Lista las solicitudes pendientes con URLs firmadas de los documentos. */
  async listPending(): Promise<PendingVerification[]> {
    const data = await invoke<Record<string, unknown>>({ action: 'admin-list' }, 'No se pudo cargar la cola.');
    return ((data.pending as Record<string, unknown>[]) || []).map((r: Record<string, unknown>) => ({
      ...mapRow(r),
      userName: r.user_name,
      userEmail: r.user_email,
      userAvatar: r.user_avatar,
      docUrls: r.doc_urls_signed || [],
    }));
  },

  /** Aprueba o rechaza una solicitud (admin). */
  async review(verificationId: string, decision: 'approve' | 'reject', notes?: string): Promise<void> {
    await invoke({ action: decision === 'approve' ? 'admin-approve' : 'admin-reject', verificationId, notes }, 'No se pudo procesar la decisión.');
  },

  /**
   * Retira/baja una insignia (admin). 'business_docs' => la dorada de un negocio
   * vuelve a gris; 'identity' => retira toda la verificación de la cuenta. En ambos
   * casos el dueño recibe aviso in-app y por email (si el correo está configurado).
   */
  async revokeBadge(params: { target: 'business_docs' | 'identity'; businessId?: string; ownerId?: string; notes?: string }): Promise<void> {
    await invoke({ action: 'admin-revoke', ...params }, 'No se pudo retirar la insignia.');
  },
};
