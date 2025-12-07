import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { usePlaces } from '../context/PlacesContext';
import PlaceCard from './PlaceCard';
import { useNavigate } from 'react-router-dom';

interface AllPlacesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AllPlacesModal: React.FC<AllPlacesModalProps> = ({ isOpen, onClose }) => {
  const { places, searchPlaces } = usePlaces();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlaces = searchTerm.trim() 
    ? searchPlaces(searchTerm)
    : places;

  const handlePlaceClick = (placeId: string) => {
    onClose();
    navigate(`/place/${placeId}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          <header className="bg-gradient-to-r from-primary-500 to-tomato p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Todos los lugares</h2>
            <p className="text-white/90">Explora nuestra colección completa de {filteredPlaces.length} lugares</p>
          </header>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por lugares, categorías o grupo social..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaces.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 mb-2">No se encontraron lugares</h3>
                  <p className="text-gray-400">Intenta con otros términos de búsqueda</p>
                </div>
              ) : (
                filteredPlaces.map((place, index) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <PlaceCard 
                      place={place} 
                      onClick={() => handlePlaceClick(place.id)}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AllPlacesModal;