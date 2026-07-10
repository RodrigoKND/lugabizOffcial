import type { ValidationRule, ValidationResult, AppError } from './errorTypes';
import { ERROR_MESSAGES, createValidationError } from './errorMessages';

export const VALIDATORS = {
  required: (fieldName: string): ValidationRule<string> => ({
    validate: (value: string) => value.trim().length > 0,
    message: ERROR_MESSAGES.AUTH.REQUIRED,
    code: `${fieldName}_REQUIRED`,
  }),

  email: (): ValidationRule<string> => ({
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: ERROR_MESSAGES.AUTH.INVALID_EMAIL,
    code: 'INVALID_EMAIL',
  }),

  password: (): ValidationRule<string> => ({
    validate: (value: string) => value.length >= 6,
    message: ERROR_MESSAGES.AUTH.WEAK_PASSWORD,
    code: 'WEAK_PASSWORD',
  }),

  minLength: (min: number, fieldName: string): ValidationRule<string> => ({
    validate: (value: string) => value.length >= min,
    message: `Debe tener al menos ${min} caracteres`,
    code: `${fieldName}_MIN_LENGTH`,
  }),

  maxLength: (max: number, fieldName: string): ValidationRule<string> => ({
    validate: (value: string) => value.length <= max,
    message: `Debe tener máximo ${max} caracteres`,
    code: `${fieldName}_MAX_LENGTH`,
  }),

  requiredNumber: (fieldName: string): ValidationRule<number | undefined> => ({
    validate: (value: number | undefined) => value !== undefined && value > 0,
    message: `${fieldName} es requerido`,
    code: `${fieldName}_REQUIRED`,
  }),
};

export function validateField<T>(
  value: T,
  rules: ValidationRule<T>[],
  formValues?: Record<string, unknown>,
): AppError | null {
  for (const rule of rules) {
    if (!rule.validate(value, formValues)) {
      return createValidationError(rule.code, rule.message, rule.code.split('_')[0].toLowerCase());
    }
  }
  return null;
}

export function validateForm<T extends Record<string, unknown>>(
  values: T,
  fieldRules: Record<keyof T, ValidationRule<T[keyof T]>[]>,
): ValidationResult {
  const errors: AppError[] = [];

  for (const [field, rules] of Object.entries(fieldRules)) {
    const error = validateField(values[field as keyof T], rules as ValidationRule<unknown>[], values);
    if (error) {
      errors.push(error);
    }
  }

  return { valid: errors.length === 0, errors };
}
