import { supabase } from '@lib/supabase/client';

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

function mapRow(r: any): OwnerVerification {
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

async function uploadDoc(userId: string, kind: VerificationKind, slot: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  // El primer segmento DEBE ser el userId (lo exige la RLS del bucket privado).
  const path = `${userId}/${kind}/${slot}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
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

    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: {
        action: 'precheck-identity',
        businessName: params.businessName,
        fullName: params.fullName,
        docPaths,
        selfiePath: docPaths[0],
        ciPath: docPaths[1],
      },
    });
    if (error) throw new Error(error.message ?? 'No se pudo analizar la verificación.');
    if ((data as any)?.error) throw new Error((data as any).error);
    return {
      verdict: (data as any).verdict,
      message: (data as any).message,
      extracted: (data as any).extracted ?? {},
      aiScore: (data as any).aiScore ?? null,
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
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: {
        action: 'submit-identity',
        businessName: params.businessName,
        docPaths,
        selfiePath: docPaths[0],
        ciPath: docPaths[1],
        verdict, extracted, aiScore, message,
      },
    });
    if (error) throw new Error(error.message ?? 'No se pudo enviar la verificación.');
    if ((data as any)?.error) throw new Error((data as any).error);
    return mapRow((data as any).verification);
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
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { action: 'submit-business-docs', businessId: params.businessId, businessName: params.businessName, docPaths },
    });
    if (error) throw new Error(error.message ?? 'No se pudieron enviar los documentos.');
    if ((data as any)?.error) throw new Error((data as any).error);
    return mapRow((data as any).verification);
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
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { action: 'admin-list' },
    });
    if (error) throw new Error(error.message ?? 'No se pudo cargar la cola.');
    if ((data as any)?.error) throw new Error((data as any).error);
    return ((data as any).pending || []).map((r: any) => ({
      ...mapRow(r),
      userName: r.user_name,
      userEmail: r.user_email,
      userAvatar: r.user_avatar,
      docUrls: r.doc_urls_signed || [],
    }));
  },

  /** Aprueba o rechaza una solicitud (admin). */
  async review(verificationId: string, decision: 'approve' | 'reject', notes?: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { action: decision === 'approve' ? 'admin-approve' : 'admin-reject', verificationId, notes },
    });
    if (error) throw new Error(error.message ?? 'No se pudo procesar la decisión.');
    if ((data as any)?.error) throw new Error((data as any).error);
  },
};
