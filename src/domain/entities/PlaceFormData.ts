export interface PlaceFormData {
  name: string;
  description: string;
  address: string;
  category: string;
  socialGroups: string[];
  amenities: string[];
  image?: File;
  discountInfo?: {
    hasDiscount: boolean;
    description?: string;
    code?: string;
    percentage?: number;
  };
}