import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usePlaces, useAuth } from '@presentation/context';
import { storageService } from '@lib/supabase';
import { moderateContent } from '@lib/supabase/services/moderation/moderationService';
import type { PlaceFormData } from '../../pages/Places/formAddNewPlace/types';

export function usePlaceSubmit(
  formData: PlaceFormData,
  setFormData: React.Dispatch<React.SetStateAction<PlaceFormData>>,
  validate: (formData: PlaceFormData, imageFiles: File[]) => boolean,
) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPlace } = usePlaces();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCoordsChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(formData, imageFiles)) return;
    setIsSubmitting(true);
    try {
      const contentToCheck = `${formData.name} ${formData.description}`.trim();
      const modResult = await moderateContent(contentToCheck, 'place', user?.id, user?.name);
      if (!modResult.approved) {
        toast.error(`Contenido no permitido: ${modResult.reason ?? 'Infringe las normas de la comunidad'}`);
        setIsSubmitting(false);
        return;
      }

      const imageUrls = imageFiles.length > 0
        ? await storageService.uploadMultipleFiles(imageFiles, 'places')
        : [];
      const createData = {
        ...formData,
        image: imageUrls[0],
        gallery: imageUrls,
        socialGroupIds: formData.socialGroups,
        authorId: user!.id,
      };
      const success = await addPlace(createData);
      if (success) {
        setIsSuccess(true);
        setTimeout(() => navigate('/'), 2000);
      } else {
        toast.error('Error al publicar el lugar');
      }
    } catch {
      toast.error('Error al subir imágenes');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    imageFiles, setImageFiles,
    imagePreviews, setImagePreviews,
    isSubmitting, isSuccess,
    handleCoordsChange, handleSubmit,
  };
}
