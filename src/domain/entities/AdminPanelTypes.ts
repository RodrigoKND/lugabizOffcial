import { ComponentType } from 'react';

export interface AdminStats {
  users: number;
  places: number;
  events: number;
  reviews: number;
  surveys: number;
  notifications: number;
}

export interface AdminAdvancedStats {
  banned: number;
  owners: number;
  activeOwners: number;
  onlineUsers: number;
  surveysTotal: number;
}

export interface AdminGrowthDataPoint {
  month: string;
  users: number;
  places: number;
  events: number;
}

export interface AdminCategoryStat {
  name: string;
  color: string;
  places: number;
  events: number;
  total: number;
}

export interface AdminSocialGroupStat {
  name: string;
  color: string;
  places: number;
  total: number;
}

export interface AdminBusinessOwner {
  userId: string;
  name: string;
  avatar?: string;
  placesCount: number;
  eventsCount: number;
  lastActivity?: string;
  isActive: boolean;
}

export interface AdminEngagementMetrics {
  avgSessionMinutes: number;
  topAction: string;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
}

export interface StatCardItem {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  color: string;
}
