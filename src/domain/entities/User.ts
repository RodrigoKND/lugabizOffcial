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
  createdAt: Date;
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
