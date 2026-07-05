import React, { useMemo, lazy, Suspense, useCallback, useRef } from 'react';
import { X, Image, MapPin, Users, Clock, Calendar, Zap, Loader2, Locate, Plus, Trash2 } from 'lucide-react';
import AddressAutocomplete from '@presentation/components/ui/address/AddressAutocomplete';
import { FormData, ValidationErrors, ScheduleMode, ScheduleEntry } from './EventFormTypes';
import { reverseGeocode } from '@lib/geocoding/geocodingService';

const MapPicker = lazy(() => import('./MapPicker'));

interface Props {
  formData: FormData;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  imagePreviews: string[];
  onChange: (field: string, value: any) => void;
  onBlur: (field: string) => void;
  onImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onCoordsChange?: (lat: number, lng: number) => void;
}

const iCls = (hasError?: boolean) =>
  `w-full px-4 py-3 bg-stone-50 border-2 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-0 ${
    hasError ? 'border-red-300 focus:border-red-400' : 'border-transparent focus:border-primary-400 hover:border-stone-200'
  }`;

const renderError = (field: string, errors: ValidationErrors, touched: Record<string, boolean>) => {
  const msg = errors[field as keyof ValidationErrors];
  if (!touched[field] || !msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-red-500 mt-1.5 ml-0.5">
      <span className="w-3.5 h-3.5 inline-flex items-center justify-center rounded-full bg-red-100 text-red-500 text-[8px] font-bold">!</span>
      {msg}
    </p>
  );
};

function toLocalDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return toLocalDate(d);
}

