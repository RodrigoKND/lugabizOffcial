import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { usePlaces, useAuth } from '@presentation/context';
import { useForm } from '@presentation/hooks';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import { usePlaceForm } from '@presentation/hooks/places/usePlaceForm';
import { usePlaceSubmit } from '@presentation/hooks/places/usePlaceSubmit';
import SuccessScreen from '@presentation/components/features/places/formAddNewPlace/SuccessScreen';
import StepIndicator from '@presentation/components/features/places/formAddNewPlace/StepIndicator';
import BasicInfoStep from '@presentation/components/features/places/formAddNewPlace/BasicInfoStep';
import LocationStep from '@presentation/components/features/places/formAddNewPlace/LocationStep';
import ExtraStep from '@presentation/components/features/places/formAddNewPlace/ExtraStep';
import NavigationButtons from '@presentation/components/features/places/formAddNewPlace/NavigationButtons';

const AddPlace: React.FC = () => {
  const { user } = useAuth();
  const { categories, socialGroups } = usePlaces();
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

  const formUtils = usePlaceForm(setFormData);
  const submitUtils = usePlaceSubmit(formData, setFormData, formUtils.validate);

  if (!user) {
    toast.error('Debe iniciar sesión para publicar un lugar');
    return <Navigate to="/" replace />;
  }

  if (submitUtils.isSuccess) return <SuccessScreen />;

  const handleNext = () => {
    const newTouched = { ...formUtils.touched };
    if (formUtils.step === 0) {
      newTouched.name = true; newTouched.description = true; newTouched.category = true; newTouched.socialGroups = true;
    }
    if (formUtils.step === 1) {
      newTouched.address = true; newTouched.images = true;
    }
    formUtils.setTouched(newTouched);
    if (!formUtils.isStepValid(formData, formUtils.step)) {
      formUtils.validate(formData, submitUtils.imageFiles);
      return;
    }
    formUtils.setStep(s => s + 1);
  };

  return (
    <section className="min-h-screen bg-stone-50 text-stone-800 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-2">Publicar un lugar</h1>
          <p className="text-stone-500 text-sm">Comparte tu descubrimiento con la comunidad</p>
          <StepIndicator step={formUtils.step} totalSteps={formUtils.totalSteps} />
        </motion.header>

        <form onSubmit={submitUtils.handleSubmit} className="space-y-5">
          {formUtils.step === 0 && (
            <BasicInfoStep
              formData={formData}
              handleInputChange={handleInputChange}
              errors={formUtils.errors}
              touched={formUtils.touched}
              handleBlur={formUtils.handleBlur}
              categories={categories}
              socialGroups={socialGroups}
              handleSocialGroupsChange={formUtils.handleSocialGroupsChange}
            />
          )}

          {formUtils.step === 1 && (
            <LocationStep
              formData={formData}
              handleInputChange={handleInputChange}
              errors={formUtils.errors}
              touched={formUtils.touched}
              handleBlur={formUtils.handleBlur}
              handleCoordsChange={submitUtils.handleCoordsChange}
              imagePreviews={submitUtils.imagePreviews}
              setImagePreviews={submitUtils.setImagePreviews}
              imageFiles={submitUtils.imageFiles}
              setImageFiles={submitUtils.setImageFiles}
              isSubmitting={submitUtils.isSubmitting}
            />
          )}

          {formUtils.step === 2 && (
            <ExtraStep
              formData={formData}
              handleAmenitiesChange={formUtils.handleAmenitiesChange}
              handleDiscountChange={formUtils.handleDiscountChange}
              isValid={formUtils.isStepValid(formData, formUtils.step)}
              isSubmitting={submitUtils.isSubmitting}
              handleSubmit={submitUtils.handleSubmit}
            />
          )}

          <NavigationButtons
            step={formUtils.step}
            totalSteps={formUtils.totalSteps}
            onPrev={() => formUtils.setStep(s => Math.max(0, s - 1))}
            onNext={handleNext}
            showNext={formUtils.step < formUtils.totalSteps - 1}
          />
        </form>
      </div>
    </section>
  );
};

export default AddPlace;
