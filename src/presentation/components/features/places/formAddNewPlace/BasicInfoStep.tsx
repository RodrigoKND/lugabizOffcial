import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateDescription } from '@lib/supabase/services/description/descriptionGenerator';
import { SocialGroupSelector } from '@presentation/components/features';
import FieldError from '@presentation/components/features/places/formAddNewPlace/FieldError';
import type { PlaceFormData, ValidationErrors } from '@presentation/pages/Places/formAddNewPlace/types';
import { SocialGroup } from '@domain/entities';

interface BasicInfoStepProps {
  formData: PlaceFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  handleBlur: (field: string) => void;
  categories: { id: string; name: string }[];
  socialGroups: SocialGroup[];
  handleSocialGroupsChange: (groups: string[]) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData, handleInputChange, errors, touched, handleBlur,
  categories, socialGroups, handleSocialGroupsChange,
}) => {
  const [genLoading, setGenLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const handleGenerate = async () => {
    if (!formData.name.trim()) {
      toast.error('Escribe el nombre primero')
      return
    }
    setGenLoading(true)
    const catName = categories.find(c => c.id === formData.category)?.name ?? ''
    const result = await generateDescription(formData.name, catName, 'place')
    setGenLoading(false)
    if (result.description) {
      handleInputChange({ target: { name: 'description', value: result.description } } as any)
      setCooldown(10)
      const timer = setInterval(() => setCooldown(prev => { if (prev <= 1) { clearInterval(timer); return 0 }; return prev - 1 }), 1000)
    } else {
      toast.error(result.error ?? 'No se pudo generar')
    }
  }

  return (
  <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-5">
      <h2 className="text-base font-bold text-stone-800">Información básica</h2>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-500 uppercase">Nombre del lugar</label>
        <input
          type="text" name="name" value={formData.name}
          onChange={handleInputChange} onBlur={() => handleBlur('name')}
          className={`w-full px-4 py-3.5 bg-stone-50 border rounded-xl focus:ring-0 transition-all text-sm outline-none ${
            touched.name && errors.name ? 'border-red-300 focus:border-red-400' : 'border-stone-200 focus:border-amber-400'
          }`}
          placeholder="Ej. Café de la Esquina"
        />
        <FieldError message={touched.name ? errors.name : null} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-500 uppercase">Categoría</label>
        <div className="relative">
          <select
            name="category" value={formData.category}
            onChange={handleInputChange} onBlur={() => handleBlur('category')}
            className={`w-full px-4 py-3.5 bg-stone-50 border rounded-xl focus:ring-0 text-sm appearance-none cursor-pointer outline-none ${
              touched.category && errors.category ? 'border-red-300' : 'border-stone-200 focus:border-amber-400'
            }`}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
        <FieldError message={touched.category ? errors.category : null} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-500 uppercase">Descripción</label>
        <textarea
          name="description" value={formData.description}
          onChange={handleInputChange} onBlur={() => handleBlur('description')}
          rows={4} maxLength={500}
          className={`w-full px-4 py-3.5 bg-stone-50 border rounded-xl focus:ring-0 text-sm resize-none outline-none ${
            touched.description && errors.description ? 'border-red-300 focus:border-red-400' : 'border-stone-200 focus:border-amber-400'
          }`}
          placeholder="¿Qué hace especial este lugar?"
        />
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <FieldError message={touched.description ? errors.description : null} />
            <button type="button" disabled={genLoading || cooldown > 0}
              onClick={handleGenerate}
              className="font-medium text-amber-600 hover:text-amber-700 disabled:text-stone-300 disabled:cursor-not-allowed transition-colors"
            >
              {genLoading ? (
                <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Generando...</span>
              ) : cooldown > 0 ? (
                `Espera ${cooldown}s`
              ) : (
                'Sugerir descripcion'
              )}
            </button>
          </div>
          <span className="text-stone-400">{formData.description.length}/500</span>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-500 uppercase">¿Para quién es ideal?</label>
        <SocialGroupSelector socialGroups={socialGroups} selectedGroups={formData.socialGroups} onChange={handleSocialGroupsChange} />
        <FieldError message={touched.socialGroups ? errors.socialGroups : null} />
      </div>
    </div>
  </motion.div>
  )
}

export default BasicInfoStep;
