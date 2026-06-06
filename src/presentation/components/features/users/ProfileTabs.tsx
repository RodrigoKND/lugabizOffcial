import React from 'react';
import { ProfileTab } from '@domain/entities/ProfileTypes';

interface ProfileTabsProps {
  tabs: ProfileTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex gap-4 sm:gap-6 border-b border-primary-100/30 overflow-x-auto scrollbar-hide mb-5">
    {tabs.map(tab => {
      const Icon = tab.icon;
      return (
        <button key={tab.id} onClick={() => onTabChange(tab.id)}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}>
          <Icon className="w-4 h-4" /> {tab.label}
        </button>
      );
    })}
  </div>
);

export default ProfileTabs;
