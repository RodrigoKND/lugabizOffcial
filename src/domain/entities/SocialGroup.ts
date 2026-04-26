export interface SocialGroup {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface CreateSocialGroupData {
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface UpdateSocialGroupData {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
}