import { CreateEventData, Event, EventAttendance } from '../entities';

export interface IEventRepository {
  getEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | null>;
  createEvent(userId: string, data: CreateEventData): Promise<Event>;
  updateEvent(id: string, data: Partial<CreateEventData>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  getEventAttendees(eventId: string): Promise<any[]>;
  attendEvent(userId: string, eventId: string): Promise<EventAttendance>;
  cancelAttendance(userId: string, eventId: string): Promise<void>;
  getUserAttendances(userId: string): Promise<EventAttendance[]>;
  uploadCoverImage(file: File, eventId: string): Promise<string>;
}