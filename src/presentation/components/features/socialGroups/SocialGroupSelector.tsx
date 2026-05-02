import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { SocialGroup } from '@domain/entities';

interface SocialGroupSelectorProps {
  socialGroups: SocialGroup[];
  selectedGroups: string[];
  onChange: (groups: string[]) => void;
}

const SocialGroupSelector: React.FC<SocialGroupSelectorProps> = ({ socialGroups, selectedGroups, onChange }) => {
  const toggleGroup = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      onChange(selectedGroups.filter(id => id !== groupId));
    } else {
      onChange([...selectedGroups, groupId]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {socialGroups.map((group, index) => {
        const IconComponent = Icons[group.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
        const isSelected = selectedGroups.includes(group.id);

        return (
          <motion.button
            key={group.id}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => toggleGroup(group.id)}
            className={`
              flex items-center space-x-2 px-5 py-2.5 rounded-full border-none transition-all duration-200
              ${isSelected 
                ? 'bg-[#7C3AED] text-white shadow-md' // Morado de la imagen (puedes usar group.color si prefieres)
                : 'bg-[#EFE9F5] text-gray-600 hover:bg-[#E5DDF0]'
              }
            `}
            style={{ backgroundColor: isSelected ? group.color : undefined }}
          >
            {IconComponent && (
              <IconComponent 
                className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} 
              />
            )}
            <span className="text-sm font-semibold whitespace-nowrap">
              {group.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default SocialGroupSelector;