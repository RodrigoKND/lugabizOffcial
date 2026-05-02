import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, Plus, Minus, Send, ChevronDown, MapPin, ArrowRight, Package, Percent } from 'lucide-react';
import { usePlaces, useAuth } from '@presentation/context';
import { SocialGroupSelector, AmenitySelector} from '@presentation/components/features';
import { CollapsibleSection, DiscountSection, ImageUploader  } from '@presentation/components/reusables';
import { useForm } from '@presentation/hooks';

const AddPlace: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPlace, categories, socialGroups } = usePlaces();
  const { formData, handleChange: handleInputChange, setFormData } = useForm({
    name: '',
    description: '',
    address: '',
    category: '',
    socialGroups: [],
    amenities: [],
    image: undefined
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!user) {
    toast.error('Debe iniciar sesión para publicar un lugar');
    return <Navigate to="/" replace />;
  }

  const handleSocialGroupsChange = (groups: string[]) => {
    setFormData(prev => ({ ...prev, socialGroups: groups }));
  };

  const handleAmenitiesChange = (amenities: string[]) => {
    setFormData(prev => ({ ...prev, amenities }));
  };

  const handleDiscountChange = (discountInfo = 'discountInfo') => {
    setFormData(prev => ({ ...prev, discountInfo }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede superar los 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const success = await addPlace(formData);
    if (success) {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } else {
      setIsSubmitting(false);
      toast.error('Hubo un error al publicar el lugar.');
    }
  };

  const isFormValid = formData.name && formData.description && formData.address && 
                    formData.category && formData.socialGroups.length > 0 && formData.image;

  if (isSuccess) {
    return <SuccessScreen />;
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-white to-[#F8F6FA] text-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Header />
        
        <form onSubmit={handleSubmit} id="placeForm" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BasicInfoSection 
              formData={formData}
              categories={categories}
              socialGroups={socialGroups}
              onInputChange={handleInputChange}
              onSocialGroupsChange={handleSocialGroupsChange}
            />
            
            <div className="space-y-6">
              <LocationSection 
                formData={formData}
                onInputChange={handleInputChange}
              />
              
              <ImageUploader
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
                onRemoveImage={handleRemoveImage}
                isSubmitting={isSubmitting}
              />
              
              <SubmitButton 
                isFormValid={Boolean(isFormValid)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
          
          <OptionalSections
            formData={formData}
            onAmenitiesChange={handleAmenitiesChange}
            onDiscountChange={handleDiscountChange}
          />
        </form>
      </div>
    </section>
  );
};

const Header = () => (
  <motion.header 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-10"
  >
    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
      Publicar un lugar
    </h1>
    <p className="text-gray-600 text-lg md:text-xl max-w-2xl leading-relaxed">
      Comparte tu descubrimiento con la comunidad. Crea una entrada memorable para los viajeros.
    </p>
  </motion.header>
);

const SuccessScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#FDFCFD] via-white to-[#F8F6FA] flex items-center justify-center p-4">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120 }}
      className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full border border-gray-100"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="w-20 h-20 bg-gradient-to-br from-[#9C3FE4] to-[#F1746B] rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <Check className="w-10 h-10 text-white" />
      </motion.div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">¡Lugar publicado!</h2>
      <p className="text-gray-600 mb-6 text-lg">Tu recomendación ha sido añadida exitosamente.</p>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="bg-gradient-to-r from-[#9C3FE4] to-[#F1746B] h-full"
        />
      </div>
      <p className="text-sm text-gray-500 mt-4 font-medium">Redirigiendo...</p>
    </motion.div>
  </div>
);

interface BasicInfoSectionProps {
  formData;
  categories: any[];
  socialGroups: any[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSocialGroupsChange: (groups: string[]) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  categories,
  socialGroups,
  onInputChange,
  onSocialGroupsChange
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl border border-white/50 space-y-6"
  >
    <PlaceNameInput formData={formData} onInputChange={onInputChange} />
    <CategorySelect formData={formData} categories={categories} onInputChange={onInputChange} />
    <DescriptionInput formData={formData} onInputChange={onInputChange} />
    <SocialGroupsSection formData={formData} socialGroups={socialGroups} onChange={onSocialGroupsChange} />
  </motion.div>
);

const PlaceNameInput: React.FC<{ formData; onInputChange: any }> = ({ formData, onInputChange }) => (
  <div className="space-y-2">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre del lugar</label>
    <input
      id="name"
      type="text"
      name="name"
      value={formData.name}
      onChange={onInputChange}
      className="w-full px-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 placeholder:text-gray-400 font-medium text-lg"
      placeholder="Ej. Mirador Escondido del Valle"
      required
    />
  </div>
);

const CategorySelect: React.FC<{ formData; categories: any[]; onInputChange: any }> = ({ formData, categories, onInputChange }) => (
  <div className="space-y-2 relative">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</label>
    <select
      id="category"
      name="category"
      value={formData.category}
      onChange={onInputChange}
      className="w-full px-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 font-medium appearance-none cursor-pointer"
      required
    >
      <option value="" disabled className="text-gray-400">Selecciona una categoría</option>
      {categories.map(category => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-5 bottom-4 w-5 h-5 text-gray-400 pointer-events-none" />
  </div>
);

const DescriptionInput: React.FC<{ formData; onInputChange: any }> = ({ formData, onInputChange }) => (
  <div className="space-y-2">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
      Relato/Descripción
      <span className="text-gray-400 font-normal ml-2">({formData.description.length}/150)</span>
    </label>
    <textarea
      id="description"
      name="description"
      value={formData.description}
      onChange={onInputChange}
      rows={5}
      maxLength={150}
      className="w-full px-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 placeholder:text-gray-400 font-medium resize-none"
      placeholder="Cuéntanos qué hace este lugar tan especial..."
      required
    />
  </div>
);

const SocialGroupsSection: React.FC<{ formData; socialGroups: any[]; onChange: any }> = ({ formData, socialGroups, onChange }) => (
  <div className="space-y-3">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Para quién es ideal?</label>
    <SocialGroupSelector
      socialGroups={socialGroups}
      selectedGroups={formData.socialGroups}
      onChange={onChange}
    />
  </div>
);

interface LocationSectionProps {
  formData;
  onInputChange: any;
}

const LocationSection: React.FC<LocationSectionProps> = ({ formData, onInputChange }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl border border-white/50 space-y-5"
  >
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Dirección</label>
      <div className="relative">
        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9C3FE4]" />
        <input
          id="address"
          type="text"
          name="address"
          value={formData.address}
          onChange={onInputChange}
          className="w-full pl-14 pr-5 py-4 bg-gray-50/80 border-2 border-transparent rounded-2xl focus:border-[#9C3FE4] focus:bg-white focus:ring-0 transition-all duration-300 text-gray-900 placeholder:text-gray-400 font-medium"
          placeholder="Calle, número, ciudad..."
          required
        />
      </div>
    </div>
    
    <div className="aspect-[21/9] bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl border-2 border-dashed border-gray-200 relative overflow-hidden flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-400 font-medium">Área del Mapa</p>
        <p className="text-gray-300 text-sm">Próximamente</p>
      </div>
      <div className="absolute right-4 bottom-4 flex flex-col gap-2">
        <button type="button" className="bg-white p-2 rounded-xl shadow-md border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors">
          <Plus className='w-5 h-5'/>
        </button>
        <button type="button" className="bg-white p-2 rounded-xl shadow-md border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors">
          <Minus className='w-5 h-5'/>
        </button>
      </div>
    </div>
  </motion.div>
);

interface SubmitButtonProps {
  isFormValid: boolean;
  isSubmitting: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isFormValid, isSubmitting }) => (
  <motion.button
    type="submit"
    form="placeForm"
    disabled={!isFormValid || isSubmitting}
    whileHover={{ scale: isFormValid ? 1.02 : 1 }}
    whileTap={{ scale: isFormValid ? 0.98 : 1 }}
    className={`w-full py-5 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
      isFormValid && !isSubmitting
        ? 'bg-gradient-to-r from-[#9C3FE4] to-[#F1746B] hover:shadow-xl'
        : 'bg-gray-300 cursor-not-allowed opacity-70'
    }`}
  >
    {isSubmitting ? (
      <>
        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
        <span>Publicando...</span>
      </>
    ) : (
      <>
        <Send className="w-5 h-5" />
        <span>Publicar lugar</span>
        <ArrowRight className="w-5 h-5" />
      </>
    )}
  </motion.button>
);

interface OptionalSectionsProps {
  formData;
  onAmenitiesChange: (amenities: string[]) => void;
  onDiscountChange: (discountInfo) => void;
}

const OptionalSections: React.FC<OptionalSectionsProps> = ({ formData, onAmenitiesChange, onDiscountChange }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="space-y-4"
  >
    <CollapsibleSection
      title="Caracteristicas"
      icon={<Package className="w-5 h-5" />}
    >
      <AmenitySelector
        selectedTags={formData.amenities}
        onChange={onAmenitiesChange}
      />
    </CollapsibleSection>

    <CollapsibleSection
      title="Descuentos y Beneficios"
      icon={<Percent className="w-5 h-5" />}
    >
      <DiscountSection
        discountInfo={formData.discountInfo || { hasDiscount: false }}
        onChange={onDiscountChange}
      />
    </CollapsibleSection>
  </motion.div>
);


export default AddPlace;