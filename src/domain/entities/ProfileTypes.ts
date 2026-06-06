import { ComponentType } from 'react';

export interface ProfileTab {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface EditProfileData {
  name: string;
  phone: string;
  bio: string;
  isOwner: boolean;
  ownerBusinessName: string;
}

export interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color?: string;
}
