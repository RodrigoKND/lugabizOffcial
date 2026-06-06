import { Event } from '@domain/entities';
import { MappedEvent } from './EventSection.types';

export const mapToMockEvent = (event: Event): MappedEvent => ({
  id: event.id,
  title: event.name,
  description: event.description,
  location: event.address,
  imageUrl: event.image || '',
  images: event.gallery?.length ? event.gallery : (event.image ? [event.image] : []),
  startDate: event.dateStart,
  endDate: event.dateStart,
  availableDays: [],
  availableHours: { start: event.timeStart, end: event.timeEnd || '' },
  category: event.category?.name || 'General',
  organizer: {
    name: event.user?.name || 'Organizer',
    avatar: event.user?.avatar || '',
    isNew: false,
  },
  likes: event.attendeesCount || 0,
  comments: 0,
});
