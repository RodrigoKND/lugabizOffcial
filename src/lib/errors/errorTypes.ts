export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AppError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  field?: string;
  details?: Record<string, string>;
}

export type ValidationRule<T = unknown> = {
  validate: (value: T, formValues?: Record<string, unknown>) => boolean;
  message: string;
  code: string;
};

export interface ValidationResult {
  valid: boolean;
  errors: AppError[];
}

export type ErrorRecord = Record<string, AppError>;
