import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import EventCard from './EventCard';
import EventModal from './EventModal';
import { useSlide } from '@/hooks/useSlide';

export const mockEvents = [
  {
    id: '1',
    title: 'Festival de Comida Local 🍔',
    description: 'Descubre los mejores sabores de nuestra región con food trucks, chefs locales y música en vivo.',
    location: 'Plaza Central',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    startDate: new Date('2026-01-20'),
    endDate: new Date('2026-01-22'),
    availableDays: ['Lun', 'Mar', 'Mié'],
    availableHours: { start: '18:00', end: '23:00' },
    category: 'Gastronomía',
    organizer: { name: 'Municipalidad', avatar: 'https://i.pravatar.cc/150?img=1', isNew: true },
    likes: 1543,
    comments: 89
  },
  {
    id: '2',
    title: 'Noche de Jazz en Vivo 🎷',
    description: 'Una velada inolvidable con las mejores bandas de jazz de la ciudad.',
    location: 'Teatro Municipal',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-01-15'),
    availableDays: ['Vie'],
    availableHours: { start: '20:00', end: '23:30' },
    category: 'Música',
    organizer: { name: 'Centro Cultural', avatar: 'https://i.pravatar.cc/150?img=2', isNew: false },
    likes: 892,
    comments: 45
  },
  {
    id: '3',
    title: 'Feria de Artesanías 🎨',
    description: 'Encuentra piezas únicas hechas a mano por artesanos locales.',
    location: 'Parque del Arte',
    imageUrl: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800',
    startDate: new Date('2026-01-18'),
    endDate: new Date('2026-01-25'),
    availableDays: ['Sáb', 'Dom'],
    availableHours: { start: '10:00', end: '19:00' },
    category: 'Arte',
    organizer: { name: 'Colectivo Artesanal', avatar: 'https://i.pravatar.cc/150?img=3', isNew: true },
    likes: 2341,
    comments: 156
  },
  {
    id: '4',
    title: 'Mercado Nocturno ✨',
    description: 'Compras, comida y entretenimiento bajo las estrellas.',
    location: 'Paseo Comercial',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800',
    startDate: new Date('2026-01-14'),
    endDate: new Date('2026-01-28'),
    availableDays: ['Vie', 'Sáb'],
    availableHours: { start: '19:00', end: '01:00' },
    category: 'Mercado',
    organizer: { name: 'Comerciantes Unidos', avatar: 'https://i.pravatar.cc/150?img=4', isNew: false },
    likes: 1876,
    comments: 203
  },
  {
    id: '5',
    title: 'Yoga al Amanecer 🧘',
    description: 'Sesión de yoga gratuita con vista al mar.',
    location: 'Playa Norte',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    startDate: new Date('2026-01-16'),
    endDate: new Date('2026-01-30'),
    availableDays: ['Sáb', 'Dom'],
    availableHours: { start: '06:00', end: '07:30' },
    category: 'Bienestar',
    organizer: { name: 'Yoga Center', avatar: 'https://i.pravatar.cc/150?img=5', isNew: true },
    likes: 756,
    comments: 34
  },
  {
    id: '6',
    title: 'Cine bajo las Estrellas 🎬',
    description: 'Películas clásicas proyectadas al aire libre.',
    location: 'Plaza Mayor',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    startDate: new Date('2026-01-17'),
    endDate: new Date('2026-01-24'),
    availableDays: ['Jue', 'Vie'],
    availableHours: { start: '21:00', end: '23:30' },
    category: 'Cine',
    organizer: { name: 'Cinéfilos Unidos', avatar: 'https://i.pravatar.cc/150?img=6', isNew: false },
    likes: 1234,
    comments: 67
  },
  {
    id: '7',
    title: 'Festival de Comida Local 🍔',
    description: 'Descubre los mejores sabores de nuestra región con food trucks, chefs locales y música en vivo.',
    location: 'Plaza Central',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    startDate: new Date('2026-01-20'),
    endDate: new Date('2026-01-22'),
    availableDays: ['Lun', 'Mar', 'Mié'],
    availableHours: { start: '18:00', end: '23:00' },
    category: 'Gastronomía',
    organizer: { name: 'Municipalidad', avatar: 'https://i.pravatar.cc/150?img=1', isNew: true },
    likes: 1543,
    comments: 89
  },
  {
    id: '8',
    title: 'Noche de Jazz en Vivo 🎷',
    description: 'Una velada inolvidable con las mejores bandas de jazz de la ciudad.',
    location: 'Teatro Municipal',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-01-15'),
    availableDays: ['Vie'],
    availableHours: { start: '20:00', end: '23:30' },
    category: 'Música',
    organizer: { name: 'Centro Cultural', avatar: 'https://i.pravatar.cc/150?img=2', isNew: false },
    likes: 892,
    comments: 45
  },
  {
    id: '9',
    title: 'Feria de Artesanías 🎨',
    description: 'Encuentra piezas únicas hechas a mano por artesanos locales.',
    location: 'Parque del Arte',
    imageUrl: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800',
    startDate: new Date('2026-01-18'),
    endDate: new Date('2026-01-25'),
    availableDays: ['Sáb', 'Dom'],
    availableHours: { start: '10:00', end: '19:00' },
    category: 'Arte',
    organizer: { name: 'Colectivo Artesanal', avatar: 'https://i.pravatar.cc/150?img=3', isNew: true },
    likes: 2341,
    comments: 156
  },
  {
    id: '10',
    title: 'Mercado Nocturno ✨',
    description: 'Compras, comida y entretenimiento bajo las estrellas.',
    location: 'Paseo Comercial',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800',
    startDate: new Date('2026-01-14'),
    endDate: new Date('2026-01-28'),
    availableDays: ['Vie', 'Sáb'],
    availableHours: { start: '19:00', end: '01:00' },
    category: 'Mercado',
    organizer: { name: 'Comerciantes Unidos', avatar: 'https://i.pravatar.cc/150?img=4', isNew: false },
    likes: 1876,
    comments: 203
  }, 
];

