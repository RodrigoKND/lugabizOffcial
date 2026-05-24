import { useState, useEffect, useCallback } from 'react';
import { marketSurveysService } from '@lib/supabase';
import { MarketSurvey } from '@domain/entities';
import { useAuth } from '@presentation/context';

export function useUnreadSurveys() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }
    try {
      const count = await marketSurveysService.getUnreadSurveyNotifications(user.id);
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { unreadCount, refresh };
}

export function usePendingsurveys() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<MarketSurvey[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setSurveys([]); setLoading(false); return; }
    try {
      const notifications = await marketSurveysService.getNotificationsForUser(user.id);
      const unread = notifications.filter((n: any) => !n.read);
      const surveyIds = [...new Set(unread.map((n: any) => n.survey_id))];
      const result: MarketSurvey[] = [];
      for (const sid of surveyIds) {
        const s = await marketSurveysService.getById(sid);
        if (s) result.push(s);
      }
      setSurveys(result);
    } catch { setSurveys([]); }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { surveys, loading, refresh: load };
}

export function useMySurveys() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<MarketSurvey[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setSurveys([]); setLoading(false); return; }
    try {
      const data = await marketSurveysService.getByUser(user.id);
      setSurveys(data);
    } catch { setSurveys([]); }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { surveys, loading, refresh: load };
}
