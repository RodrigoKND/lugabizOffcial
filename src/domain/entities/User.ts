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
  // Verificación de confianza (neutra respecto a estatus legal/tributario):
  // identityVerified = hay una persona real detrás (CI + selfie, freno anti-estafa)
  // businessDocsVerified = además presentó documentos de registro (NIT/SEPREC/licencia)
  identityVerified?: boolean;
  businessDocsVerified?: boolean;
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
