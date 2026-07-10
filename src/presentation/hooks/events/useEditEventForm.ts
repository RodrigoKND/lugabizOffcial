import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { eventsService } from '@lib/supabase';
import { useAuth } from '@presentation/context';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import { validateSocialLinks } from '@infrastructure/utils/socialLinks';
import type { Event } from '@domain/entities';
import type { EventFormFields } from '@domain/entities/props/EditEventProps';
import type { PriceOption, CouponEntry, SocialLinks } from '@domain/entities';

const MAX_GALLERY_BYTES = 10 * 1024 * 1024;

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatMB(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1);
}

const INITIAL_FORM: EventFormFields = {
  name: '',
  description: '',
  address: '',
  categoryId: '',
  dateStart: '',
  dateEnd: '',
  timeStart: '',
  timeEnd: '',
  price: 0,
  capacity: 0,
  isFree: false,
  tags: '',
  priceOptions: [] as PriceOption[],
  priceNote: '',
  coupons: [] as CouponEntry[],
  socialLinks: {} as SocialLinks,
};

export function useEditEventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<EventFormFields>(INITIAL_FORM);

  useSEO({ title: 'Editar Evento', description: 'Editar evento en Lugabiz' });

  useEffect(() => {
    if (!id) return;
    eventsService.getEventById(id).then((data) => {
      if (!data) { toast.error('Evento no encontrado'); navigate('/'); return; }
      if (user && data.userId !== user.id) { toast.error('No autorizado'); navigate('/'); return; }
      setEvent(data);
      setForm({
        name: data.name,
        description: data.description,
        address: data.address,
        categoryId: data.categoryId,
        dateStart: toLocalDateStr(data.dateStart instanceof Date ? data.dateStart : new Date(data.dateStart)),
        dateEnd: data.dateEnd ? toLocalDateStr(data.dateEnd instanceof Date ? data.dateEnd : new Date(data.dateEnd)) : '',
        timeStart: data.timeStart,
        timeEnd: data.timeEnd || '',
        price: data.price || 0,
        capacity: data.capacity || 0,
        isFree: data.isFree,
        tags: (data.tags || []).join(', '),
        priceOptions: data.priceOptions || [],
        priceNote: data.priceNote || '',
        coupons: data.coupons || [],
        socialLinks: data.socialLinks || {} as SocialLinks,
      });
      if (data.image) setCoverPreview(data.image);
      if (data.gallery?.length) setGalleryUrls(data.gallery);
    }).catch((err) => {
      console.error('Error loading event:', err);
      toast.error('Error al cargar el evento');
      navigate('/');
    }).finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const clearCover = () => {
    setCoverPreview(null);
    setCoverFile(null);
    if (coverRef.current) coverRef.current.value = '';
  };

  const handleGalleryAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const existingNewSize = galleryFiles.reduce((s, f) => s + f.size, 0);
    const newSize = files.reduce((s, f) => s + f.size, 0);
    if (existingNewSize + newSize > MAX_GALLERY_BYTES) {
      toast.error(`El total supera los 10 MB. Tamaño actual de nuevas imágenes: ${formatMB(existingNewSize)} MB + ${formatMB(newSize)} MB nuevos.`);
      if (galleryRef.current) galleryRef.current.value = '';
      return;
    }
    setGalleryFiles(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const removeExistingGallery = (url: string) => {
    setGalleryUrls(prev => prev.filter(u => u !== url));
  };

  const removeNewGallery = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const socialLinksError = validateSocialLinks(form.socialLinks);
    if (socialLinksError) {
      toast.error(socialLinksError);
      return;
    }
    setSaving(true);
    try {
      let coverUrl = coverPreview && !coverFile ? coverPreview : undefined;
      if (coverFile) {
        coverUrl = await eventsService.uploadCoverImage(coverFile);
      }
      const uploadedGallery: string[] = [];
      for (const file of galleryFiles) {
        const url = await eventsService.uploadCoverImage(file);
        uploadedGallery.push(url);
      }
      const finalGallery = [...galleryUrls, ...uploadedGallery];

      const price = form.priceOptions.length > 0
        ? Math.min(...form.priceOptions.map(o => o.price))
        : form.price;
      const isFree = form.priceOptions.length > 0 ? false : form.isFree;

      await eventsService.updateEvent(id, {
        name: form.name,
        description: form.description,
        address: form.address,
        categoryId: form.categoryId,
        dateStart: form.dateStart,
        dateEnd: form.dateEnd || undefined,
        timeStart: form.timeStart,
        timeEnd: form.timeEnd || undefined,
        price,
        priceOptions: form.priceOptions,
        priceNote: form.priceNote,
        coupons: form.coupons,
        capacity: form.capacity || undefined,
        isFree,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        socialLinks: form.socialLinks,
        image: coverUrl,
        gallery: finalGallery,
      });
      toast.success('Evento actualizado');
      navigate(`/event/${id}`);
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const totalNewMB = useMemo(
    () => galleryFiles.reduce((s, f) => s + f.size, 0) / 1024 / 1024,
    [galleryFiles],
  );

  const formInputClass = 'w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400';

  return {
    id,
    event,
    loading,
    saving,
    form,
    formInputClass,
    coverPreview,
    coverFile,
    coverRef,
    galleryUrls,
    galleryFiles,
    galleryPreviews,
    galleryRef,
    totalNewMB,
    handleCoverChange,
    clearCover,
    handleGalleryAdd,
    removeExistingGallery,
    removeNewGallery,
    handleSubmit,
    setForm,
  };
}
