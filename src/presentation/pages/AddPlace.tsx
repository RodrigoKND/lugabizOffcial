import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, Plus, Minus, Send, Camera, ChevronDown, MapPin } from 'lucide-react';
import { usePlaces } from '../context/PlacesContext';
import { useAuth } from '../context/AuthContext';
import { PlaceFormData } from '@/types';
import SocialGroupSelector from '../components/features/SocialGroupSelector';
import { useForm } from '../hooks/useForm';

const AddPlace: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPlace, categories, socialGroups } = usePlaces();
  const { formData, handleChange: handleInputChange, setFormData } = useForm<PlaceFormData>({
    name: '',
    description: '',
    address: '',
    category: '',
    socialGroups: [],
    image: undefined
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirigir si no está autenticado
  if (!user) {
    toast.error('Debe iniciar sesión para publicar un lugar');
    return <Navigate to="/" replace />;
  }

  const handleSocialGroupsChange = (groups: string[]) => {
    setFormData(prev => ({
      ...prev,
      socialGroups: groups
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Límite de 5MB
        toast.error('La imagen no puede superar los 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1500));

    const success = await addPlace(formData);
    if (success) {
      setIsSubmitting(false);
      setIsSuccess(true);

      // Redirigir después del éxito
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setIsSubmitting(false);
      toast.error('Hubo un error al publicar el lugar.');
    }
  };

  const isFormValid = formData.name && formData.description && formData.address && formData.category && formData.socialGroups.length > 0 && formData.image;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFCFD] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120 }}
          className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-md w-full border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-green-500" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-950 mb-3">¡Lugar publicado!</h2>
          <p className="text-gray-600 mb-6 text-lg">Tu recomendación ha sido añadida exitosamente.</p>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="bg-gradient-to-r from-[#9C3FE4] to-[#F1746B] h-full"
            />
          </div>
          <p className="text-md text-gray-500 mt-4 font-medium">Redirigiendo...</p>
        </motion.div>
      </div>
    );
  }

  // Estilos reutilizables para inputs
  const inputClassName = "w-full px-5 py-4 border-none bg-white rounded-xl focus:ring-2 focus:ring-[#9C3FE4] focus:ring-opacity-40 transition-all text-gray-950 placeholder:text-gray-400 text-lg shadow-inner";
  const labelClassName = "block text-base font-semibold text-gray-800 mb-2 mt-2";

  return (
    <section className="min-h-screen bg-[#FDFCFD] text-gray-950 p-4 md:p-8">
      <div className="max-w-[1300px] mx-auto">
        
        {/* Cabecera */}
        <header className="flex flex-col mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-4xl font-black text-gray-950 mb-4 tracking-tighter"
          >
            Publicar un lugar
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-700 text-xl max-w-3xl leading-relaxed"
          >
            Comparte tu descubrimiento con la comunidad. Crea una entrada memorable para los próximos viajeros.
          </motion.p>
        </header>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr,3fr] gap-8">
          
          {/* Columna Izquierda */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#F6F1FA] rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100"
          >
            <form onSubmit={handleSubmit} id="placeForm" className="space-y-8">
              
              {/* Nombre del Lugar */}
              <div className="space-y-3">
                <label htmlFor="name" className={labelClassName}>
                  Nombre del lugar
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={inputClassName}
                  placeholder="Ej. Mirador Escondido del Valle"
                  required
                />
              </div>

              {/* Categoría */}
              <div className="space-y-3 relative">
                <label htmlFor="category" className={labelClassName}>
                  Categoría
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`${inputClassName} appearance-none`}
                  required
                >
                  <option value="" disabled className="text-gray-400">Selecciona una categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 bottom-4 w-6 h-6 text-gray-400 pointer-events-none" />
              </div>

              {/* Relato/Descripción */}
              <div className="space-y-3">
                <label htmlFor="description" className={labelClassName}>
                  Relato/Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  maxLength={150}
                  className={`${inputClassName} resize-none`}
                  placeholder="Cuéntanos qué hace este lugar tan especial..."
                  required
                />
              </div>

              {/* Grupos Sociales */}
              <div className="space-y-3">
                <label className={labelClassName}>
                  Grupos Sociales
                </label>
                <SocialGroupSelector
                  socialGroups={socialGroups}
                  selectedGroups={formData.socialGroups}
                  onChange={handleSocialGroupsChange}
                />
              </div>
              
              {/* Botón enviar (Mobile only) */}
              <div className="md:hidden pt-6">
                <button
                    type="submit"
                    form="placeForm"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full py-5 rounded-2xl font-bold text-white text-xl flex items-center justify-center space-x-3 transition-all duration-300 shadow-md ${isFormValid && !isSubmitting
                    ? 'bg-gradient-to-r from-[#9C3FE4] to-[#F1746B] hover:shadow-lg transform hover:-translate-y-1'
                    : 'bg-gray-300 cursor-not-allowed opacity-70'
                    }`}
                >
                    {isSubmitting ? (
                    <>
                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Publicando...</span>
                    </>
                    ) : (
                    <>
                        <Send className="w-6 h-6" />
                        <span>Publicar lugar</span>
                    </>
                    )}
                </button>
              </div>

            </form>
          </motion.div>
          
          {/* Columna Derecha */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col space-y-10"
          >
            
            {/* Sección Dirección y Mapa */}
            <div className="space-y-3">
              <label htmlFor="address" className={`${labelClassName} mt-0`}>
                Dirección Exacta
              </label>
              <div className="relative">
                <MapPin className="absolute left-5 top-5 w-6 h-6 text-[#9C3FE4]" />
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`${inputClassName} pl-16`}
                  placeholder="Calle, número, ciudad..."
                  required
                />
              </div>
              
              {/* Mock del Mapa */}
              <div className="aspect-[21/9] bg-gray-100 rounded-3xl shadow-inner border border-gray-100 relative overflow-hidden flex items-center justify-center">
                <p className="text-gray-400 font-medium text-lg">Área del Mapa (Próximamente)</p>
                <div className="absolute right-4 bottom-4 flex flex-col space-y-2">
                    <button className="bg-white p-2.5 rounded-xl shadow-md border border-gray-100 text-gray-700 hover:bg-gray-50"><Plus className='w-6 h-6'/></button>
                    <button className="bg-white p-2.5 rounded-xl shadow-md border border-gray-100 text-gray-700 hover:bg-gray-50"><Minus className='w-6 h-6'/></button>
                </div>
              </div>
            </div>

            {/* Sección Subida de Fotos */}
            <div className="space-y-4">
              <label className={`${labelClassName} mt-0`}>
                Sube fotos destacadas
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                
                {/* Botón de subida */}
                <input
                    type="file"
                    accept="image/jpg, image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    required
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="aspect-square bg-[#F8F6FA] border-2 border-dashed border-[#DDD2EB] rounded-3xl flex flex-col items-center justify-center group hover:border-[#9C3FE4] hover:bg-[#F2EBF7] transition-all">
                        {isSubmitting ? (
                            <div className="w-10 h-10 border-4 border-[#9C3FE4] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Camera className="w-10 h-10 text-[#9C3FE4] group-hover:scale-110 transition-transform" />
                                <p className="text-lg font-bold text-[#9C3FE4]">Añadir</p>
                            </>
                        )}
                    </div>
                </label>
                
                {/* Previsualización (Solo 1 imagen permitida ahora) */}
                {imagePreview && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-square rounded-3xl overflow-hidden relative shadow-md"
                  >
                    <img 
                      src={imagePreview} 
                      alt="Vista previa" 
                      className="w-full h-full object-cover" 
                    />
                    <button 
                        onClick={() => { setImagePreview(null); setFormData(prev => ({...prev, image: undefined}))}} 
                        className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg'
                    >
                        <Minus className='w-5 h-5'/>
                    </button>
                  </motion.div>
                )}

              </div>
              <p className="text-base text-gray-500 font-medium">Máximo 1 foto. Formatos JPG, PNG, WEBP. Máx 5MB.</p>
            </div>
            
            {/* Botón enviar (Desktop only) */}
            <div className="hidden md:block pt-10">
              <button
                type="submit"
                form="placeForm"
                disabled={!isFormValid || isSubmitting}
                className={`w-full py-5 rounded-2xl font-bold text-white text-xl flex items-center justify-center space-x-3 transition-all duration-300 shadow-md ${isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-[#9C3FE4] to-[#F1746B] hover:shadow-lg transform hover:-translate-y-1'
                  : 'bg-gray-300 cursor-not-allowed opacity-70'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    <span>Publicar lugar</span>
                  </>
                )}
              </button>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AddPlace;