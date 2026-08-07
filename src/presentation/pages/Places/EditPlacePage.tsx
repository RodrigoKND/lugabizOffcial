import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { placesService } from '@lib/supabase';
import { useAuth, usePlaces } from '@presentation/context';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import { useForm, useEditPlaceImages } from '@presentation/hooks';
import { SocialLinksSection } from '@presentation/components/reusables';
import { SocialGroupSelector } from '@presentation/components/features';
import EditPlaceFields from '@presentation/components/features/places/formEditPlace/EditPlaceFields';
import EditPlaceImagesSection from '@presentation/components/features/places/formEditPlace/EditPlaceImagesSection';
import { validateSocialLinks } from '@infrastructure/utils/socialLinks';
import type { SocialLinks } from '@domain/entities';

const EditPlacePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, socialGroups } = usePlaces();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { formData, handleChange, setFormData } = useForm({
    name: '', description: '', address: '', categoryId: '',
    latitude: 0, longitude: 0,
  });
  const images = useEditPlaceImages();
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [socialGroupIds, setSocialGroupIds] = useState<string[]>([]);

  useSEO({ title: 'Editar Lugar', description: 'Editar lugar en Lugabiz' });

  useEffect(() => {
    if (!id) return;
    placesService.getPlaceById(id).then((data) => {
      if (!data) { toast.error('Lugar no encontrado'); navigate('/'); return; }
      if (user && data.authorId !== user.id) { toast.error('No autorizado'); navigate('/'); return; }
      setFormData({
        name: data.name,
        description: data.description,
        address: data.address,
        categoryId: data.category?.id || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      });
      images.setImage(data.image || null);
      images.setGallery(data.gallery || []);
      setSocialLinks(data.socialLinks || {});
      setSocialGroupIds(data.socialGroups.map((g) => g.id));
      setLoading(false);
    }).catch((err) => {
      console.error('Error loading place:', err);
      toast.error('Error al cargar el lugar');
      navigate('/');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const socialLinksError = validateSocialLinks(socialLinks);
    if (socialLinksError) {
      toast.error(socialLinksError);
      return;
    }
    setSaving(true);
    try {
      await placesService.updatePlace(id, {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        categoryId: formData.categoryId,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        image: images.image || undefined,
        gallery: images.gallery.length > 0 ? images.gallery : undefined,
        socialLinks,
        socialGroupIds,
      });
      toast.success('Lugar actualizado');
      navigate(`/place/${id}`);
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  return (
    <section className="min-h-screen bg-stone-50 text-stone-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link to={`/place/${id}`} className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" /> Volver al lugar
        </Link>
        <h1 className="text-2xl font-bold mb-6">Editar Lugar</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
          <EditPlaceFields formData={formData} handleChange={handleChange} categories={categories} />

          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase block mb-2">¿Para quién es ideal?</label>
            <SocialGroupSelector socialGroups={socialGroups} selectedGroups={socialGroupIds} onChange={setSocialGroupIds} />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase block mb-2">Redes sociales (opcional)</label>
            <SocialLinksSection value={socialLinks} onChange={setSocialLinks} />
          </div>

          <EditPlaceImagesSection
            image={images.image}
            gallery={images.gallery}
            uploadingImage={images.uploadingImage}
            uploadingGallery={images.uploadingGallery}
            onImageChange={images.handleImageChange}
            onGalleryAdd={images.handleGalleryAdd}
            onRemoveImage={images.removeImage}
            onRemoveGalleryItem={images.removeGalleryItem}
          />

          <button type="submit" disabled={saving}
            className="w-full py-3.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditPlacePage;
