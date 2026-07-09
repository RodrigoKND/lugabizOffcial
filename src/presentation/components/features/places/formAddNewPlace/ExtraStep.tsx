import React from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, AlertCircle, Share2 } from 'lucide-react';
import { AmenitySelector } from '@presentation/components/features';
import { CollapsibleSection, DiscountSection, SocialLinksSection } from '@presentation/components/reusables';
import type { SocialLinks } from '@domain/entities';

interface ExtraStepProps {
  formData: { amenities: string[]; discountInfo: any; socialLinks: SocialLinks };
  handleAmenitiesChange: (amenities: string[]) => void;
  handleDiscountChange: (discountInfo: any) => void;
  handleSocialLinksChange: (socialLinks: SocialLinks) => void;
  isValid: boolean;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

const ExtraStep: React.FC<ExtraStepProps> = ({
  formData, handleAmenitiesChange, handleDiscountChange, handleSocialLinksChange,
  isValid, isSubmitting, handleSubmit,
}) => (
  <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
    <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-5">
      <CollapsibleSection title="Características" icon={<AlertCircle className="w-4 h-4" />}>
        <AmenitySelector selectedTags={formData.amenities} onChange={handleAmenitiesChange} />
      </CollapsibleSection>
      <CollapsibleSection title="Descuentos y Beneficios">
        <DiscountSection discountInfo={formData.discountInfo || { hasDiscount: false }} onChange={handleDiscountChange} />
      </CollapsibleSection>
      <CollapsibleSection title="Redes sociales" icon={<Share2 className="w-4 h-4" />}>
        <SocialLinksSection value={formData.socialLinks || {}} onChange={handleSocialLinksChange} />
      </CollapsibleSection>
    </div>

    <button
      type="submit" disabled={!isValid || isSubmitting}
      className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm ${
        isValid && !isSubmitting
          ? 'bg-primary-500 text-white hover:bg-primary-600'
          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
      }`}
    >
      {isSubmitting ? (
        <><Loader2 className="w-5 h-5 animate-spin" /> Publicando...</>
      ) : (
        <><Send className="w-5 h-5" /> Publicar Lugar</>
      )}
    </button>
  </motion.div>
);

export default ExtraStep;
