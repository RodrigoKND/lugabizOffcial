export interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ValidationErrors {
  name?: string;
  description?: string;
  categoryId?: string;
  address?: string;
  dateStart?: string;
  timeStart?: string;
  coords?: string;
}

export interface FormData {
  name: string;
  description: string;
  address: string;
  categoryId: string;
  dateStart: string;
  timeStart: string;
  timeEnd: string;
  capacity: number;
  price: number;
  isFree: boolean;
  tags: string;
  coords: number[];
}

export const TOTAL_STEPS = 3;
