import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { Event } from '@domain/entities';
import { useHomeEvents } from '@/presentation/hooks/home/useHomeEvents';

// Mock de los servicios Supabase que usa el hook
const h = vi.hoisted(() => ({
  getViewedEventIds: vi.fn(),
  getLikedEventIds: vi.fn(),
  markAsViewed: vi.fn(),
}));

vi.mock('@lib/supabase', () => ({
  eventViewsService: {
    getViewedEventIds: h.getViewedEventIds,
    markAsViewed: h.markAsViewed,
  },
  eventLikesService: {
    getLikedEventIds: h.getLikedEventIds,
  },
}));

const TODAY = new Date().toISOString().slice(0, 10);

function makeEvent(id: string, dateStart: string | Date = '2099-01-01'): Event {
  return { id, name: id, dateStart } as unknown as Event;
}

beforeEach(() => {
  vi.clearAllMocks();
  h.getViewedEventIds.mockResolvedValue([]);
  h.getLikedEventIds.mockResolvedValue([]);
  h.markAsViewed.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useHomeEvents — filtrado de eventos', () => {
  it('excluye eventos pasados e incluye hoy y futuros', () => {
    const past = makeEvent('past', '2000-01-01');
    const today = makeEvent('today', TODAY);
    const future = makeEvent('future', '2099-01-01');

    const { result } = renderHook(() => useHomeEvents([past, today, future]));

    expect(result.current.activeEvents.map(e => e.id)).toEqual(['today', 'future']);
  });

  it('soporta dateStart como Date ademas de string', () => {
    const tomorrow = new Date(Date.now() + 86_400_000);
    const future = makeEvent('future-date', tomorrow);

    const { result } = renderHook(() => useHomeEvents([future]));

    expect(result.current.activeEvents).toHaveLength(1);
  });

  it('con lista vacía retorna activeEvents vacío y heroEvent null', () => {
    const { result } = renderHook(() => useHomeEvents([]));

    expect(result.current.activeEvents).toEqual([]);
    expect(result.current.heroEvent).toBeNull();
  });
});

describe('useHomeEvents — orden por vistas', () => {
  it('ordena los NO vistos primero y los vistos al final', async () => {
    h.getViewedEventIds.mockResolvedValue(['ev-b']);
    const events = [makeEvent('ev-a'), makeEvent('ev-b'), makeEvent('ev-c')];

    const { result } = renderHook(() => useHomeEvents(events, 'user-1'));

    await waitFor(() => {
      expect(result.current.viewedEvents.has('ev-b')).toBe(true);
    });
    expect(result.current.sortedActiveEvents.map(e => e.id)).toEqual(['ev-a', 'ev-c', 'ev-b']);
  });
});

describe('useHomeEvents — hero', () => {
  it('heroEvent es el primer evento activo y rota con setHeroIndex', () => {
    const events = [makeEvent('ev-a'), makeEvent('ev-b')];

    const { result } = renderHook(() => useHomeEvents(events));

    expect(result.current.heroEvent?.id).toBe('ev-a');
    act(() => result.current.setHeroIndex(1));
    expect(result.current.heroEvent?.id).toBe('ev-b');
    expect(result.current.heroIndex).toBe(1);
  });

  it('con 2+ eventos inicia timer de rotación cada 6s', () => {
    vi.useFakeTimers();
    const events = [makeEvent('ev-a'), makeEvent('ev-b')];

    const { result } = renderHook(() => useHomeEvents(events));

    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(6000));
    expect(result.current.heroIndex).toBe(1);
  });

  it('con 0 o 1 evento NO inicia timer (sin fugas de interval)', () => {
    vi.useFakeTimers();

    renderHook(() => useHomeEvents([makeEvent('ev-a')]));

    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('useHomeEvents — markEventViewed', () => {
  it('sin userId es no-op: no llama al servicio ni cambia estado', () => {
    const { result } = renderHook(() => useHomeEvents([makeEvent('ev-a')]));

    act(() => result.current.markEventViewed('ev-a'));

    expect(h.markAsViewed).not.toHaveBeenCalled();
    expect(result.current.viewedEvents.size).toBe(0);
  });

  it('marca la vista localmente y llama al servicio', async () => {
    const { result } = renderHook(() => useHomeEvents([makeEvent('ev-a')], 'user-1'));

    act(() => result.current.markEventViewed('ev-a'));

    expect(h.markAsViewed).toHaveBeenCalledWith('ev-a', 'user-1');
    expect(result.current.viewedEvents.has('ev-a')).toBe(true);
  });

  it('con el evento ya visto no vuelve a llamar al servicio', async () => {
    h.getViewedEventIds.mockResolvedValue(['ev-a']);
    const { result } = renderHook(() => useHomeEvents([makeEvent('ev-a')], 'user-1'));

    await waitFor(() => {
      expect(result.current.viewedEvents.has('ev-a')).toBe(true);
    });

    act(() => result.current.markEventViewed('ev-a'));

    expect(h.markAsViewed).not.toHaveBeenCalled();
  });
});

describe('useHomeEvents — carga y errores', () => {
  it('sin userId no llama a servicios de vistas/likes', () => {
    renderHook(() => useHomeEvents([makeEvent('ev-a')]));

    expect(h.getViewedEventIds).not.toHaveBeenCalled();
    expect(h.getLikedEventIds).not.toHaveBeenCalled();
  });

  it('si los servicios fallan, el estado queda vacío sin lanzar error', async () => {
    h.getViewedEventIds.mockRejectedValue(new Error('red'));
    h.getLikedEventIds.mockRejectedValue(new Error('red'));

    const { result } = renderHook(() => useHomeEvents([makeEvent('ev-a')], 'user-1'));

    // no debe lanzar: los catches internos absorben el error
    await waitFor(() => {
      expect(h.getLikedEventIds).toHaveBeenCalled();
    });
    expect(result.current.viewedEvents.size).toBe(0);
    expect(result.current.likedEvents.size).toBe(0);
  });

  it('carga las vistas y likes del usuario al montar', async () => {
    h.getViewedEventIds.mockResolvedValue(['v1']);
    h.getLikedEventIds.mockResolvedValue(['l1']);

    const { result } = renderHook(() => useHomeEvents([], 'user-1'));

    await waitFor(() => {
      expect(result.current.viewedEvents.has('v1')).toBe(true);
      expect(result.current.likedEvents.has('l1')).toBe(true);
    });
    expect(h.getViewedEventIds).toHaveBeenCalledWith('user-1');
    expect(h.getLikedEventIds).toHaveBeenCalledWith('user-1');
  });
});
