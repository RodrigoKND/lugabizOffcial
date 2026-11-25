import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDoubleTap, DOUBLE_TAP_MS } from '@/presentation/hooks/reactions/useDoubleTap';

const evt = () => ({ stopPropagation: vi.fn() });

describe('useDoubleTap', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('un toque simple se ejecuta recién al pasar la ventana, no antes', () => {
    const single = vi.fn(); const dbl = vi.fn();
    const { result } = renderHook(() => useDoubleTap(single, dbl));
    act(() => { result.current(evt()); });
    expect(single).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(DOUBLE_TAP_MS); });
    expect(single).toHaveBeenCalledTimes(1);
    expect(dbl).not.toHaveBeenCalled();
  });

  it('dos toques seguidos disparan solo el doble y cancelan el simple', () => {
    const single = vi.fn(); const dbl = vi.fn();
    const { result } = renderHook(() => useDoubleTap(single, dbl));
    const second = evt();
    act(() => { result.current(evt()); });
    act(() => { vi.advanceTimersByTime(100); });
    act(() => { result.current(second); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(dbl).toHaveBeenCalledTimes(1);
    expect(dbl).toHaveBeenCalledWith(second);
    expect(single).not.toHaveBeenCalled();
  });

  it('dos toques separados por más de la ventana son dos simples', () => {
    const single = vi.fn(); const dbl = vi.fn();
    const { result } = renderHook(() => useDoubleTap(single, dbl));
    act(() => { result.current(evt()); });
    act(() => { vi.advanceTimersByTime(DOUBLE_TAP_MS + 10); });
    act(() => { result.current(evt()); });
    act(() => { vi.advanceTimersByTime(DOUBLE_TAP_MS + 10); });
    expect(single).toHaveBeenCalledTimes(2);
    expect(dbl).not.toHaveBeenCalled();
  });

  it('un tercer toque empieza una secuencia nueva', () => {
    const single = vi.fn(); const dbl = vi.fn();
    const { result } = renderHook(() => useDoubleTap(single, dbl));
    act(() => { result.current(evt()); result.current(evt()); result.current(evt()); });
    act(() => { vi.advanceTimersByTime(DOUBLE_TAP_MS); });
    expect(dbl).toHaveBeenCalledTimes(1);
    expect(single).toHaveBeenCalledTimes(1);
  });

  it('frena la propagación para que la tarjeta no navegue dos veces', () => {
    const { result } = renderHook(() => useDoubleTap(vi.fn(), vi.fn()));
    const e = evt();
    act(() => { result.current(e); });
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it('al desmontar cancela el toque pendiente', () => {
    const single = vi.fn();
    const { result, unmount } = renderHook(() => useDoubleTap(single, vi.fn()));
    act(() => { result.current(evt()); });
    unmount();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(single).not.toHaveBeenCalled();
  });
});
