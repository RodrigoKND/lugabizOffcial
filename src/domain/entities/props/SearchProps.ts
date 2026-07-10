import type { LegacyRef } from 'react';
import type { Category } from '@domain/entities/Category';
import type { SocialGroup } from '@domain/entities/SocialGroup';
import type { Place } from '@domain/entities/Place';

export interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  inputRef: LegacyRef<HTMLInputElement> | undefined;
}

export interface FilterChipsProps {
  categories: Category[];
  socialGroups: SocialGroup[];
  selectedCategory: string | null;
  selectedSocialGroup: string | null;
  onCategoryClick: (id: string) => void;
  onSocialGroupClick: (id: string) => void;
}

export interface SearchResultsProps {
  query: string;
  results: Place[];
  selectedCategory: string | null;
  selectedSocialGroup: string | null;
  onSelect: (place: Place) => void;
}

export interface SearchResultItemProps {
  place: Place;
  onSelect: (place: Place) => void;
}
