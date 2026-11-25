import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProximityEngine, type EnginePlace } from '@/infrastructure/native/proximityEngine';

const H = 3_600_000;
const ME = { lat: -17.3935, lng: -66.157 };
// 0.0012° de latitud ≈ 133 m · 0.0036° ≈ 400 m
const place = (id: string, dLat: number): EnginePlace => ({ id, name: `Lugar ${id}`, latitude: ME.lat + dLat, longitude: ME.lng });

function setup(places: EnginePlace[], opts = {}) {
  const data = new Map<string, string>();
  let clock = 1_000 * H;
  const deps = {
    loadPlaces: vi.fn().mockResolvedValue(places),
    onNearby: vi.fn().mockResolvedValue(undefined),
    store: { get: (k: string) => data.get(k) ?? null, set: (k: string, v: string) => { data.set(k, v); } },
    now: () => clock,
  };
  return { deps, engine: createProximityEngine(deps, opts), advance: (ms: number) => { clock += ms; } };
}

const fix = (extra = {}) => ({ lat: ME.lat, lng: ME.lng, accuracy: 20, ...extra });

describe('createProximityEngine', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('avisa de un lugar dentro del radio (≈133 m) y no de uno lejano (≈400 m)', async () => {
    const { engine, deps } = setup([place('cerca', 0.0012), place('lejos', 0.0036)]);
    expect(await engine.onLocation(fix())).toEqual(['cerca']);
    expect(deps.onNearby).toHaveBeenCalledTimes(1);
    expect(deps.onNearby.mock.calls[0][0].id).toBe('cerca');
    expect(deps.onNearby.mock.calls[0][1]).toBeGreaterThan(100);
  });

  it('ignora lecturas imprecisas o sin precisión', async () => {
    const { engine, deps } = setup([place('cerca', 0.0012)]);
    expect(await engine.onLocation(fix({ accuracy: 300 }))).toEqual([]);
    expect(await engine.onLocation(fix({ accuracy: null }))).toEqual([]);
    expect(deps.onNearby).not.toHaveBeenCalled();
  });

  it('no repite el aviso durante 24 h y vuelve a avisar después', async () => {
    const { engine, deps, advance } = setup([place('cerca', 0.0012)]);
    await engine.onLocation(fix());
    advance(2 * H);
    expect(await engine.onLocation(fix())).toEqual([]);
    advance(23 * H);
    expect(await engine.onLocation(fix())).toEqual(['cerca']);
    expect(deps.onNearby).toHaveBeenCalledTimes(2);
  });

  it('pide los lugares una sola vez mientras te mueves poco y de nuevo si te alejas más de 1.5 km', async () => {
    const { engine, deps } = setup([place('cerca', 0.0012)]);
    await engine.onLocation(fix());
    await engine.onLocation(fix({ lat: ME.lat + 0.0003 }));
    expect(deps.loadPlaces).toHaveBeenCalledTimes(1);
    await engine.onLocation(fix({ lat: ME.lat + 0.02 }));
    expect(deps.loadPlaces).toHaveBeenCalledTimes(2);
  });

  it('si no se pueden cargar los lugares no lanza error ni avisa', async () => {
    const { engine, deps } = setup([]);
    deps.loadPlaces.mockRejectedValue(new Error('sin red'));
    await expect(engine.onLocation(fix())).resolves.toEqual([]);
  });

  it('si falla el aviso no queda en espera: se reintenta con la siguiente lectura', async () => {
    const { engine, deps } = setup([place('cerca', 0.0012)]);
    deps.onNearby.mockRejectedValueOnce(new Error('falló'));
    expect(await engine.onLocation(fix())).toEqual([]);
    expect(await engine.onLocation(fix())).toEqual(['cerca']);
  });

  it('avisa como máximo de 2 lugares por lectura (los más cercanos)', async () => {
    const { engine } = setup([place('a', 0.0004), place('b', 0.0008), place('c', 0.0012)]);
    expect(await engine.onLocation(fix())).toEqual(['a', 'b']);
  });

  it('mientras procesa una lectura ignora las que llegan en paralelo', async () => {
    const { engine, deps } = setup([place('cerca', 0.0012)]);
    deps.onNearby.mockImplementation(() => new Promise(r => setTimeout(r, 20)));
    const [first, second] = await Promise.all([engine.onLocation(fix()), engine.onLocation(fix())]);
    expect(first).toEqual(['cerca']);
    expect(second).toEqual([]);
    expect(deps.onNearby).toHaveBeenCalledTimes(1);
  });
});
