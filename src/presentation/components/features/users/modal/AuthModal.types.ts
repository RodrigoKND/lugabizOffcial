export type AuthMode = 'login' | 'register';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export interface FormData {
  name: string;
  email: string;
  password: string;
}
