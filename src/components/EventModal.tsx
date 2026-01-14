import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, Bookmark, MapPin, Clock, Send, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  startDate: Date;
  endDate: Date;
  availableDays: string[];
  availableHours: { start: string; end: string };
  category: string;
  organizer: {
    name: string;
    avatar: string;
    isNew: boolean;
  };
  likes: number;
  comments: number;
}

interface EventModalProps {
  event: Event;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const mockComments = [
  { id: 1, user: 'Ana López', avatar: 'https://i.pravatar.cc/150?img=10', text: '¡Se ve increíble! 😍', likes: 12 },
  { id: 2, user: 'Carlos Ruiz', avatar: 'https://i.pravatar.cc/150?img=11', text: 'Ya tengo mis boletos 🎉', likes: 8 },
  { id: 3, user: 'María García', avatar: 'https://i.pravatar.cc/150?img=12', text: '¿A qué hora empieza?', likes: 3 },
  { id: 4, user: 'Pedro Sánchez', avatar: 'https://i.pravatar.cc/150?img=13', text: 'Nos vemos ahí!', likes: 5 }
];

const CountdownTimer = ({ endDate }: { endDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;
      if (distance < 0) return;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex gap-1.5">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-[38px] text-center">
        <div className="text-base font-bold text-white">{timeLeft.days}</div>
        <div className="text-[9px] text-white/80 font-medium">días</div>
      </div>
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-[38px] text-center">
        <div className="text-base font-bold text-white">{timeLeft.hours}</div>
        <div className="text-[9px] text-white/80 font-medium">hrs</div>
      </div>
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-[38px] text-center">
        <div className="text-base font-bold text-white">{timeLeft.minutes}</div>
        <div className="text-[9px] text-white/80 font-medium">min</div>
      </div>
    </div>
  );
};

const EventModal: React.FC<EventModalProps> = ({ event, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Swipe detection
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0 && hasNext) {
        // Swipe left → next event
        onNext();
      } else if (swipeDistance < 0 && hasPrev) {
        // Swipe right → previous event
        onPrev();
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full md:max-w-md md:h-[90vh] mx-auto"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrows - Desktop only */}
        {hasPrev && (
          <button
            onClick={onPrev}
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-all z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        {hasNext && (
          <button
            onClick={onNext}
            className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-all z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Main Content */}
        <div className="relative w-full h-full md:rounded-3xl overflow-hidden md:shadow-2xl">
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${event.imageUrl})`, filter: 'brightness(0.6)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-sm p-2 rounded-full hover:bg-black/60 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Page indicator - Mobile only */}
          <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-0.5 rounded-full transition-all ${idx === 0 ? 'bg-white w-6' : 'bg-white/40 w-6'
                  }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-between p-5 md:p-6">
            {/* Top Section */}
            <div className="flex items-start justify-between mt-8 md:mt-0">
              <div className="flex items-center gap-3">
                <div className={`p-0.5 rounded-full ${event.organizer.isNew ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500' : 'bg-gray-400'}`}>
                  <div className="p-0.5 bg-black rounded-full">
                    <img
                      src={event.organizer.avatar}
                      alt={event.organizer.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{event.organizer.name}</p>
                  <p className="text-white/70 text-xs">{event.category}</p>
                </div>
              </div>
              <button className="text-white/90 hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Info */}
            <div className="space-y-3 pb-safe">
              {/* Countdown */}
              <div>
                <p className="text-white/80 text-xs mb-2 font-medium">Comienza en:</p>
                <CountdownTimer endDate={event.startDate} />
              </div>

              {/* Sección de Título y Descripción */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white leading-tight">
                  {event.title}
                </h3>

                <div className="relative">
                  <p className={`text-white/90 text-sm transition-all duration-300 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                    {event.description}
                  </p>

                  <div className="flex gap-2 mt-1">
                    {!isExpanded && event.description.length > 100 && (
                      <button
                        onClick={() => setIsExpanded(true)}
                        className="text-primary-400 text-xs font-bold hover:underline"
                      >
                        ver más
                      </button>
                    )}

                    <Link
                      to={`/event/${event.id}`}
                      className="text-white/60 text-xs font-medium hover:text-white flex items-center gap-0.5 transition-colors"
                    >
                      Ver Más
                    </Link>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 space-y-2 border border-white/10 mt-2">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="w-4 h-4 text-tomato flex-shrink-0" />
                  <span className="text-xs font-medium truncate">{event.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="w-4 h-4 text-primary-400 flex-shrink-0" />
                    <span className="text-xs">{event.availableHours.start} - {event.availableHours.end}</span>
                  </div>

                  {/* Badge de Categoría opcional aquí si quieres ahorrar espacio arriba */}
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60 uppercase tracking-wider">
                    {event.category}
                  </span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-primary-500 to-tomato text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95">
                Asistiré
              </button>
            </div>
          </div>

          {/* Side Actions */}
          <div className="absolute right-3 bottom-32 md:bottom-36 flex flex-col gap-3.5">
            <button
              onClick={() => setLiked(!liked)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`p-2.5 rounded-full backdrop-blur-sm transition-all ${liked ? 'bg-tomato' : 'bg-white/20'}`}>
                <Heart className={`w-6 h-6 ${liked ? 'text-white fill-white' : 'text-white'}`} />
              </div>
              <span className="text-white text-xs font-bold">{liked ? event.likes + 1 : event.likes}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`p-2.5 rounded-full backdrop-blur-sm transition-all ${showComments ? 'bg-primary-500' : 'bg-white/20'}`}>
                <MessageCircle className={`w-6 h-6 ${showComments ? 'text-white fill-white' : 'text-white'}`} />
              </div>
              <span className="text-white text-xs font-bold">{event.comments}</span>
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`p-2.5 rounded-full backdrop-blur-sm transition-all ${saved ? 'bg-primary-500' : 'bg-white/20'}`}>
                <Bookmark className={`w-6 h-6 ${saved ? 'text-white fill-white' : 'text-white'}`} />
              </div>
            </button>

            <button className="flex flex-col items-center gap-1">
              <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm">
                <Share2 className="w-6 h-6 text-white" />
              </div>
            </button>
          </div>
        </div>

        {/* Comments Panel */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white md:rounded-t-3xl max-h-[60vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center py-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{event.comments} comentarios</h3>
                <button onClick={() => setShowComments(false)}>
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {mockComments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <img src={c.avatar} alt={c.user} className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{c.user}</p>
                      <p className="text-sm text-gray-700 mt-0.5">{c.text}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <button className="hover:text-gray-700">Responder</button>
                        <span>{c.likes} me gusta</span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-tomato">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t bg-white safe-bottom">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Añade un comentario..."
                    className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    disabled={!comment.trim()}
                    className={`p-2 rounded-full transition-all ${comment.trim()
                      ? 'bg-gradient-to-r from-primary-500 to-tomato text-white'
                      : 'bg-gray-200 text-gray-400'
                      }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EventModal;