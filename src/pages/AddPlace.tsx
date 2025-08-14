import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, MapPin, Type, FileText, Tag, Check, Users } from 'lucide-react';
import { usePlaces } from '../context/PlacesContext';
import { useAuth } from '../context/AuthContext';
import { PlaceFormData } from '../types';
import SocialGroupSelector from '../components/SocialGroupSelector';
import toast from 'react-hot-toast';

const AddPlace: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPlace, categories, socialGroups } = usePlaces();
  
  const [formData, setFormData] = useState<PlaceFormData>({
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

  // Redirect if not authenticated
  if (!user) {
    toast.error('Debe iniciar sesión para publicar un lugar');
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialGroupsChange = (groups: string[]) => {
    setFormData(prev => ({
      ...prev,
      socialGroups: groups
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = await addPlace(formData);
    if (success) {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setIsSubmitting(false);
      // Handle error
    }
  };

  const isFormValid = formData.name && formData.description && formData.address && formData.category && formData.socialGroups.length > 0 && formData.image;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="w-8 h-8 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Lugar publicado!</h2>
          <p className="text-gray-600 mb-4">Tu recomendación ha sido añadida exitosamente.</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="bg-gradient-to-r from-primary-500 to-tomato h-2 rounded-full"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Redirigiendo...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            to={'/'}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary-500 to-tomato p-6">
            <h1 className="text-3xl font-bold text-white mb-2">Publicar un lugar</h1>
            <p className="text-white/90">Comparte tu lugar favorito con la comunidad</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                <Type className="w-5 h-5" />
                <span>Nombre del lugar</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="Ej: Café Luna"
                required
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                <FileText className="w-5 h-5" />
                <span>Descripción</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                maxLength={150}
                style={{fieldSizing:"content"}}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none"
                placeholder="Describe qué hace especial a este lugar..."
                required
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                <Tag className="w-5 h-5" />
                <span>Categoría</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                <Users className="w-5 h-5" />
                <span>Grupos sociales ideales</span>
              </label>
              <p className="text-gray-600 text-sm mb-4">Selecciona uno o más grupos para los que este lugar es ideal</p>
              <SocialGroupSelector
                socialGroups={socialGroups}
                selectedGroups={formData.socialGroups}
                onChange={handleSocialGroupsChange}
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                <MapPin className="w-5 h-5" />
                <span>Dirección</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="Ej: Calle de los Artistas, 42, Madrid"
                required
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                <Upload className="w-5 h-5" />
                <span>Imagen</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  accept="image/jpg, image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl mx-auto"
                      />
                      <p className="text-sm text-gray-500">Haz clic para cambiar</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-gray-500">Haz clic para subir una imagen</p>
                      <p className="text-sm text-gray-400">PNG, JPG, WEBP hasta 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-3 rounded-xl font-medium text-white transition-all duration-300 ${
                isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-primary-500 to-tomato hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publicando...</span>
                </div>
              ) : (
                'Publicar lugar'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddPlace;