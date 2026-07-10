import { supabase } from '@lib/supabase';
import { Report, CreateReportData, FlaggedContent } from '@domain/entities';

const REPORT_THRESHOLD = 3;
const CONTENT_AUTO_BAN_THRESHOLD = 5;
const USER_AUTO_BAN_THRESHOLD = 3;

async function autoBanIfNeeded(userId: string, reporterId: string, threshold: number, label: string) {
  if (!userId || userId === reporterId) return;

  const { data: profile } = await supabase
    .from('users').select('banned').eq('id', userId).maybeSingle();
  if (!profile || profile.banned) return;

  const banReason = label;
  const bannedAt = new Date().toISOString();

  await supabase.from('users')
    .update({ banned: true, ban_reason: banReason })
    .eq('id', userId);

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'system',
    title: 'Cuenta suspendida',
    body: `Tu cuenta fue suspendida automáticamente por ${threshold} reportes de la comunidad.`,
    data: { ban_reason: banReason, banned_at: bannedAt, source: 'auto_community_reports' },
  });

  // Audit log permanente del auto-baneo
  await supabase.from('user_activity').insert({
    user_id: userId,
    action: 'auto_banned',
    data: { reason: banReason, report_threshold: threshold, banned_at: bannedAt, source: 'community_reports' },
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'system',
    session_id: crypto.randomUUID(),
  });
}

export async function createReport(data: CreateReportData): Promise<void> {
  const { error } = await supabase.from('reports').insert({
    target_type: data.targetType,
    target_id: data.targetId,
    reporter_id: data.reporterId,
    reason: data.reason,
  });
  if (error) throw error;

  const { count } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('target_type', data.targetType)
    .eq('target_id', data.targetId);

  const reportCount = count ?? 0;

  if (data.targetType === 'user') {
    // Reporte directo a usuario — umbral más bajo
    if (reportCount >= USER_AUTO_BAN_THRESHOLD) {
      await autoBanIfNeeded(
        data.targetId,
        data.reporterId,
        USER_AUTO_BAN_THRESHOLD,
        'Múltiples reportes directos de usuarios de la comunidad',
      );
    }
    return;
  }

  // Reportes de contenido (review / event_comment)
  if (reportCount >= CONTENT_AUTO_BAN_THRESHOLD) {
    let authorId: string | null = null;

    if (data.targetType === 'review') {
      const { data: row } = await supabase
        .from('reviews').select('user_id').eq('id', data.targetId).maybeSingle();
      authorId = row?.user_id ?? null;
    } else if (data.targetType === 'event_comment') {
      const { data: row } = await supabase
        .from('event_comments').select('user_id').eq('id', data.targetId).maybeSingle();
      authorId = row?.user_id ?? null;
    }

    if (authorId) {
      await autoBanIfNeeded(
        authorId,
        data.reporterId,
        CONTENT_AUTO_BAN_THRESHOLD,
        'Múltiples reportes de contenido inapropiado',
      );
    }
  }
}

export async function getReportsForTarget(targetType: string, targetId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*, reporter:users(name)')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id,
    targetType: r.target_type,
    targetId: r.target_id,
    reporterId: r.reporter_id,
    reporterName: r.reporter?.name,
    reason: r.reason,
    createdAt: new Date(r.created_at),
  }));
}

export async function getReportCount(targetType: string, targetId: string): Promise<number> {
  const { count, error } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('target_type', targetType)
    .eq('target_id', targetId);

  if (error) throw error;
  return count || 0;
}

export async function hasUserReported(targetType: string, targetId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('reports')
    .select('id')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('reporter_id', userId)
    .maybeSingle();

  return !!data;
}

async function fetchReportsByType(targetType: string): Promise<Array<{ target_id: string; target_type: string; reason: string }>> {
  const { data, error } = await supabase
    .from('reports')
    .select('target_id, target_type, reason')
    .eq('target_type', targetType);
  if (error) throw error;
  return data || [];
}

function groupReports(
  reports: Array<{ target_id: string; target_type: string; reason: string }>,
): Map<string, { targetId: string; targetType: string; count: number; reasons: string[] }> {
  const grouped = new Map<string, { targetId: string; targetType: string; count: number; reasons: string[] }>();
  for (const r of reports) {
    const key = `${r.target_type}:${r.target_id}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
      existing.reasons.push(r.reason);
    } else {
      grouped.set(key, {
        targetId: r.target_id,
        targetType: r.target_type,
        count: 1,
        reasons: [r.reason],
      });
    }
  }
  return grouped;
}

function filterFlagged(
  grouped: Map<string, { targetId: string; targetType: string; count: number; reasons: string[] }>,
  minReports: number,
): Array<{ targetId: string; targetType: string; count: number; reasons: string[] }> {
  return [...grouped.values()].filter(g => g.count >= minReports);
}

async function fetchReviewDetails(
  flagged: Array<{ targetId: string; targetType: string; count: number; reasons: string[] }>,
): Promise<FlaggedContent[]> {
  const targetIds = flagged.filter(r => r.targetType === 'review').map(r => r.targetId);
  if (targetIds.length === 0) return [];

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, comment, user_id, user:users(name)')
    .in('id', targetIds);

  if (error) throw error;
  if (!reviews) return [];

  const reviewMap = new Map(reviews.map(r => [r.id, r]));

  return flagged
    .filter(r => r.targetType === 'review')
    .map(r => {
      const review = reviewMap.get(r.targetId);
      if (!review) return null;
      return {
        targetId: r.targetId,
        targetType: 'review' as const,
        reportCount: r.count,
        content: review.comment,
        authorId: review.user_id,
        authorName: review.user?.name || 'Usuario',
        latestReason: r.reasons[r.reasons.length - 1],
      };
    })
    .filter((v): v is FlaggedContent => v !== null);
}

async function fetchEventCommentDetails(
  flagged: Array<{ targetId: string; targetType: string; count: number; reasons: string[] }>,
): Promise<FlaggedContent[]> {
  const targetIds = flagged.filter(r => r.targetType === 'event_comment').map(r => r.targetId);
  if (targetIds.length === 0) return [];

  const { data: comments, error } = await supabase
    .from('event_comments')
    .select('id, text, user_id, user:users(name)')
    .in('id', targetIds);

  if (error) throw error;
  if (!comments) return [];

  const commentMap = new Map(comments.map(c => [c.id, c]));

  return flagged
    .filter(r => r.targetType === 'event_comment')
    .map(r => {
      const comment = commentMap.get(r.targetId);
      if (!comment) return null;
      return {
        targetId: r.targetId,
        targetType: 'event_comment' as const,
        reportCount: r.count,
        content: comment.text,
        authorId: comment.user_id,
        authorName: comment.user?.name || 'Usuario',
        latestReason: r.reasons[r.reasons.length - 1],
      };
    })
    .filter((v): v is FlaggedContent => v !== null);
}

export async function getFlaggedContent(minReports: number = REPORT_THRESHOLD): Promise<FlaggedContent[]> {
  const [reviewReports, commentReports] = await Promise.all([
    fetchReportsByType('review'),
    fetchReportsByType('event_comment'),
  ]);

  const allReports = [...reviewReports, ...commentReports];
  const grouped = groupReports(allReports);
  const flagged = filterFlagged(grouped, minReports);

  const [reviews, comments] = await Promise.all([
    fetchReviewDetails(flagged),
    fetchEventCommentDetails(flagged),
  ]);

  return [...reviews, ...comments].sort((a, b) => b.reportCount - a.reportCount);
}

export { REPORT_THRESHOLD };
