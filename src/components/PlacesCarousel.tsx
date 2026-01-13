import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import PlaceCard from '@/components/PlaceCard';
import { useSlide } from '@/hooks/useSlide';
import { Place } from '@/types';

interface PlacesCarouselProps {
  places: Place[];
  onPlaceClick: (place: Place) => void;
  setShowAllPlacesModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const PlacesCarousel: React.FC<PlacesCarouselProps> = ({ places, onPlaceClick, setShowAllPlacesModal }) => {
  const {
    canSlideLeft,
    canSlideRight,
    slideLeft,
    slideRight,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    visibleData,
    totalPages,
    currentPage,
    setStartIndex
  } = useSlide({ data: places, visibleCount: 4 });

  if (places.length === 0) return null;

  return (
    <div className="relative">
      {/* Desktop Navigation */}
      {places.length > 4 && (
        <div className="hidden lg:flex items-center gap-2 absolute -top-14 right-0">
          <button
            onClick={slideLeft}
            disabled={!canSlideLeft}
            className={`p-2 rounded-full shadow-lg transition-all ${canSlideLeft
              ? 'hover:bg-gray-200 text-gray-900'
              : 'opacity-40 cursor-not-allowed text-gray-400'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={slideRight}
            disabled={!canSlideRight}
            className={`p-2 rounded-full shadow-lg transition-all ${canSlideRight
              ? 'hover:bg-gray-200 text-gray-900'
              : 'opacity-40 cursor-not-allowed text-gray-400'
              }`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowAllPlacesModal(true)}
            className="p-2 rounded-full bg-gradient-to-r from-primary-500 to-tomato text-white shadow-lg transition-all hover:scale-105">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Desktop: Grid 4 columnas */}
      <div className="hidden lg:block">
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="grid grid-cols-4 gap-4"
        >
          {visibleData.map((place: Place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <PlaceCard
                place={place}
                onClick={() => onPlaceClick(place)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tablet: Grid 3 columnas */}
      <div className="hidden md:block lg:hidden">
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="grid grid-cols-3 gap-4"
        >
          {visibleData.map((place: Place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <PlaceCard
                place={place}
                onClick={() => onPlaceClick(place)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile: Carrusel horizontal */}
      <div className="md:hidden">
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          {places.map((place: Place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="snap-start flex-shrink-0 w-[70vw] max-w-[280px]"
            >
              <PlaceCard
                place={place}
                onClick={() => onPlaceClick(place)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tablet/Desktop Indicators */}
      {places.length > 4 && (
        <div className="hidden md:flex lg:hidden justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setStartIndex(idx * 4)}
              className={`h-2 rounded-full transition-all ${currentPage === idx ? 'bg-primary-500 w-6' : 'bg-gray-300 w-2'
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacesCarousel;