import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Percent, Gift, DollarSign } from 'lucide-react';

interface DiscountInfo {
  hasDiscount: boolean;
  description?: string;
  code?: string;
  percentage?: number;
}

interface DiscountSectionProps {
  discountInfo: DiscountInfo;
  onChange: (info: DiscountInfo) => void;
}

const DiscountSection: React.FC<DiscountSectionProps> = ({ discountInfo, onChange }) => {
  const handleToggle = (enabled: boolean) => {
    onChange({
      ...discountInfo,
      hasDiscount: enabled,
      ...(enabled ? {} : { description: undefined, code: undefined, percentage: undefined }),
    });
  };

  return (
    <div className="space-y-5">
      <motion.label
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="relative">
          <input
            type="checkbox"
            checked={discountInfo.hasDiscount}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-12 h-7 bg-gray-200 rounded-full peer-checked:bg-[#9C3FE4] transition-colors duration-300" />
          <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 peer-checked:translate-x-5" />
        </div>
        <span className="font-semibold text-gray-700 group-hover:text-[#9C3FE4] transition-colors">
          Este lugar ofrece descuentos o beneficios
        </span>
      </motion.label>

      <AnimatePresence>
        {discountInfo.hasDiscount && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={discountInfo.percentage || ''}
                  onChange={(e) => onChange({ ...discountInfo, percentage: Number(e.target.value) })}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#9C3FE4] focus:ring-0 transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                  placeholder="% de descuento"
                />
              </div>
              <div className="relative">
                <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={discountInfo.code || ''}
                  onChange={(e) => onChange({ ...discountInfo, code: e.target.value.toUpperCase() })}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#9C3FE4] focus:ring-0 transition-all text-gray-900 placeholder:text-gray-400 font-medium uppercase"
                  placeholder="Código promocional"
                  maxLength={15}
                />
              </div>
            </div>
            <div className="relative">
              <Tag className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                value={discountInfo.description || ''}
                onChange={(e) => onChange({ ...discountInfo, description: e.target.value })}
                rows={3}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#9C3FE4] focus:ring-0 transition-all text-gray-900 placeholder:text-gray-400 font-medium resize-none"
                placeholder="Describe el beneficio: '2x1 en cervezas', '20% en menú completo', etc."
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscountSection;