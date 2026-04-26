import { SocialGroup, CreateSocialGroupData, UpdateSocialGroupData } from '../entities';

export interface ISocialGroupRepository {
  getSocialGroups(): Promise<SocialGroup[]>;
  getSocialGroupById(id: string): Promise<SocialGroup | null>;
  createSocialGroup(socialGroup: CreateSocialGroupData): Promise<SocialGroup>;
  updateSocialGroup(id: string, updates: UpdateSocialGroupData): Promise<SocialGroup>;
  deleteSocialGroup(id: string): Promise<void>;
}