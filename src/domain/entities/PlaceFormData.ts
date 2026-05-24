export interface PlaceFormData {
  name: string;
  description: string;
  address: string;
  category: string;
  socialGroups: string[];
  amenities: string[];
  image?: string;
  gallery?: string[];
  latitude?: number;
  longitude?: number;
  discountInfo?: {
    hasDiscount: boolean;
    description?: string;
    code?: string;
    percentage?: number;
  };
}
