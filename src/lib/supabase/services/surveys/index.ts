export * from './marketSurveys';
export * from './marketSurveysNotify';

import { create, getAll, getByUser, getById, getResponses, respond, hasResponded } from './marketSurveys';
import { notifyUsers, getUnreadSurveyNotifications, getNotificationsForUser, markAsRead } from './marketSurveysNotify';

export const marketSurveysService = {
  create,
  getAll,
  getByUser,
  getById,
  getResponses,
  respond,
  hasResponded,
  notifyUsers,
  getUnreadSurveyNotifications,
  getNotificationsForUser,
  markAsRead,
};
