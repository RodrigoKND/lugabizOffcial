import { supabase } from '@lib/supabase';
import { edgeService } from '@lib/supabase/services/notifications/edgeFunctions';

async function getTargetUserIds(categoryIds: string[]): Promise<string[]> {
  try {
    const { data: users, error: userError } = await supabase
      .rpc('get_users_by_categories', { category_ids: categoryIds });
    if (!userError && users && (users as any[]).length > 0) {
      return (users as any[]).map(u => u.user_id);
    }
  } catch {}

  return [];
}

export async function notifyUsers(surveyId: string, categoryIds: string[], surveyTitle?: string): Promise<number> {
  const { data: survey } = await supabase
    .from('market_surveys')
    .select('title')
    .eq('id', surveyId)
    .single();

  const title = survey?.title || 'Nueva encuesta de mercado';

  const userIds = await getTargetUserIds(categoryIds);
  if (userIds.length === 0) return 0;

  const surveyNotifs = userIds.map(uid => ({
    survey_id: surveyId,
    user_id: uid,
  }));

  const { error: notifError } = await supabase
    .from('survey_notifications')
    .insert(surveyNotifs);

  if (notifError) throw notifError;

  const appNotifs = userIds.map(uid => ({
    user_id: uid,
    type: 'market_survey',
    title: '📊 ' + title,
    body: 'Alguien publicó una investigación de mercado y busca tu opinión.',
    data: { survey_id: surveyId, category_ids: categoryIds },
  }));

  await supabase.from('notifications').insert(appNotifs);

  try {
    await edgeService.sendSurveyPush(surveyId, title, 'Alguien publicó una investigación de mercado y busca tu opinión.', categoryIds);
  } catch {}

  return userIds.length;
}

export async function getUnreadSurveyNotifications(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('survey_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
  return count || 0;
}

export async function getNotificationsForUser(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('survey_notifications')
    .select(`
        *,
        survey:market_surveys(*)
      `)
    .eq('user_id', userId)
    .order('sent_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function markAsRead(notificationId: string): Promise<void> {
  await supabase
    .from('survey_notifications')
    .update({ read: true })
    .eq('id', notificationId);
}
