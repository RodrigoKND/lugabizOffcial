import { supabase } from '@lib/supabase/client';

export type ContentType = 'place' | 'event' | 'post' | 'survey' | 'announcement';

export interface ModerationResult {
  approved: boolean;
  reason?: string;
}

export interface ModerationLog {
  id: string;
  userId: string | null;
  userName: string;
  contentType: ContentType;
  contentText: string;
  reason: string;
  reviewed: boolean;
  createdAt: Date;
}

export async function moderateContent(
  text: string,
  contentType: ContentType,
  userId?: string,
  userName?: string,
  imageUrls?: string[],
): Promise<ModerationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('content-moderation', {
      body: { text, contentType, userId, userName, imageUrls },
    });
    if (error) {
      console.error('[moderation] invoke error:', error)
      return { approved: true }
    }
    return data as ModerationResult;
  } catch (e) {
    console.error('[moderation] exception:', e)
    return { approved: true };
  }
}

export async function getModerationLogs(): Promise<ModerationLog[]> {
  const { data, error } = await supabase
    .from('moderation_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    contentType: row.content_type as ContentType,
    contentText: row.content_text,
    reason: row.reason,
    reviewed: row.reviewed,
    createdAt: new Date(row.created_at),
  }));
}

export async function markModerationLogReviewed(id: string): Promise<void> {
  await supabase.from('moderation_logs').update({ reviewed: true }).eq('id', id);
}
