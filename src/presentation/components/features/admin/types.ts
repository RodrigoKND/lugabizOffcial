import type {
  AdminStats, AdminAdvancedStats, AdminGrowthDataPoint,
  AdminCategoryStat, AdminSocialGroupStat, AdminBusinessOwner,
  AdminEngagementMetrics,
} from '@domain/entities';

export type Section = 'dashboard' | 'places' | 'events' | 'reviews' | 'users' | 'reports' | 'moderation' | 'verifications' | 'businesses' | 'marketing' | 'system';

export interface DashboardData {
  stats: AdminStats | null;
  advanced: AdminAdvancedStats | null;
  growth: AdminGrowthDataPoint[];
  categories: AdminCategoryStat[];
  socialGroups: AdminSocialGroupStat[];
  owners: AdminBusinessOwner[];
  engagement: AdminEngagementMetrics | null;
}

export type RevokeTarget = { target: 'business_docs' | 'identity'; businessId?: string; ownerId?: string; title: string; message: string };
