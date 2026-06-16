import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { usePlaces, useAuth } from '@presentation/context';
import { storageService } from '@lib/supabase';
import { moderateContent } from '@lib/supabase/services/moderation/moderationService';
import { FormData, ValidationErrors } from './EventFormTypes';

const initialState: FormData = {
  name: '',
  description: '',
  address: '',
  categoryId: '',
  dateStart: '',
  timeStart: '',
  timeEnd: '',
  capacity: 0,
  price: 0,
  isFree: true,
  tags: '',
  coords: [],
};

export function useEventForm(onClose: () => void) {
  const { user } = useAuth();
  const { categories, addEvent } = usePlaces();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialState);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validation = storageService.validateMultipleFiles(files, 5, 10);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCoordsChange = useCallback((lat: number, lng: number) => {
    handleChange('coords', [lat, lng]);
  }, []);

  const validate = (): boolean => {
    const errs: ValidationErrors = {};

    if (!formData.name?.trim()) errs.name = 'El nombre es obligatorio';
    else if (formData.name.length < 3) errs.name = 'Mínimo 3 caracteres';
    if (!formData.description?.trim()) errs.description = 'La descripción es obligatoria';
    else if (formData.description.length < 10) errs.description = 'Mínimo 10 caracteres';
    if (!formData.categoryId) errs.categoryId = 'Selecciona una categoría';
    if (!formData.dateStart) errs.dateStart = 'Selecciona una fecha';
    if (!formData.timeStart) errs.timeStart = 'Selecciona una hora';
    if (!formData.address?.trim()) errs.address = 'La dirección es obligatoria';
    if (formData.coords.length !== 2) errs.coords = 'Selecciona una ubicación en el mapa';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Corrige los errores antes de continuar');
      return;
    }
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setIsSubmitting(true);
    try {
      const contentToCheck = `${formData.name} ${formData.description}`.trim();
      const modResult = await moderateContent(contentToCheck, 'event', user.id, user.name);
      if (!modResult.approved) {
        toast.error(`Contenido no permitido: ${modResult.reason ?? 'Infringe las normas de la comunidad'}`);
        setIsSubmitting(false);
        return;
      }

      let imageUrl: string | undefined;
      let gallery: string[] = [];
      if (imageFiles.length > 0) {
        const urls = await storageService.uploadMultipleFiles(imageFiles, 'events');
        const imgModResult = await moderateContent('', 'event', user.id, user.name, urls);
        if (!imgModResult.approved) {
          storageService.deleteImagesByUrls(urls).catch(() => {});
          toast.error(`Imagen no permitida: ${imgModResult.reason ?? 'Infringe las normas'}`);
          setIsSubmitting(false);
          return;
        }
        imageUrl = urls[0];
        gallery = urls;
      }

      const eventData = {
        ...formData,
        image: imageUrl,
        gallery,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        userId: user.id,
      };

      const event = await addEvent(eventData);
      if (event) {
        toast.success('Evento creado con éxito!');
        onClose();
      } else {
        toast.error('Error al crear el evento');
      }
    } catch {
      toast.error('Error al crear el evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 0: return formData.name.length >= 3 && formData.description.length >= 10 && formData.categoryId;
      case 1: return formData.dateStart && formData.timeStart;
      case 2: return formData.coords.length === 2;
      case 3: return true;
      default: return true;
    }
  };

  const goNext = () => {
    if (step === 0) { setTouched(t => ({ ...t, name: true, description: true, categoryId: true })); }
    if (step === 1) { setTouched(t => ({ ...t, dateStart: true, timeStart: true, address: true })); }
    if (!isStepValid()) { validate(); return; }
    setStep(s => s + 1);
  };

  const goBack = () => setStep(s => Math.max(0, s - 1));

  return {
    step, formData, imageFiles, imagePreviews, isSubmitting, errors, touched, categories, user,
    handleChange, handleBlur, handleImage, removeImage, handleCoordsChange,
    handleSubmit, isStepValid, goNext, goBack,
  };
}
