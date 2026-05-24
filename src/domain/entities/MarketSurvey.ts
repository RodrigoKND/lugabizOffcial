export interface MarketSurvey {
  id: string;
  userId: string;
  title: string;
  description: string;
  about: string;
  benefit: string;
  problemSolved: string;
  categoryIds: string[];
  categories?: { id: string; name: string; icon: string; color: string }[];
  responseCount: number;
  createdAt: Date;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  createdAt: Date;
}

export interface SurveyNotification {
  id: string;
  surveyId: string;
  userId: string;
  read: boolean;
  sentAt: Date;
  survey?: MarketSurvey;
}

export interface CreateSurveyData {
  title: string;
  description: string;
  about: string;
  benefit: string;
  problemSolved: string;
  categoryIds: string[];
}
