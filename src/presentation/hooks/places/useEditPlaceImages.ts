import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@lib/supabase/client';
import { convertHeicIfNeeded } from '@infrastructure/utils/heic';

// Imagen principal + galería del formulario de edición de lugar: subida a
// Storage y estado local, separado de EditPlacePage para que ese componente
// se quede solo con la orquestación del formulario.
export function useEditPlaceImages() {
  const [image, setImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const uploadFile = async (rawFile: File): Promise<string> => {
    // Fotos HEIC/HEIF (cámara de iPhone) no se pueden mostrar en un <img> una
    // vez subidas — se convierten a JPEG acá antes de mandarlas a Storage.
    const file = await convertHeicIfNeeded(rawFile);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `places/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadFile(file);
      setImage(url);
      toast.success('Imagen principal actualizada');
    } catch { toast.error('Error al subir imagen'); }
    setUploadingImage(false);
  };

  const handleGalleryAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        const url = await uploadFile(f);
        urls.push(url);
      }
      setGallery(prev => [...prev, ...urls]);
      toast.success(`${urls.length} foto(s) agregada(s)`);
    } catch { toast.error('Error al subir fotos'); }
    setUploadingGallery(false);
  };

  const removeImage = () => setImage(null);
  const removeGalleryItem = (idx: number) => setGallery(prev => prev.filter((_, i) => i !== idx));

  return {
    image, setImage,
    gallery, setGallery,
    uploadingImage, uploadingGallery,
    handleImageChange, handleGalleryAdd,
    removeImage, removeGalleryItem,
  };
}
