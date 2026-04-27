import React from 'react';
import { motion } from 'framer-motion';
import { Tag as TagIcon, Wifi, Car, Utensils, Coffee, Dog, Accessibility, Clock, CreditCard, MapPin, Cctv, Waves } from 'lucide-react';

export interface Tag {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const AMENITIES: Tag[] = [
  { id: 'wifi', name: 'WiFi', icon: 'Wifi', color: '#3B82F6' },
  { id: 'parking', name: 'Estacionamiento', icon: 'Car', color: '#10B981' },
  { id: 'food', name: 'Comida', icon: 'Utensils', color: '#F59E0B' },
  { id: 'coffee', name: 'Café', icon: 'Coffee', color: '#8B5CF6' },
  { id: 'pets', name: 'Mascotas', icon: 'Dog', color: '#EC4899' },
  { id: 'accessible', name: 'Accesible', icon: 'Accessibility', color: '#06B6D4' },
  { id: 'hours', name: 'Horario 24h', icon: 'Clock', color: '#6366F1' },
  { id: 'card', name: 'Tarjeta', icon: 'CreditCard', color: '#14B8A6' },
];

interface TagSelectorProps {
  tags?: Tag[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

const AmenitySelector: React.FC<TagSelectorProps> = ({ tags = AMENITIES, selectedTags, onChange }) => {
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(id => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      Wifi, Car, Utensils, Coffee, Dog, Accessibility, Clock, CreditCard, MapPin,
    };
    return icons[iconName] || TagIcon;
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {tags.map((tag, index) => {
        const IconComponent = getIcon(tag.icon);
        const isSelected = selectedTags.includes(tag.id);

        return (
          <motion.button
            key={tag.id}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => toggleTag(tag.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all duration-200 font-medium text-sm
              ${isSelected 
                ? 'border-transparent text-white shadow-lg'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
            style={{ 
              backgroundColor: isSelected ? tag.color : undefined,
              boxShadow: isSelected ? `0 4px 12px ${tag.color}40` : undefined,
            }}
          >
            <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
            <span className="whitespace-nowrap">{tag.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default AmenitySelector;