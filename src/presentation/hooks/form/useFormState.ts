import { useState, useCallback } from 'react';

type ValidationErrors<T> = Partial<Record<keyof T, string>>;
type TouchedFields<T> = Partial<Record<keyof T, boolean>>;

interface UseFormStateOptions<T> {
  initialValues: T;
  validate?: (values: T) => ValidationErrors<T>;
}

interface FormState<T> {
  values: T;
  errors: ValidationErrors<T>;
  touched: TouchedFields<T>;
  isSubmitting: boolean;
  isValid: boolean;
}

export function useFormState<T extends Record<string, unknown>>({ initialValues, validate }: UseFormStateOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setState(prev => {
      const newValues = { ...prev.values, [field]: value };
      const newErrors = validate ? validate(newValues) : prev.errors;
      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        touched: { ...prev.touched, [field]: true },
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, [validate]);

  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => {
      const newValues = { ...prev.values, ...values };
      const newErrors = validate ? validate(newValues) : prev.errors;
      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, [validate]);

  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false,
    }));
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    });
  }, [initialValues]);

  const touchAll = useCallback(() => {
    setState(prev => {
      const allTouched = Object.keys(prev.values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as TouchedFields<T>);
      return { ...prev, touched: allTouched };
    });
  }, []);

  const runValidation = useCallback(() => {
    setState(prev => {
      const newErrors = validate ? validate(prev.values) : {};
      return { ...prev, errors: newErrors, isValid: Object.keys(newErrors).length === 0 };
    });
  }, [validate]);

  return {
    ...state,
    setFieldValue,
    setValues,
    setFieldError,
    setSubmitting,
    reset,
    touchAll,
    runValidation,
  };
}
