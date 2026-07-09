import React, { useState } from 'react';
import { Instagram, Music2, Facebook, Globe } from 'lucide-react';
import type { SocialLinks } from '@domain/entities';
import {
  validateInstagramUrl, validateTikTokUrl, validateFacebookUrl, validateWebsiteUrl,
} from '@infrastructure/utils/socialLinks';

interface SocialLinksSectionProps {
  value: SocialLinks;
  onChange: (value: SocialLinks) => void;
}

type Field = keyof SocialLinks;

const FIELDS: { field: Field; label: string; placeholder: string; icon: React.ReactNode; validate: (v: string) => { valid: boolean; error?: string } }[] = [
  { field: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/tu_cuenta', icon: <Instagram className="w-4 h-4" />, validate: validateInstagramUrl },
  { field: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@tu_cuenta o link de un video', icon: <Music2 className="w-4 h-4" />, validate: validateTikTokUrl },
  { field: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/tu_pagina', icon: <Facebook className="w-4 h-4" />, validate: validateFacebookUrl },
  { field: 'website', label: 'Página web', placeholder: 'https://tu-sitio.com', icon: <Globe className="w-4 h-4" />, validate: validateWebsiteUrl },
];

const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({ value, onChange }) => {
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const handleBlur = (field: Field) => {
    const raw = value[field] || '';
    const result = FIELDS.find(f => f.field === field)!.validate(raw);
    setErrors(prev => ({ ...prev, [field]: result.valid ? undefined : result.error }));
  };

  return (
    <div className="space-y-3">
      {FIELDS.map(({ field, label, placeholder, icon }) => (
        <div key={field} className="space-y-1">
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">{label}</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">{icon}</span>
            <input
              type="text"
              value={value[field] || ''}
              onChange={e => onChange({ ...value, [field]: e.target.value })}
              onBlur={() => handleBlur(field)}
              className={`w-full pl-10 pr-4 py-3 bg-stone-50 border-2 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-0 ${
                errors[field] ? 'border-red-300 focus:border-red-400' : 'border-transparent focus:border-primary-400 hover:border-stone-200'
              }`}
              placeholder={placeholder}
            />
          </div>
          {errors[field] && (
            <p className="flex items-center gap-1.5 text-[11px] text-red-500 mt-1.5 ml-0.5">
              <span className="w-3.5 h-3.5 inline-flex items-center justify-center rounded-full bg-red-100 text-red-500 text-[8px] font-bold">!</span>
              {errors[field]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default SocialLinksSection;
