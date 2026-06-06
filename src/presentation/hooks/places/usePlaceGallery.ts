import { useState } from 'react';

export function usePlaceGallery() {
  const [galleryIdx, setGalleryIdx] = useState<number | null>(null);

  const openGallery = (index: number) => setGalleryIdx(index);
  const closeGallery = () => setGalleryIdx(null);
  const prevImage = () => setGalleryIdx(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
  const nextImage = () => setGalleryIdx(prev => (prev !== null ? prev + 1 : prev));

  return { galleryIdx, openGallery, closeGallery, prevImage, nextImage };
}
