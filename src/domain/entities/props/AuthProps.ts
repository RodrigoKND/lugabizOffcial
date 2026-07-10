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

export interface SocialLoginProps {
  onGoogleLogin: () => void;
}

export interface AuthFormProps {
  formData: FormData;
  error: string;
  isLoading: boolean;
  showPassword: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onTogglePassword: () => void;
  onChange: (field: keyof FormData, value: string) => void;
}

export interface AuthModalHeaderProps {
  mode: AuthMode;
}

export interface BannedAccountModalProps {
  reason: string;
  onDismiss: () => void;
}
