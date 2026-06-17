import React, { useMemo } from 'react';
import { X, Image, MapPin, Users, Clock, Calendar, Zap } from 'lucide-react';
import AddressAutocomplete from '@presentation/components/ui/address/AddressAutocomplete';
import { FormData, ValidationErrors } from './EventFormTypes';
import type { GeoResult } from '@lib/geocoding/geocodingService';

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
    hasError ? 'border-red-300 focus:border-red-400' : 'border-transparent focus:border-amber-400 hover:border-stone-200'
  }`;

const renderError = (field: string, errors: ValidationErrors, touched: Record<string, boolean>) => {
  if (!touched[field] || !errors[field as keyof ValidationErrors]) return null;
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-red-500 mt-1.5 ml-0.5">
      <span className="w-3.5 h-3.5 inline-flex items-center justify-center rounded-full bg-red-100 text-red-500 text-[8px] font-bold">!</span>
      {errors[field as keyof ValidationErrors]}
    </p>
  );
};

function toLocalDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addHours(time: string, hours: number): string {
  if (!time) return '';
  const [h, min] = time.split(':').map(Number);
  const total = h + hours;
  if (total >= 24) return '';
  return `${String(total).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

const TIME_PRESETS = [
  { label: '08:00', value: '08:00' },
  { label: '10:00', value: '10:00' },
  { label: '12:00', value: '12:00' },
  { label: '15:00', value: '15:00' },
  { label: '18:00', value: '18:00' },
  { label: '19:00', value: '19:00' },
  { label: '20:00', value: '20:00' },
  { label: '21:00', value: '21:00' },
  { label: '22:00', value: '22:00' },
];

const DateTimeLocationSection: React.FC<Props> = ({
  formData, errors, touched, imagePreviews, onChange, onBlur, onImage, onRemoveImage, onCoordsChange,
}) => {
  const quickDates = useMemo(() => {
    const today = new Date();
    const dow = today.getDay(); // 0=Dom, 6=Sáb
    const daysToSat = ((6 - dow) + 7) % 7 || 7;
    const daysToSun = ((0 - dow) + 7) % 7 || 7;
    const add = (n: number) => { const d = new Date(today); d.setDate(today.getDate() + n); return d; };
    const candidates = [
      { label: 'Hoy', value: toLocalDate(today) },
      { label: 'Mañana', value: toLocalDate(add(1)) },
      { label: 'Sábado', value: toLocalDate(add(daysToSat)) },
      { label: 'Domingo', value: toLocalDate(add(daysToSun)) },
    ];
    // Deduplicate: when tomorrow IS Saturday or Sunday, skip the redundant chip
    const seen = new Set<string>();
    return candidates.filter(d => {
      if (seen.has(d.value)) return false;
      seen.add(d.value);
      return true;
    });
  }, []);

  const endTimePresets = useMemo(() => {
    if (!formData.timeStart) return [];
    return [1, 2, 3, 4]
      .map(h => {
        const v = addHours(formData.timeStart, h);
        return v ? { label: `+${h}h (${v})`, value: v } : null;
      })
      .filter(Boolean) as { label: string; value: string }[];
  }, [formData.timeStart]);

  return (
    <div className="space-y-6">

      {/* ── Fecha ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-semibold text-stone-700">Fecha del evento</h4>
        </div>

        {/* Quick-select chips */}
        <div className="flex flex-wrap gap-2 mb-2">
          {quickDates.map(qd => (
            <button
              key={qd.value}
              type="button"
              onClick={() => { onChange('dateStart', qd.value); onBlur('dateStart'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                formData.dateStart === qd.value
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-amber-300 hover:text-amber-600'
              }`}
            >
              {qd.label}
            </button>
          ))}
          <span className="px-2 py-1.5 text-xs text-stone-400 self-center">o elige:</span>
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

      {/* ── Hora inicio ──────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-semibold text-stone-700">Hora de inicio</h4>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {TIME_PRESETS.map(tp => (
            <button
              key={tp.value}
              type="button"
              onClick={() => { onChange('timeStart', tp.value); onBlur('timeStart'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                formData.timeStart === tp.value
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-amber-300 hover:text-amber-600'
              }`}
            >
              {tp.label}
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

      {/* ── Hora fin ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-semibold text-stone-700">Hora de fin <span className="text-stone-400 font-normal text-xs">(opcional)</span></h4>
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
          <p className="text-[11px] text-stone-400 mb-2">Selecciona la hora de inicio primero para ver sugerencias.</p>
        )}

        <input
          type="time"
          value={formData.timeEnd}
          onChange={e => onChange('timeEnd', e.target.value)}
          className="max-w-xs px-4 py-3 bg-stone-50 border-2 border-transparent hover:border-stone-200 focus:border-amber-400 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-0"
        />
      </div>

      {/* ── Capacidad ────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-semibold text-stone-700">Capacidad <span className="text-stone-400 font-normal text-xs">(opcional)</span></h4>
        </div>
        <input
          type="number"
          min={0}
          value={formData.capacity || ''}
          onChange={e => onChange('capacity', Number(e.target.value))}
          className="max-w-xs px-4 py-3 bg-stone-50 border-2 border-transparent hover:border-stone-200 focus:border-amber-400 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-0"
          placeholder="Máximo de asistentes"
        />
      </div>

      {/* ── Dirección ────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-semibold text-stone-700">Ubicación</h4>
        </div>
        <div className="space-y-1">
          <AddressAutocomplete
            value={formData.address}
            onChange={(val) => onChange('address', val)}
            onSelect={(result) => {
              onChange('address', result.displayName)
              onCoordsChange?.(result.lat, result.lng)
            }}
            onBlur={() => onBlur('address')}
            placeholder="Dirección del evento"
            hasError={!!(touched.address && errors.address)}
          />
          {renderError('address', errors, touched)}
        </div>
      </div>

      {/* ── Imágenes ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Image className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-semibold text-stone-700">Imágenes</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex flex-col items-center justify-center w-20 h-20 bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all group">
            <Image className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
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
