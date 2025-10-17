import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { SocialGroup } from '../types';

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
    <article className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      {socialGroups.map((group, index) => {
        const IconComponent = Icons[group.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
        const isSelected = selectedGroups.includes(group.id);

        return (
          <motion.button
            key={group.id}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => toggleGroup(group.id)}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${isSelected
                ? `border-transparent text-white shadow-lg scale-105`
                : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
              }`}
            style={{ backgroundColor: isSelected ? group.color : "#f4f3f3ff" }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center`}
                style={{ backgroundColor: isSelected ? "white" : group.color }}>
                <IconComponent className={`w-5 h-5 ${isSelected ? 'text-gray-600' : 'text-white'}`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  {group.name}
                </h3>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-gray-900" />
                </motion.div>
              )}
            </div>
            <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
              {group.description}
            </p>
          </motion.button>
        );
      })}
    </article>
  );
};

export default SocialGroupSelector;