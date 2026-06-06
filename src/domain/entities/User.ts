export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  isOwner?: boolean;
  ownerBusinessName?: string;
  role?: 'admin' | 'owner' | 'user';
  banned?: boolean;
  banReason?: string;
  createdAt: Date;
  // Onboarding state (persisted in DB)
  onboardingStep?: string;
  notifDismissed?: boolean;
  geoDismissed?: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  avatar?: string;
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  isOwner?: boolean;
  ownerBusinessName?: string;
}