function addHours(time: string, hours: number): string {
  if (!time) return '';
  const [h, min] = time.split(':').map(Number);
  const total = h + hours;
  if (total >= 24) return '';
  return `${String(total).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

const TIME_PRESETS = ['08:00', '09:00', '10:00', '12:00', '15:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

const MODES: { value: ScheduleMode; label: string; desc: string }[] = [
  { value: 'single', label: 'Un día', desc: 'El evento es en una sola fecha' },
  { value: 'range',  label: 'Varios días', desc: 'Mismo horario todos los días' },
  { value: 'custom', label: 'Sesiones', desc: 'Horario diferente por día' },
];

const DateTimeLocationSection: React.FC<Props> = ({
  formData, errors, touched, imagePreviews, onChange, onBlur, onImage, onRemoveImage, onCoordsChange,
}) => {
  const quickDates = useMemo(() => {
    const today = new Date();
    const dow = today.getDay();
    const daysToSat = ((6 - dow) + 7) % 7 || 7;
    const daysToSun = ((0 - dow) + 7) % 7 || 7;
    const add = (n: number) => { const d = new Date(today); d.setDate(today.getDate() + n); return d; };
    const candidates = [
      { label: 'Hoy',    value: toLocalDate(today) },
      { label: 'Mañana', value: toLocalDate(add(1)) },
      { label: 'Sáb',    value: toLocalDate(add(daysToSat)) },
      { label: 'Dom',    value: toLocalDate(add(daysToSun)) },
    ];
    const seen = new Set<string>();
    return candidates.filter(d => { if (seen.has(d.value)) return false; seen.add(d.value); return true; });
  }, []);

  const endTimePresets = useMemo(() => {
    if (!formData.timeStart) return [];
    return [1, 2, 3, 4].map(h => {
      const v = addHours(formData.timeStart, h);
      return v ? { label: `+${h}h (${v})`, value: v } : null;
    }).filter(Boolean) as { label: string; value: string }[];
  }, [formData.timeStart]);

  const revTimer = useRef<ReturnType<typeof setTimeout>>();
  const handleMapCoords = useCallback((lat: number, lng: number) => {
    onCoordsChange?.(lat, lng);
    onBlur('coords');
    clearTimeout(revTimer.current);
    revTimer.current = setTimeout(async () => {
      const addr = await reverseGeocode(lat, lng);
      if (addr) onChange('address', addr);
    }, 600);
  }, [onCoordsChange, onChange, onBlur]);

  // ── Mode switch helpers ─────────────────────────────────────────────────────
  const switchMode = (mode: ScheduleMode) => {
    if (mode === formData.scheduleMode) return;

    if (mode === 'custom') {
      // Seed schedules from current single/range data
      const entries: ScheduleEntry[] = [];
      if (formData.scheduleMode === 'range' && formData.dateStart && formData.dateEnd && formData.dateStart !== formData.dateEnd) {
        // expand date range (max 14 days)
        let cur = formData.dateStart;
        let count = 0;
        while (cur <= formData.dateEnd && count < 14) {
          entries.push({ date: cur, timeStart: formData.timeStart, timeEnd: formData.timeEnd });
          cur = addDays(cur, 1);
          count++;
        }
      } else if (formData.dateStart) {
        entries.push({ date: formData.dateStart, timeStart: formData.timeStart, timeEnd: formData.timeEnd });
      } else {
        entries.push({ date: '', timeStart: '', timeEnd: '' });
      }
      onChange('schedules', entries);
    } else if (mode === 'single' || mode === 'range') {
      // Pull first schedule back into simple fields
      if (formData.scheduleMode === 'custom' && formData.schedules.length > 0) {
        const first = formData.schedules[0];
        onChange('dateStart', first.date);
        onChange('timeStart', first.timeStart);
        onChange('timeEnd', first.timeEnd);
        if (mode === 'range' && formData.schedules.length > 1) {
          const last = formData.schedules[formData.schedules.length - 1];
          onChange('dateEnd', last.date);
        } else {
          onChange('dateEnd', '');
        }
      }
    }
    onChange('scheduleMode', mode);
  };

  const updateSession = (i: number, field: keyof ScheduleEntry, value: string) => {
    const next = formData.schedules.map((s, idx) => idx === i ? { ...s, [field]: value } : s);
    onChange('schedules', next);
  };

  const addSession = () => {
    const last = formData.schedules[formData.schedules.length - 1];
    const nextDate = last?.date ? addDays(last.date, 1) : '';
    onChange('schedules', [...formData.schedules, { date: nextDate, timeStart: last?.timeStart ?? '', timeEnd: last?.timeEnd ?? '' }]);
  };

  const removeSession = (i: number) => {
    onChange('schedules', formData.schedules.filter((_, idx) => idx !== i));
  };

  const mode = formData.scheduleMode;

  return (
    <div className="space-y-6">

      {/* ── Selector de modo ─────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary-500" />
          <h4 className="text-sm font-semibold text-stone-700">Fecha del evento</h4>
        </div>

        <div className="flex gap-1 p-1 bg-stone-100 rounded-xl mb-4">
          {MODES.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => switchMode(m.value)}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === m.value
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* ── Modo: Un día ──────────────────────────────────── */}
        {mode === 'single' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {quickDates.map(qd => (
                <button
                  key={qd.value}
                  type="button"
                  onClick={() => { onChange('dateStart', qd.value); onBlur('dateStart'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    formData.dateStart === qd.value
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm shadow-primary-200'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-primary-300 hover:text-primary-600'
                  }`}
                >
                  {qd.label}
                </button>
              ))}
              <span className="px-1 py-1.5 text-xs text-stone-400 self-center">o elige:</span>
            </div>
            <div className="space-y-1">
              <input
                type="date"
                value={formData.dateStart}
                onChange={e => onChange('dateStart', e.target.value)}
                onBlur={() => onBlur('dateStart')}
                className={iCls(!!(touched.dateStart && errors.dateStart))}
              />
              {renderError('dateStart', errors, touched)}
            </div>
          </div>
        )}

        {/* ── Modo: Varios días ─────────────────────────────── */}
        {mode === 'range' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Inicio</label>
                <input
                  type="date"
                  value={formData.dateStart}
                  onChange={e => onChange('dateStart', e.target.value)}
                  onBlur={() => onBlur('dateStart')}
                  className={iCls(!!(touched.dateStart && errors.dateStart))}
                />
                {renderError('dateStart', errors, touched)}
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Fin</label>
                <input
                  type="date"
                  value={formData.dateEnd}
                  min={formData.dateStart || undefined}
                  onChange={e => onChange('dateEnd', e.target.value)}
                  onBlur={() => onBlur('dateEnd')}
                  className={iCls()}
                />
              </div>
            </div>
            <p className="text-[11px] text-stone-400">El mismo horario aplica a todos los días del evento.</p>
          </div>
        )}

        {/* ── Modo: Sesiones ────────────────────────────────── */}
        {mode === 'custom' && (
          <div className="space-y-2">
            {formData.schedules.map((session, i) => (
              <div key={i} className="bg-stone-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-stone-500">Sesión {i + 1}</span>
                  {formData.schedules.length > 1 && (
                    <button type="button" onClick={() => removeSession(i)}
                      className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <label className="text-[10px] text-stone-400 font-medium">Fecha</label>
                    <input
                      type="date"
                      value={session.date}
                      onChange={e => updateSession(i, 'date', e.target.value)}
                      className="w-full mt-0.5 px-3 py-2 bg-white border-2 border-transparent hover:border-stone-200 focus:border-primary-400 rounded-xl text-xs outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 font-medium">Hora inicio</label>
                    <input
                      type="time"
                      value={session.timeStart}
                      onChange={e => updateSession(i, 'timeStart', e.target.value)}
                      className="w-full mt-0.5 px-3 py-2 bg-white border-2 border-transparent hover:border-stone-200 focus:border-primary-400 rounded-xl text-xs outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 font-medium">Hora fin</label>
                    <input
                      type="time"
                      value={session.timeEnd}
                      onChange={e => updateSession(i, 'timeEnd', e.target.value)}
                      className="w-full mt-0.5 px-3 py-2 bg-white border-2 border-transparent hover:border-stone-200 focus:border-primary-400 rounded-xl text-xs outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
            {touched.schedules && errors.schedules && (
              <p className="flex items-center gap-1.5 text-[11px] text-red-500">
                <span className="w-3.5 h-3.5 inline-flex items-center justify-center rounded-full bg-red-100 text-red-500 text-[8px] font-bold">!</span>
                {errors.schedules}
              </p>
            )}
            <button
              type="button"
              onClick={addSession}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border-2 border-dashed border-stone-200 text-sm text-stone-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Agregar sesión
            </button>
          </div>
        )}
      </div>

      {/* ── Hora inicio / fin (solo para modos single y range) ─ */}
      {mode !== 'custom' && (
        <>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary-500" />
              <h4 className="text-sm font-semibold text-stone-700">Hora de inicio</h4>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {TIME_PRESETS.map(tp => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => { onChange('timeStart', tp); onBlur('timeStart'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    formData.timeStart === tp
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm shadow-primary-200'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-primary-300 hover:text-primary-600'
                  }`}
                >
                  {tp}
                </button>
              ))}
            </div>
            <div className="space-y-1 max-w-xs">
              <input
                type="time"
                value={formData.timeStart}
                onChange={e => onChange('timeStart', e.target.value)}
                onBlur={() => onBlur('timeStart')}
                className={iCls(!!(touched.timeStart && errors.timeStart))}
              />
              {renderError('timeStart', errors, touched)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary-500" />
              <h4 className="text-sm font-semibold text-stone-700">
                Hora de fin <span className="text-stone-400 font-normal text-xs">(opcional)</span>
              </h4>
            </div>
            {endTimePresets.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {endTimePresets.map(tp => (
                  <button
                    key={tp.value}
                    type="button"
                    onClick={() => onChange('timeEnd', tp.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      formData.timeEnd === tp.value
                        ? 'bg-stone-700 text-white border-stone-700'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {tp.label}
                  </button>
                ))}
              </div>
            )}
            {!formData.timeStart && (
              <p className="text-[11px] text-stone-400 mb-2">Selecciona la hora de inicio primero.</p>
            )}
            <input
              type="time"
              value={formData.timeEnd}
              onChange={e => onChange('timeEnd', e.target.value)}
              className="max-w-xs px-4 py-3 bg-stone-50 border-2 border-transparent hover:border-stone-200 focus:border-primary-400 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-0"
            />
          </div>
        </>
      )}

      {/* ── Capacidad ────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary-500" />
          <h4 className="text-sm font-semibold text-stone-700">Capacidad <span className="text-stone-400 font-normal text-xs">(opcional)</span></h4>
        </div>
        <input
          type="number"
          min={0}
          value={formData.capacity || ''}
          onChange={e => onChange('capacity', Number(e.target.value))}
          className="max-w-xs px-4 py-3 bg-stone-50 border-2 border-transparent hover:border-stone-200 focus:border-primary-400 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-0"
          placeholder="Máximo de asistentes"
        />
      </div>

      {/* ── Dirección ────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-primary-500" />
          <h4 className="text-sm font-semibold text-stone-700">Ubicación</h4>
        </div>
        <div className="space-y-1">
          <AddressAutocomplete
            value={formData.address}
            onChange={(val) => onChange('address', val)}
            onSelect={(result) => {
              onChange('address', result.displayName);
              onCoordsChange?.(result.lat, result.lng);
              onBlur('coords');
            }}
            onBlur={() => onBlur('address')}
            placeholder="Dirección del evento"
            hasError={!!(touched.address && errors.address)}
            near={formData.coords?.length === 2 ? { lat: formData.coords[0], lng: formData.coords[1] } : undefined}
          />
          {renderError('address', errors, touched)}
        </div>

        <div className="space-y-1 mt-3">
          <p className="text-[11px] text-stone-500 mb-2">
            Confirma la ubicación en el mapa. Haz clic o arrastra el marcador para ajustarla.
          </p>
          <Suspense fallback={
            <div className="aspect-video bg-stone-100 rounded-xl flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
            </div>
          }>
            <MapPicker initialCoords={formData.coords} onCoordsChange={handleMapCoords} />
          </Suspense>
          {touched.coords && errors.coords && (
            <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1.5">
              <span className="w-3.5 h-3.5 inline-flex items-center justify-center rounded-full bg-red-100 text-red-500 text-[8px] font-bold">!</span>
              {errors.coords}
            </p>
          )}
          {formData.coords?.length === 2 && (
            <div className="flex items-center gap-2 text-xs text-stone-500 bg-primary-50 px-3 py-2 rounded-xl mt-2">
              <Locate className="w-3.5 h-3.5 text-primary-500" />
              <span>{formData.coords[0].toFixed(6)}, {formData.coords[1].toFixed(6)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Imágenes ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Image className="w-4 h-4 text-primary-500" />
          <h4 className="text-sm font-semibold text-stone-700">Imágenes</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex flex-col items-center justify-center w-20 h-20 bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all group">
            <Image className="w-5 h-5 text-stone-400 group-hover:text-primary-500 transition-colors" />
            <span className="text-[9px] text-stone-400 mt-1">Agregar</span>
            <input type="file" accept="image/*" onChange={onImage} className="hidden" multiple />
          </label>
          {imagePreviews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group ring-1 ring-stone-100">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-stone-400 mt-2">Máx 5 imágenes · 10MB total</p>
      </div>
    </div>
  );
};

export default DateTimeLocationSection;
