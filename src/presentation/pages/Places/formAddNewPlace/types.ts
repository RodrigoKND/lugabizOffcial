export interface PlaceFormData {
  name: string;
  description: string;
  address: string;
  category: string;
  socialGroups: string[];
  amenities: string[];
  discountInfo: any;
  latitude: number | undefined;
  longitude: number | undefined;
}

export interface ValidationErrors {
  name?: string;
  description?: string;
  category?: string;
  socialGroups?: string;
  address?: string;
  images?: string;
}
