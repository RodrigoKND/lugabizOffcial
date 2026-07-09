import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Plus, X, Ticket } from 'lucide-react';
import type { PriceOption, CouponEntry } from '@domain/entities';

interface EventPricingSectionProps {
  isFree: boolean;
  price: number;
  priceOptions: PriceOption[];
  priceNote: string;
  coupons: CouponEntry[];
  onChange: (field: 'isFree' | 'price' | 'priceOptions' | 'priceNote' | 'coupons', value: any) => void;
}

const MAX_ROWS = 10;

const inputCls = 'w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-primary-400 focus:ring-0';

const EventPricingSection: React.FC<EventPricingSectionProps> = ({
  isFree, price, priceOptions, priceNote, coupons, onChange,
}) => {
  const [advancedOpen, setAdvancedOpen] = useState(priceOptions.length > 0 || coupons.length > 0 || !!priceNote);

  const updateOption = (index: number, patch: Partial<PriceOption>) => {
    onChange('priceOptions', priceOptions.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  };
  const addOption = () => {
    if (priceOptions.length >= MAX_ROWS) return;
    onChange('priceOptions', [...priceOptions, { label: '', price: 0 }]);
  };
  const removeOption = (index: number) => {
    onChange('priceOptions', priceOptions.filter((_, i) => i !== index));
  };

  const updateCoupon = (index: number, patch: Partial<CouponEntry>) => {
    onChange('coupons', coupons.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };
  const addCoupon = () => {
    if (coupons.length >= MAX_ROWS) return;
    onChange('coupons', [...coupons, { code: '', description: '' }]);
  };
  const removeCoupon = (index: number) => {
    onChange('coupons', coupons.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-primary-50/50 border border-primary-100/60 rounded-xl">
        <div className="relative">
          <input type="checkbox" id="isFree" checked={isFree}
            onChange={e => onChange('isFree', e.target.checked)}
            className="peer w-4 h-4 rounded border-stone-300 text-primary-500 focus:ring-primary-400 cursor-pointer" />
          <div className="absolute inset-0 rounded border-2 border-transparent peer-focus:border-primary-400 pointer-events-none" />
        </div>
        <label htmlFor="isFree" className="text-sm font-medium text-stone-700 cursor-pointer select-none flex-1">Evento gratuito</label>
        {!isFree && priceOptions.length === 0 && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-stone-400" />
            <input type="number" min={0} value={price || ''}
              onChange={e => onChange('price', Number(e.target.value))}
              className="w-24 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-primary-400 focus:ring-0 text-right"
              placeholder="0" />
            <span className="text-[11px] font-medium text-stone-400">Bs</span>
          </div>
        )}
        {!isFree && priceOptions.length > 0 && (
          <span className="text-sm font-semibold text-primary-600">
            Desde Bs. {Math.min(...priceOptions.map(o => o.price || 0))}
          </span>
        )}
      </div>

      {!isFree && (
        <div>
          <button type="button" onClick={() => setAdvancedOpen(v => !v)}
            className="text-[12px] font-medium text-primary-600 hover:text-primary-700 transition-colors">
            {advancedOpen ? '− Ocultar opciones de precio y cupones' : '+ Agregar varias opciones de precio'}
          </button>

          <AnimatePresence>
            {advancedOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-4 p-4 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Opciones de precio</label>
                    {priceOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="text" value={opt.label} placeholder="Ej: Plato mixto"
                          onChange={e => updateOption(i, { label: e.target.value })}
                          className={`${inputCls} flex-1`} />
                        <input type="number" min={0} value={opt.price || ''} placeholder="Bs"
                          onChange={e => updateOption(i, { price: Number(e.target.value) })}
                          className={`${inputCls} w-20 text-right`} />
                        <span className="text-[11px] text-stone-400">a</span>
                        <input type="number" min={0} value={opt.priceMax || ''} placeholder="hasta"
                          onChange={e => updateOption(i, { priceMax: e.target.value ? Number(e.target.value) : undefined })}
                          className={`${inputCls} w-20 text-right`} />
                        <button type="button" onClick={() => removeOption(i)}
                          className="p-1.5 text-stone-400 hover:text-red-500 transition-colors shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {priceOptions.length < MAX_ROWS && (
                      <button type="button" onClick={addOption}
                        className="flex items-center gap-1 text-[12px] font-medium text-primary-600 hover:text-primary-700">
                        <Plus className="w-3.5 h-3.5" /> Agregar opción
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Nota / condiciones (opcional)</label>
                    <textarea value={priceNote} rows={2}
                      onChange={e => onChange('priceNote', e.target.value)}
                      className={`${inputCls} resize-none`}
                      placeholder="Ej: Antes de las 12am, cóctel gratis. Apto para cumpleaños 2x1." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5" /> Cupones (visibles solo mientras el evento está en curso)
                    </label>
                    {coupons.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="text" value={c.code} placeholder="CÓDIGO"
                          onChange={e => updateCoupon(i, { code: e.target.value.toUpperCase() })}
                          maxLength={20}
                          className={`${inputCls} w-32 uppercase`} />
                        <input type="text" value={c.description} placeholder="Ej: 20% de descuento"
                          onChange={e => updateCoupon(i, { description: e.target.value })}
                          className={`${inputCls} flex-1`} />
                        <button type="button" onClick={() => removeCoupon(i)}
                          className="p-1.5 text-stone-400 hover:text-red-500 transition-colors shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {coupons.length < MAX_ROWS && (
                      <button type="button" onClick={addCoupon}
                        className="flex items-center gap-1 text-[12px] font-medium text-primary-600 hover:text-primary-700">
                        <Plus className="w-3.5 h-3.5" /> Agregar cupón
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default EventPricingSection;
