export * from './eventsTransform';
export * from './events';
export * from './eventsStatus';

import { getEvents, getEventById, getEventsByUser, getEventsAttending, createEvent, uploadCoverImage, updateEvent, deleteEvent } from './events';
import { attendEvent, cancelAttendance, getEventAttendees, getUserAttendance, isAttending, getAttendeeCount } from './eventsStatus';
import { transformEventData } from './eventsTransform';

export const eventsService = {
  getEvents,
  getEventById,
  getEventsByUser,
  getEventsAttending,
  createEvent,
  uploadCoverImage,
  updateEvent,
  deleteEvent,
  attendEvent,
  cancelAttendance,
  getEventAttendees,
  getUserAttendance,
  isAttending,
  getAttendeeCount,
  transformEventData,
};