const EventsSection = ({
  selectedEventIndex,
  setSelectedEventIndex,
}: {
  selectedEventIndex: number | null;
  setSelectedEventIndex: React.Dispatch<React.SetStateAction<number | null>>;
}) => {
  const [showAllEvents, setShowAllEvents] = useState(false);
  
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
  } = useSlide({ data: mockEvents, visibleCount: 4 });

  const displayedEvents = showAllEvents ? mockEvents : visibleData;

  return (
    <>
      <motion.section
        id="events-section"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <header>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  ¿Sabes qué hacer hoy?
                </h2>
              </div>
              <p className="text-gray-600">
                Te aconsejamos estos eventos 
              </p>
            </header>
            
            {mockEvents.length > 4 && !showAllEvents && (
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={slideLeft}
                  disabled={!canSlideLeft}
                  className={`p-2 rounded-full shadow-lg transition-all ${
                    canSlideLeft 
                      ? 'hover:bg-gray-200 text-gray-900' 
                      : 'opacity-40 cursor-not-allowed text-gray-400'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={slideRight}
                  disabled={!canSlideRight}
                  className={`p-2 rounded-full shadow-lg transition-all ${
                    canSlideRight 
                      ? 'hover:bg-gray-200 text-gray-900' 
                      : 'opacity-40 cursor-not-allowed text-gray-400'
                  }`}
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                onClick={() => setShowAllEvents(true)}
                className="p-2 rounded-full bg-gradient-to-r from-primary-500 to-tomato text-white shadow-lg transition-all hover:scale-105">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop: Grid 4 columnas con navegación */}
          <div className="hidden lg:block">
            <div 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="grid grid-cols-4 gap-4"
            >
              {displayedEvents.map((event: any, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <EventCard 
                    event={event} 
                    onClick={() => setSelectedEventIndex(mockEvents.findIndex(e => e.id === event.id))} 
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tablet: Grid 3 columnas */}
          <div className="hidden md:block lg:hidden">
            <div className="grid grid-cols-3 gap-4">
              {displayedEvents.map((event: any, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                >
                  <EventCard 
                    event={event} 
                    onClick={() => setSelectedEventIndex(mockEvents.findIndex(e => e.id === event.id))} 
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile: Carrusel horizontal con scroll */}
          <div className="md:hidden">
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {mockEvents.map((event: any, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className="snap-start flex-shrink-0 w-[70vw] max-w-[280px]"
                >
                  <EventCard 
                    event={event} 
                    onClick={() => setSelectedEventIndex(mockEvents.findIndex(e => e.id === event.id))} 
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {showAllEvents && (
            <div className="hidden md:flex justify-center mt-8">
              <button
                onClick={() => setShowAllEvents(false)}
                className="text-gray-600 hover:text-gray-900 font-semibold"
              >
                Ver menos
              </button>
            </div>
          )}
        </div>
      </motion.section>

      {selectedEventIndex !== null && (
        <EventModal
          event={mockEvents[selectedEventIndex]}
          onClose={() => setSelectedEventIndex(null)}
          onNext={() => setSelectedEventIndex((selectedEventIndex + 1) % mockEvents.length)}
          onPrev={() => setSelectedEventIndex((selectedEventIndex - 1 + mockEvents.length) % mockEvents.length)}
          hasNext={selectedEventIndex < mockEvents.length - 1}
          hasPrev={selectedEventIndex > 0}
        />
      )}
    </>
  );
};

export default EventsSection;