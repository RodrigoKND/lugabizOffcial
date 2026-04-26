import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, ExternalLink, Phone, Globe } from 'lucide-react';
import type { OverpassElement } from '@/types';

interface PlaceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: OverpassElement | null;
}

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ isOpen, onClose, place }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!place) return null;

  const lat = place.lat;
  const lon = place.lon;
  const name = place.tags?.name || 'Sin nombre';
  const category = place.tags?.category || place.tags?.amenity || 'lugar';
  const address = place.tags?.['addr:street'] ? 
    `${place.tags['addr:housenumber'] || ''} ${place.tags['addr:street']}`.trim() : 
    place.tags?.address || 'Dirección no disponible';
  const description = place.tags?.description || place.tags?.['addr:city'] || '';
  const website = place.tags?.website || place.tags?.url;
  const phone = place.tags?.phone;
  const openingHours = place.tags?.opening_hours;
  const price = place.tags?.price;

  const handleExternalLink = () => {
    if (lat && lon) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white md:rounded-3xl w-full md:max-w-lg md:max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 md:h-56 bg-gradient-to-br from-purple-400 to-orange-400">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium uppercase tracking-wider mb-2">
                  {category}
                </span>
                <h2 className="text-2xl font-bold text-white line-clamp-2">{name}</h2>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-14rem)]">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{address}</span>
              </div>

              {openingHours && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Star className="w-4 h-4 flex-shrink-0 text-yellow-500" />
                  <span className="text-sm">{openingHours}</span>
                </div>
              )}

              {description && (
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              )}

              {price && (
                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  {price}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={handleExternalLink}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-tomato text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Cómo Llegar
                </button>

                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Llamar
                  </a>
                )}

                {website && (
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Web
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlaceDetailModal;