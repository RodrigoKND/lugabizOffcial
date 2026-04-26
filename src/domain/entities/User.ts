export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
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
}