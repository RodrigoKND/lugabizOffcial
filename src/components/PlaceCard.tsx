import React from 'react';
import { Star } from 'lucide-react';
import { Place } from '../types';
import * as Icons from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onClick: () => void;
  className?: string;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onClick, className = '' }) => {
  const primarySocialGroup = place.socialGroups[0];
  const SocialGroupIcon = Icons[primarySocialGroup.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  return (
    <article
      className={`bg-white flex-shrink-0 relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group ${className}`}
      onClick={onClick}
    >
      <header>
        <img
          loading="lazy"
          src={place?.image}
          alt={place?.name}
          className="object-cover hover:scale-125 transition duration-200 cursor-pointer w-full h-48 rounded-md"
        />
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
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

      </header>

      <footer className="absolute bottom-0 p-4 w-full bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex justify-between w-full items-center">
          <div className="flex flex-col">
            <h4 className="font-bold text-white text-xl">
              {place.name}
            </h4>
            <p className={`text-sm text-purple-200`}>
              {
                place.category.name
              }
            </p>
          </div>
          <p className='flex items-center gap-2 text-white'>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {place.rating}
          </p>
        </div>
      </footer>
    </article>
  );
};

export default PlaceCard;