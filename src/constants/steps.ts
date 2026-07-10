export const SURVEY_STEPS = {
  ENTER: 'enter',
  RATE: 'rate',
  RECOMMEND: 'recommend',
  COMMENT: 'comment',
  DONE: 'done',
} as const;

export type SurveyStep = (typeof SURVEY_STEPS)[keyof typeof SURVEY_STEPS];

export const SURVEY_STEP_ORDER: SurveyStep[] = ['enter', 'rate', 'recommend', 'comment'];

export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  FINISHED: 'finished',
} as const;

export type EventStatusType = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

export const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
} as const;

export type AuthMode = (typeof AUTH_MODES)[keyof typeof AUTH_MODES];
