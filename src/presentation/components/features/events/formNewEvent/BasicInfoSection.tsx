import React from 'react';
import { ChevronDown, Tag, DollarSign } from 'lucide-react';
import { FormData, ValidationErrors } from './EventFormTypes';

interface Props {
  formData: FormData;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  categories: { id: string; name: string }[];
  onChange: (field: string, value: any) => void;
  onBlur: (field: string) => void;
}

const inputCls = (hasError?: boolean) =>
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

const BasicInfoSection: React.FC<Props> = ({ formData, errors, touched, categories, onChange, onBlur }) => (
  <div className="space-y-5">
    <div className="space-y-1">
      <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Nombre del evento</label>
      <input type="text" value={formData.name}
        onChange={e => onChange('name', e.target.value)}
        onBlur={() => onBlur('name')}
        className={inputCls(!!(touched.name && errors.name))}
        placeholder="Ej: Cata de vinos" />
      {renderError('name', errors, touched)}
    </div>

    <div className="space-y-1">
      <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Descripción</label>
      <textarea value={formData.description}
        onChange={e => onChange('description', e.target.value)}
        onBlur={() => onBlur('description')}
        rows={3}
        className={`${inputCls(!!(touched.description && errors.description))} resize-none`}
        placeholder="Describe tu evento..." />
      {renderError('description', errors, touched)}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Categoría</label>
        <div className="relative">
          <select value={formData.categoryId}
            onChange={e => onChange('categoryId', e.target.value)}
            onBlur={() => onBlur('categoryId')}
            className={`${inputCls(!!(touched.categoryId && errors.categoryId))} appearance-none cursor-pointer`}>
            <option value="">Selecciona una</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
        {renderError('categoryId', errors, touched)}
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Tags</label>
        <div className="relative">
          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input type="text" value={formData.tags}
            onChange={e => onChange('tags', e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-stone-50 border-2 border-transparent hover:border-stone-200 focus:border-amber-400 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-0"
            placeholder="música, arte, cultura" />
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3 p-4 bg-amber-50/50 border border-amber-100/60 rounded-xl">
      <div className="relative">
        <input type="checkbox" id="isFree" checked={formData.isFree}
          onChange={e => onChange('isFree', e.target.checked)}
          className="peer w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400 cursor-pointer" />
        <div className="absolute inset-0 rounded border-2 border-transparent peer-focus:border-amber-400 pointer-events-none" />
      </div>
      <label htmlFor="isFree" className="text-sm font-medium text-stone-700 cursor-pointer select-none flex-1">Evento gratuito</label>
      {!formData.isFree && (
        <div className="flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-stone-400" />
          <input type="number" min={0} value={formData.price || ''}
            onChange={e => onChange('price', Number(e.target.value))}
            className="w-24 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-400 focus:ring-0 text-right"
            placeholder="0" />
          <span className="text-[11px] font-medium text-stone-400">Bs</span>
        </div>
      )}
    </div>
  </div>
);

export default BasicInfoSection;
