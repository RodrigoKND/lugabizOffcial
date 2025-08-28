import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Users as UsersIcon } from 'lucide-react';
import { Place } from '../types';
import * as Icons from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onClick: () => void;
  className?: string;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onClick, className='' }) => {
  const primarySocialGroup = place.socialGroups[0];
  const SocialGroupIcon = Icons[primarySocialGroup.icon as keyof typeof Icons] as React.ComponentType<{className?: string}>;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group h-[420px] ${className}`}
      onClick={onClick}
    >
      <div className="relative">
        <img
          loading="lazy"
          src={place?.image}
          alt={place?.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium text-white`} style={{ backgroundColor: place.category.color }}>
            {place.category.name}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium text-white flex items-center space-x-1`}
            style={{ backgroundColor: primarySocialGroup.color }}>
            <SocialGroupIcon className="w-3 h-3" />
            <span>{primarySocialGroup.name}</span>
            {place.socialGroups.length > 1 && (
              <span className="bg-white/20 px-1 rounded">+{place.socialGroups.length - 1}</span>
            )}
          </div>
        </div>
        {place.featured && (
          <div className="absolute top-4 left-4">
            <div className="bg-tomato text-white px-3 py-1 rounded-full text-xs font-medium">
              Destacado
            </div>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col justify-between h-[calc(420px-192px)]">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {place.name}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {place.description}
        </p>

        <div className="flex items-center space-x-1 text-gray-500 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{place.address}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{place?.rating}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <UsersIcon className="w-4 h-4" />
              <span className="text-sm">{place?.reviewCount}</span>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            {place.createdAt.toLocaleDateString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlaceCard;