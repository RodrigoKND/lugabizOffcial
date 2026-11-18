import { describe, it, expect } from 'vitest';
import { transformEventData } from '@/lib/supabase/services/events/eventsTransform';

// Fixture base: fila cruda de Supabase (snake_case) para characterization tests
function makeRawEvent(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'ev-1',
    name: 'Concierto',
    description: 'Desc',
    address: 'Av. Siempreviva 742',
    category_id: 'cat-1',
    category: { id: 'cat-1', name: 'Música', icon: 'music', color: '#9333ea', description: null },
    image: 'https://img',
    gallery: null,
    date_start: '2026-06-05',
    date_end: null,
    time_start: '20:00',
    time_end: '23:00',
    price: 100,
    price_options: null,
    price_note: null,
    coupons: null,
    capacity: 50,
    is_free: false,
    tags: null,
    social_links: null,
    coords: null,
    user_id: 'user-1',
    user: { name: 'Ana', avatar: 'https://a.png' },
    event_attendance: [],
    created_at: '2026-05-01T10:00:00Z',
    updated_at: '2026-05-02T10:00:00Z',
    ...overrides,
  };
}

describe('transformEventData', () => {
  it('mapea snake_case de la DB a camelCase del dominio', () => {
    const event = transformEventData(makeRawEvent());

    expect(event.id).toBe('ev-1');
    expect(event.categoryId).toBe('cat-1');
    expect(event.userId).toBe('user-1');
    expect(event.timeStart).toBe('20:00');
    expect(event.isFree).toBe(false);
    expect(event.attendeesCount).toBe(0);
  });

  it('aplica defaults cuando los campos vienen null', () => {
    const event = transformEventData(makeRawEvent({
      gallery: null,
      tags: null,
      price_options: null,
      coupons: null,
      coords: null,
      is_free: null,
    }));

    expect(event.gallery).toEqual([]);
    expect(event.tags).toEqual([]);
    expect(event.priceOptions).toEqual([]);
    expect(event.coupons).toEqual([]);
    expect(event.coords).toEqual([]);
    expect(event.isFree).toBe(false);
  });

  it('parsea date_start como medianoche local (sin shift de timezone)', () => {
    const event = transformEventData(makeRawEvent({ date_start: '2026-06-05' }));

    expect(event.dateStart).toBeInstanceOf(Date);
    expect(event.dateStart.getFullYear()).toBe(2026);
    expect(event.dateStart.getMonth()).toBe(5); // junio = 5
    expect(event.dateStart.getDate()).toBe(5);
    expect(event.dateStart.getHours()).toBe(0); // medianoche LOCAL
  });

  it('date_end null queda como undefined', () => {
    const event = transformEventData(makeRawEvent({ date_end: null }));

    expect(event.dateEnd).toBeUndefined();
  });

  it('cuenta asistentes únicos aunque haya registros duplicados', () => {
    const event = transformEventData(makeRawEvent({
      event_attendance: [
        { user_id: 'u1' },
        { user_id: 'u1' },
        { user_id: 'u2' },
      ],
    }));

    expect(event.attendeesCount).toBe(2);
  });

  it('attendees_count de la DB tiene prioridad sobre el cálculo', () => {
    const event = transformEventData(makeRawEvent({
      attendees_count: 99,
      event_attendance: [{ user_id: 'u1' }],
    }));

    expect(event.attendeesCount).toBe(99);
  });

  it('category y user null quedan como undefined', () => {
    const event = transformEventData(makeRawEvent({ category: null, user: null }));

    expect(event.category).toBeUndefined();
    expect(event.user).toBeUndefined();
  });

  it('fecha pasada en date_start se conserva (el filtro es responsabilidad de getEvents/useHomeEvents)', () => {
    const event = transformEventData(makeRawEvent({ date_start: '2020-01-01' }));

    expect(event.dateStart.getFullYear()).toBe(2020);
  });
});
