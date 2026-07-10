import type { SocialLinks } from '@domain/entities/SocialLinks';

export interface BasicInfoStepProps {
  formData: Record<string, any>;
  handleInputChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleBlur: (field: string) => void;
  categories: any[];
  socialGroups: any[];
  handleSocialGroupsChange: (ids: string[]) => void;
}

export interface LocationStepProps {
  formData: Record<string, any>;
  handleInputChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleBlur: (field: string) => void;
  handleCoordsChange: (lat: number, lng: number) => void;
  imagePreviews: string[];
  setImagePreviews: (previews: string[]) => void;
  imageFiles: File[];
  setImageFiles: (files: File[]) => void;
  isSubmitting: boolean;
}

export interface ExtraStepProps {
  formData: Record<string, any>;
  handleAmenitiesChange: (amenities: string[]) => void;
  handleDiscountChange: (discount: any) => void;
  handleSocialLinksChange: (links: SocialLinks) => void;
  isValid: boolean;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

export interface StepIndicatorProps {
  step: number;
  totalSteps: number;
}

export interface NavigationButtonsProps {
  step: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  showNext: boolean;
}

export interface SuccessScreenProps {}
