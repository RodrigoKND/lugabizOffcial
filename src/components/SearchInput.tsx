import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star } from 'lucide-react';
import { usePlaces } from '../context/PlacesContext';
import { Place } from '../types';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: Place) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onPlaceSelect }) => {
  const { searchPlaces } = usePlaces();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim()) {
      const results = searchPlaces(value).slice(0, 8);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [value, searchPlaces]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (place: Place) => {
    onChange(place.name);
    setIsOpen(false);
    onPlaceSelect(place);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="search"
          placeholder="Buscar lugares..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.trim() && suggestions.length > 0 && setIsOpen(true)}
          className="pl-10 pr-4 py-3 w-full sm:w-80 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
        />
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="py-2">
              {suggestions.map((place, index) => (
                <motion.button
                  key={place.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSuggestionClick(place)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                  <img
                    loading="lazy"
                    src={place.image}
                    alt={place.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{place.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{place.address}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`px-2 py-1 rounded-full text-xs ${place.category.color} text-white`}>
                        {place.category.name}
                      </div>
                      {place.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{place.rating}</span>
                        </div>
                      )}
                      {place.savedCount && place.savedCount > 0 && (
                        <div className="text-xs text-gray-500">
                          {place.savedCount} guardados
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchInput;