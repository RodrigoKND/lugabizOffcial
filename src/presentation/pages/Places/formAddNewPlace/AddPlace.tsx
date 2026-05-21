import React, { useState, lazy, Suspense } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, Send, ChevronDown, MapPin, ArrowRight, Locate, Loader2, AlertCircle } from 'lucide-react';
import { usePlaces, useAuth } from '@presentation/context';
import { SocialGroupSelector, AmenitySelector } from '@presentation/components/features';
import { CollapsibleSection, DiscountSection, ImageUploader } from '@presentation/components/reusables';
import { useForm } from '@presentation/hooks';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import { storageService } from '@lib/supabase';

const MapPicker = lazy(() => import('@presentation/components/features/events/formNewEvent/MapPicker'));

interface ValidationErrors {
  name?: string;
  description?: string;
  category?: string;
  socialGroups?: string;
  address?: string;
  images?: string;
}

const AddPlace: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPlace, categories, socialGroups } = usePlaces();
  const { formData, handleChange: handleInputChange, setFormData } = useForm({
    name: '',
    description: '',
    address: '',
    category: '',
    socialGroups: [] as string[],
    amenities: [] as string[],
    discountInfo: undefined as any,
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  useSEO({ title: 'Publicar Lugar', description: 'Comparte un lugar con la comunidad de Lugabiz' });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const totalSteps = 3;

  const handleCoordsChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  if (!user) {
    toast.error('Debe iniciar sesión para publicar un lugar');
    return <Navigate to="/" replace />;
  }

  const validate = (): boolean => {
    const errs: ValidationErrors = {};

    if (!formData.name?.trim()) errs.name = 'El nombre es obligatorio';
    else if (formData.name.length < 3) errs.name = 'Mínimo 3 caracteres';

    if (!formData.description?.trim()) errs.description = 'La descripción es obligatoria';
    else if (formData.description.length < 10) errs.description = 'Mínimo 10 caracteres';

    if (!formData.category) errs.category = 'Selecciona una categoría';

    if (!formData.socialGroups?.length) errs.socialGroups = 'Selecciona al menos un grupo social';

    if (!formData.address?.trim()) errs.address = 'La dirección es obligatoria';

    if (!imageFiles.length) errs.images = 'Sube al menos una imagen';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSocialGroupsChange = (groups: string[]) => {
    setFormData(prev => ({ ...prev, socialGroups: groups }));
    if (groups.length) setErrors(prev => ({ ...prev, socialGroups: undefined }));
  };

  const handleAmenitiesChange = (amenities: string[]) => {
    setFormData(prev => ({ ...prev, amenities }));
  };

  const handleDiscountChange = (discountInfo: any) => {
    setFormData(prev => ({ ...prev, discountInfo }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const imageUrls = imageFiles.length > 0
        ? await storageService.uploadMultipleFiles(imageFiles, 'places')
        : [];

      const createData = {
        ...formData,
        image: imageUrls[0],
        gallery: imageUrls,
        socialGroupIds: formData.socialGroups,
        authorId: user.id,
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

  const isStepValid = () => {
    switch (step) {
      case 0: return formData.name?.length >= 3 && formData.description?.length >= 10 && formData.category && formData.socialGroups.length > 0;
      case 1: return formData.address?.length > 0;
      case 2: return true;
      default: return false;
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-sm border border-stone-200">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">¡Lugar publicado!</h2>
          <p className="text-stone-500 text-sm mb-5">Tu recomendación ha sido añadida exitosamente.</p>
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }}
              transition={{ duration: 2 }} className="bg-green-500 h-full" />
          </div>
          <p className="text-xs text-stone-400 mt-3 font-medium">Redirigiendo...</p>
        </motion.div>
      </div>
    );
  }

  const renderError = (field: string) => {
    if (!touched[field] || !errors[field as keyof ValidationErrors]) return null;
    return (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
        <AlertCircle className="w-3 h-3" /> {errors[field as keyof ValidationErrors]}
      </p>
    );
  };

  return (
    <section className="min-h-screen bg-stone-50 text-stone-800 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-2">Publicar un lugar</h1>
          <p className="text-stone-500 text-sm">Comparte tu descubrimiento con la comunidad</p>
          <div className="flex gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-amber-500' : 'bg-stone-200'}`} />
            ))}
          </div>
        </motion.header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 0 && (
            <motion.div key="s0" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-5">
                <h2 className="text-base font-bold text-stone-800">Información básica</h2>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-500 uppercase">Nombre del lugar</label>
                  <input type="text" name="name" value={formData.name}
                    onChange={handleInputChange} onBlur={() => handleBlur('name')}
                    className={`w-full px-4 py-3.5 bg-stone-50 border rounded-xl focus:ring-0 transition-all text-sm outline-none ${
                      touched.name && errors.name ? 'border-red-300 focus:border-red-400' : 'border-stone-200 focus:border-amber-400'
                    }`}
                    placeholder="Ej. Café de la Esquina" />
                  {renderError('name')}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-500 uppercase">Categoría</label>
                  <div className="relative">
                    <select name="category" value={formData.category}
                      onChange={handleInputChange} onBlur={() => handleBlur('category')}
                      className={`w-full px-4 py-3.5 bg-stone-50 border rounded-xl focus:ring-0 text-sm appearance-none cursor-pointer outline-none ${
                        touched.category && errors.category ? 'border-red-300' : 'border-stone-200 focus:border-amber-400'
                      }`}>
                      <option value="">Selecciona una categoría</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                  {renderError('category')}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-500 uppercase">Descripción</label>
                  <textarea name="description" value={formData.description}
                    onChange={handleInputChange} onBlur={() => handleBlur('description')}
                    rows={4} maxLength={500}
                    className={`w-full px-4 py-3.5 bg-stone-50 border rounded-xl focus:ring-0 text-sm resize-none outline-none ${
                      touched.description && errors.description ? 'border-red-300 focus:border-red-400' : 'border-stone-200 focus:border-amber-400'
                    }`}
                    placeholder="¿Qué hace especial este lugar?" />
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>{renderError('description')}</span>
                    <span>{formData.description.length}/500</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-500 uppercase">¿Para quién es ideal?</label>
                  <SocialGroupSelector socialGroups={socialGroups} selectedGroups={formData.socialGroups} onChange={handleSocialGroupsChange} />
                  {renderError('socialGroups')}
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-5">
              <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-5">
                <h2 className="text-base font-bold text-stone-800">Ubicación</h2>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-500 uppercase">Dirección</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                    <input type="text" name="address" value={formData.address}
                      onChange={handleInputChange} onBlur={() => handleBlur('address')}
                      className={`w-full pl-11 pr-4 py-3.5 bg-stone-50 border rounded-xl focus:ring-0 text-sm outline-none ${
                        touched.address && errors.address ? 'border-red-300' : 'border-stone-200 focus:border-amber-400'
                      }`}
                      placeholder="Calle, número, ciudad..." />
                  </div>
                  {renderError('address')}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-500 uppercase">Selecciona en el mapa</label>
                  <Suspense fallback={
                    <div className="aspect-video bg-stone-100 rounded-xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                    </div>
                  }>
                    <MapPicker
                      initialCoords={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : []}
                      onCoordsChange={handleCoordsChange}
                    />
                  </Suspense>
                  {formData.latitude && formData.longitude && (
                    <div className="flex items-center gap-2 text-xs text-stone-500 bg-amber-50 px-3 py-2 rounded-xl">
                      <Locate className="w-3.5 h-3.5 text-amber-500" />
                      <span>{formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</span>
                    </div>
                  )}
                </div>
              </div>

              <ImageUploader
                images={imagePreviews} onImagesChange={setImagePreviews}
                files={imageFiles} onFilesChange={setImageFiles}
                isSubmitting={isSubmitting} maxFiles={5} maxTotalMB={10}
              />
              {renderError('images')}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-5">
              <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-5">
                <CollapsibleSection title="Características" icon={<AlertCircle className="w-4 h-4" />}>
                  <AmenitySelector selectedTags={formData.amenities} onChange={handleAmenitiesChange} />
                </CollapsibleSection>
                <CollapsibleSection title="Descuentos y Beneficios">
                  <DiscountSection discountInfo={formData.discountInfo || { hasDiscount: false }} onChange={handleDiscountChange} />
                </CollapsibleSection>
              </div>

              <button type="submit" disabled={!isStepValid() || isSubmitting}
                className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isStepValid() && !isSubmitting
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}>
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Publicando...</>
                ) : (
                  <><Send className="w-5 h-5" /> Publicar Lugar</>
                )}
              </button>
            </motion.div>
          )}

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setStep(s => Math.max(0, s - 1))}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${step === 0 ? 'invisible' : 'text-stone-600 hover:bg-stone-100'}`}>
              Anterior
            </button>
            {step < totalSteps - 1 && (
              <button type="button" onClick={() => {
                const newTouched = { ...touched };
                if (step === 0) { newTouched.name = true; newTouched.description = true; newTouched.category = true; newTouched.socialGroups = true; }
                if (step === 1) { newTouched.address = true; newTouched.images = true; }
                setTouched(newTouched);
                if (!isStepValid()) { validate(); return; }
                setStep(s => s + 1);
              }}
                className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-medium text-sm hover:bg-amber-600 transition-all">
                Siguiente
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};

export default AddPlace;
