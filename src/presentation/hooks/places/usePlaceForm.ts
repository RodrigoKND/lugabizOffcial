import { useState, useCallback } from 'react';
import type { PlaceFormData, ValidationErrors } from '../../pages/Places/formAddNewPlace/types';

export function usePlaceForm(setFormData: React.Dispatch<React.SetStateAction<PlaceFormData>>) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState(0);
  const totalSteps = 3;

  const validate = useCallback((formData: PlaceFormData, imageFiles: File[]): boolean => {
    const errs: ValidationErrors = {};
    if (!formData.name?.trim()) errs.name = 'El nombre es obligatorio';
    else if (formData.name.length < 3) errs.name = 'Mínimo 3 caracteres';
    if (!formData.description?.trim()) errs.description = 'La descripción es obligatoria';
    else if (formData.description.length < 10) errs.description = 'Mínimo 10 caracteres';
    if (!formData.category) errs.category = 'Selecciona una categoría';
    if (!formData.socialGroups?.length) errs.socialGroups = 'Selecciona al menos un grupo social';
    if (!formData.address?.trim()) errs.address = 'La dirección es obligatoria';
    if (!imageFiles.length) errs.images = 'Sube al menos una imagen';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, []);

  const isStepValid = useCallback((formData: PlaceFormData, currentStep: number): boolean => {
    switch (currentStep) {
      case 0: return formData.name?.length >= 3 && formData.description?.length >= 10 && formData.category && formData.socialGroups.length > 0;
      case 1: return formData.address?.length > 0;
      case 2: return true;
      default: return false;
    }
  }, []);

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleSocialGroupsChange = useCallback((groups: string[]) => {
    setFormData(prev => ({ ...prev, socialGroups: groups }));
    if (groups.length) setErrors(prev => ({ ...prev, socialGroups: undefined }));
  }, [setFormData]);

  const handleAmenitiesChange = useCallback((amenities: string[]) => {
    setFormData(prev => ({ ...prev, amenities }));
  }, [setFormData]);

  const handleDiscountChange = useCallback((discountInfo: any) => {
    setFormData(prev => ({ ...prev, discountInfo }));
  }, [setFormData]);

  return {
    errors, setErrors, touched, setTouched, step, setStep, totalSteps,
    validate, isStepValid, handleBlur,
    handleSocialGroupsChange, handleAmenitiesChange, handleDiscountChange,
  };
}
