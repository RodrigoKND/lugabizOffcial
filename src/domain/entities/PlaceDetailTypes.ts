import { Place } from './Place';
import { User } from './User';

export interface PlaceImageSectionProps {
  place: Place;
  user: User | null;
  onEdit: () => void;
  onDeleteClick: () => void;
}

export interface PlaceGalleryProps {
  place: Place;
  galleryIdx: number | null;
  onThumbnailClick: (index: number) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export interface PlaceInfoCardProps {
  place: Place;
  isPlaceSaved: boolean | null;
  user: User | null;
  onShare: () => void;
  onToggleSave: () => void;
}

export interface PlaceLocationCardProps {
  address: string;
  latitude?: number;
  longitude?: number;
}
