import { supabase } from '@lib/supabase';
import { MarketSurvey, CreateSurveyData } from '@domain/entities';

function transform(survey: any, categoryIds: string[], responseCount: number): MarketSurvey {
  return {
    id: survey.id,
    userId: survey.user_id,
    title: survey.title,
    description: survey.description,
    about: survey.about,
    problemSolved: survey.problem_solved,
    questions: survey.questions || [],
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
}

export async function create(data: CreateSurveyData, userId: string): Promise<MarketSurvey> {
  const { data: survey, error } = await supabase
    .from('market_surveys')
    .insert({
      user_id: userId,
      title: data.title,
      description: data.description,
      about: data.about,
      problem_solved: data.problemSolved,
      questions: data.questions,
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

  const { count } = await supabase
    .from('survey_responses')
    .select('id', { count: 'exact', head: true })
    .eq('survey_id', survey.id);

  return transform(survey, data.categoryIds, count || 0);
}

export async function getAll(): Promise<MarketSurvey[]> {
  const { data, error } = await supabase
    .from('market_surveys')
    .select(`
        *,
        survey_categories(category:categories(*)),
        response_count:survey_responses(count)
      `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((s: any) => transform(s,
    (s.survey_categories || []).map((sc: any) => sc.category?.id).filter(Boolean),
    s.response_count?.[0]?.count || 0
  ));
}

export async function getByUser(userId: string): Promise<MarketSurvey[]> {
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
  return (data || []).map((s: any) => transform(s,
    (s.survey_categories || []).map((sc: any) => sc.category?.id).filter(Boolean),
    s.response_count?.[0]?.count || 0
  ));
}

export async function getById(id: string): Promise<MarketSurvey | null> {
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

  return transform(data,
    (data.survey_categories || []).map((sc: any) => sc.category?.id).filter(Boolean),
    count || 0
  );
}

export async function getResponses(surveyId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('survey_id', surveyId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const userIds = [...new Set((data || []).map(r => r.user_id))];
  const { data: users } = await supabase
    .from('users')
    .select('id, name, avatar')
    .in('id', userIds.length > 0 ? userIds : ['none']);

  const userMap = Object.fromEntries(
    (users || []).map(u => [u.id, { name: u.name, avatar: u.avatar }])
  );

  return (data || []).map((r: any) => ({
    id: r.id,
    surveyId: r.survey_id,
    userId: r.user_id,
    userName: userMap[r.user_id]?.name || 'Usuario',
    userAvatar: userMap[r.user_id]?.avatar || null,
    createdAt: new Date(r.created_at),
  }));
}

export async function respond(surveyId: string, userId: string, answers?: { questionId: string; answer: string }[]): Promise<void> {
  const { error } = await supabase
    .from('survey_responses')
    .insert({ survey_id: surveyId, user_id: userId, answers: answers || [] });

  if (error) throw error;
}

export async function hasResponded(surveyId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('survey_responses')
    .select('id')
    .eq('survey_id', surveyId)
    .eq('user_id', userId)
    .maybeSingle();

  return !!data;
}
