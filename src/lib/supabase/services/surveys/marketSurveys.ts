import { supabase } from '@lib/supabase';
import { MarketSurvey, CreateSurveyData } from '@domain/entities';

export const marketSurveysService = {
  async create(data: CreateSurveyData, userId: string): Promise<MarketSurvey> {
    const { data: survey, error } = await supabase
      .from('market_surveys')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description,
        about: data.about,
        benefit: data.benefit,
        problem_solved: data.problemSolved,
      })
      .select()
      .single();

    if (error) throw error;

    if (data.categoryIds.length > 0) {
      const { error: catError } = await supabase
        .from('survey_categories')
        .insert(data.categoryIds.map(cid => ({
          survey_id: survey.id,
          category_id: cid,
        })));
      if (catError) throw catError;
    }

    const { data: count } = await supabase
      .from('survey_responses')
      .select('id', { count: 'exact', head: true })
      .eq('survey_id', survey.id);

    return this.transform(survey, data.categoryIds, count || 0);
  },

  async getAll(): Promise<MarketSurvey[]> {
    const { data, error } = await supabase
      .from('market_surveys')
      .select(`
        *,
        survey_categories(category:categories(*)),
        response_count:survey_responses(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((s: any) => this.transform(s,
      (s.survey_categories || []).map((sc: any) => sc.category?.id).filter(Boolean),
      s.response_count?.[0]?.count || 0
    ));
  },

  async getByUser(userId: string): Promise<MarketSurvey[]> {
    const { data, error } = await supabase
      .from('market_surveys')
      .select(`
        *,
        survey_categories(category:categories(*)),
        response_count:survey_responses(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((s: any) => this.transform(s,
      (s.survey_categories || []).map((sc: any) => sc.category?.id).filter(Boolean),
      s.response_count?.[0]?.count || 0
    ));
  },

  async getById(id: string): Promise<MarketSurvey | null> {
    const { data, error } = await supabase
      .from('market_surveys')
      .select(`
        *,
        survey_categories(category:categories(*))
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const { count } = await supabase
      .from('survey_responses')
      .select('id', { count: 'exact', head: true })
      .eq('survey_id', id);

    return this.transform(data,
      (data.survey_categories || []).map((sc: any) => sc.category?.id).filter(Boolean),
      count || 0
    );
  },

  async notifyUsers(surveyId: string, categoryIds: string[]): Promise<number> {
    const { data: users, error: userError } = await supabase
      .rpc('get_users_by_categories', { category_ids: categoryIds });

    if (userError) throw userError;
    const userIds: string[] = (users as any[] || []).map((u: any) => u.user_id);

    if (userIds.length === 0) return 0;

    const notifications = userIds.map(uid => ({
      survey_id: surveyId,
      user_id: uid,
    }));

    const { error } = await supabase
      .from('survey_notifications')
      .insert(notifications);

    if (error) throw error;
    return userIds.length;
  },

  async getUnreadSurveyNotifications(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('survey_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  async getNotificationsForUser(userId: string): Promise<any[]> {
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
  },

  async markAsRead(notificationId: string): Promise<void> {
    await supabase
      .from('survey_notifications')
      .update({ read: true })
      .eq('id', notificationId);
  },

  async getResponses(surveyId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('survey_responses')
      .select(`
        *,
        user:users(name, avatar)
      `)
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      surveyId: r.survey_id,
      userId: r.user_id,
      userName: r.user?.name || 'Usuario',
      userAvatar: r.user?.avatar,
      createdAt: new Date(r.created_at),
    }));
  },

  async respond(surveyId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('survey_responses')
      .insert({ survey_id: surveyId, user_id: userId });

    if (error) throw error;
  },

  async hasResponded(surveyId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('survey_responses')
      .select('id')
      .eq('survey_id', surveyId)
      .eq('user_id', userId)
      .maybeSingle();

    return !!data;
  },

  transform(survey: any, categoryIds: string[], responseCount: number): MarketSurvey {
    return {
      id: survey.id,
      userId: survey.user_id,
      title: survey.title,
      description: survey.description,
      about: survey.about,
      benefit: survey.benefit,
      problemSolved: survey.problem_solved,
      categoryIds,
      categories: (survey.survey_categories || []).map((sc: any) => ({
        id: sc.category?.id,
        name: sc.category?.name,
        icon: sc.category?.icon,
        color: sc.category?.color,
      })).filter(Boolean),
      responseCount,
      createdAt: new Date(survey.created_at),
    };
  },
};
