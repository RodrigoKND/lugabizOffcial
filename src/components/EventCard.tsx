import React from 'react';
import { MapPin, Heart, MessageCircle, Calendar } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  startDate: Date;
  category: string;
  organizer: { 
    name: string; 
    avatar: string;
    isNew: boolean;
  };
  likes: number;
  comments: number;
}

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const daysUntil = Math.ceil((event.startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div 
      onClick={onClick}
      className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg cursor-pointer group transition-transform hover:scale-[1.02]"
    >
      {/* Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${event.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      {/* Organizer Avatar with Instagram-style ring */}
      <div className="absolute top-3 left-3 z-10">
        <div className={`p-0.5 rounded-full ${event.organizer.isNew ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500' : 'bg-gray-400'}`}>
          <div className="p-0.5 bg-white rounded-full">
            <img 
              src={event.organizer.avatar} 
              alt={event.organizer.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Category Badge */}
      <div className="absolute top-3 right-3 bg-gradient-to-r from-primary-500 to-tomato px-3 py-1 rounded-full shadow-lg">
        <span className="text-white text-xs font-semibold">{event.category}</span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
        {/* Days Until */}
        {daysUntil > 0 && (
          <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <Calendar className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-xs font-bold text-gray-900">
              {daysUntil === 1 ? 'Mañana' : `En ${daysUntil} días`}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">
          {event.title}
        </h3>
        
        {/* Location */}
        <div className="flex items-center gap-1.5 text-white/90">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs font-medium truncate">{event.location}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-white/90 text-xs">
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            <span className="font-semibold">{event.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="font-semibold">{event.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;