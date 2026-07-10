import { supabase } from '@lib/supabase';
import { edgeService } from '@lib/supabase/services/notifications/edgeFunctions';

async function getTargetUserIds(categoryIds: string[]): Promise<string[]> {
  try {
    const { data: users, error: userError } = await supabase
      .rpc('get_users_by_categories', { category_ids: categoryIds });
    if (!userError && users && users.length > 0) {
      return users.map((u: { user_id: string }) => u.user_id);
    }
  } catch (err) { console.error('[marketSurveysNotify:getTargetUserIds]', err); }

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
  } catch (err) { console.error('[marketSurveysNotify:sendSurveyPush]', err); }

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

interface SurveyNotificationRow {
  id: string;
  surveyId: string;
  userId: string;
  read: boolean;
  sentAt: Date;
  survey?: {
    id: string;
    userId: string;
    title: string;
    description?: string;
    about?: string;
    problemSolved?: string;
    questions: { id: string; question: string; options: string[] }[];
    categoryIds: string[];
    categories?: unknown;
    responseCount: number;
    createdAt: Date;
  };
}

export async function getNotificationsForUser(userId: string): Promise<SurveyNotificationRow[]> {
  const { data, error } = await supabase
    .from('survey_notifications')
    .select(`
        *,
        survey:market_surveys(*)
      `)
    .eq('user_id', userId)
    .order('sent_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(n => ({
    id: n.id,
    surveyId: n.survey_id,
    userId: n.user_id,
    read: n.read,
    sentAt: new Date(n.sent_at),
    survey: n.survey ? {
      id: n.survey.id,
      userId: n.survey.user_id,
      title: n.survey.title,
      description: n.survey.description,
      about: n.survey.about,
      problemSolved: n.survey.problem_solved,
      questions: n.survey.questions || [],
      categoryIds: n.survey.category_ids || [],
      categories: n.survey.categories,
      responseCount: n.survey.response_count || 0,
      createdAt: new Date(n.survey.created_at),
    } : undefined,
  }));
}

export async function markAsRead(notificationId: string): Promise<void> {
  await supabase
    .from('survey_notifications')
    .update({ read: true })
    .eq('id', notificationId);
}
