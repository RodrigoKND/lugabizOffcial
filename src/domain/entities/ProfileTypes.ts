import { ComponentType } from 'react';

export type TabId = 'saved' | 'events' | 'attending' | 'friends' | 'plans' | 'dashboard' | 'admin';

export interface ProfileTab {
  id: TabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface EditProfileData {
  name: string;
  phone: string;
  bio: string;
  isOwner: boolean;
  ownerBusinessName: string;
  username: string;
}

export interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color?: string;
}
