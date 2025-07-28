import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { usePlaces } from '../context/PlacesContext';
import PlaceCard from '../components/PlaceCard';
import * as Icons from 'lucide-react';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getPlacesByCategory, categories } = usePlaces();
  
  const category = categories.find(cat => cat.id === categoryId);
  const places = getPlacesByCategory(categoryId || '');

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Categoría no encontrada</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<any>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className={`inline-flex items-center justify-center w-20 h-20 ${category.color} rounded-2xl mb-6`}>
            <IconComponent className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{category.description}</p>
          <div className="mt-6 text-gray-500">
            {places.length} {places.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}
          </div>
        </motion.div>

        {places.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className={`inline-flex items-center justify-center w-16 h-16 ${category.color} rounded-xl mb-6 opacity-50`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-medium text-gray-500 mb-2">
              No hay lugares en esta categoría aún
            </h3>
            <p className="text-gray-400 mb-6">
              Sé el primero en compartir un lugar de {category.name.toLowerCase()}
            </p>
            <button
              onClick={() => navigate('/add-place')}
              className="bg-gradient-to-r from-primary-500 to-tomato text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Publicar lugar
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {places.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <PlaceCard 
                  place={place} 
                  onClick={() => navigate(`/place/${place.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;