import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, ArrowLeft, Share2, Heart, 
  CheckCircle2, Ticket, Info, Clock, Users, Tag
} from 'lucide-react';

// Mock data adaptado al formulario
const mockEvents = [
  {
    id: '1',
    title: 'Noche de Jazz en Vivo',
    description: 'Una velada íntima con los mejores artistas de jazz de la región. Disfruta de música en vivo, bebidas artesanales y un ambiente acogedor perfecto para relajarte después de una larga semana.',
    category: 'Música',
    date: '2026-02-20',
    time: '20:00',
    price: 'Bs. 50',
    capacity: '100',
    coverImage: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    tags: ['jazz', 'musica en vivo', 'noche'],
    location: {
      latitude: -17.3895,
      longitude: -66.1568,
      address: 'Teatro Municipal, Centro Histórico'
    },
    organizer: {
      name: 'Carlos Méndez',
      avatar: 'https://i.pravatar.cc/100?img=12',
      isNew: false
    },
    likes: 234,
    comments: 45
  },
  {
    id: '2',
    title: 'Festival de Comida Callejera',
    description: 'El evento gastronómico más esperado del año. Más de 30 food trucks con lo mejor de la cocina local e internacional. Ven con hambre y prepárate para disfrutar.',
    category: 'Gastronomía',
    date: '2026-02-25',
    time: '12:00',
    price: 'Gratis',
    capacity: '500',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    tags: ['comida', 'festival', 'foodtruck'],
    location: {
      latitude: -17.3935,
      longitude: -66.1570,
      address: 'Plaza San Sebastián'
    },
    organizer: {
      name: 'María Torres',
      avatar: 'https://i.pravatar.cc/100?img=5',
      isNew: true
    },
    likes: 892,
    comments: 120
  },
  {
    id: '3',
    title: 'Maratón Urbana 10K',
    description: 'Desafía tus límites en esta carrera por las principales avenidas de la ciudad. Incluye medalla finisher, hidratación y DJ en ruta. Ideal para corredores de todos los niveles.',
    category: 'Deportes',
    date: '2026-03-05',
    time: '06:00',
    price: 'Bs. 80',
    capacity: '300',
    coverImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800',
    tags: ['running', 'deporte', 'salud'],
    location: {
      latitude: -17.3850,
      longitude: -66.1600,
      address: 'Av. Heroínas (Salida)'
    },
    organizer: {
      name: 'Club Runners CBA',
      avatar: 'https://i.pravatar.cc/100?img=33',
      isNew: false
    },
    likes: 456,
    comments: 78
  }
];

const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const event = mockEvents.find(e => e.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!event) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-500 font-medium">Evento no encontrado</p>
        <button onClick={() => navigate('/')} className="text-primary-600 font-bold">Volver al inicio</button>
      </div>
    );
  }

  // Procesar fecha y hora
  const eventDate = new Date(event.date + 'T' + event.time);
  const formattedDate = eventDate.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = event.time;

  // Amenities simulados
  const amenities = ["Estacionamiento vigilado", "Zona Pet Friendly", "Acceso Wi-Fi"];
  const rating = 4.9;
  const reviews = event.comments + 12;

  return (
    <section className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-rose-100">
      {/* Barra de Navegación Minimalista */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <Link 
          to="/"
          className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Volver</span>
        </Link>
        <div className="flex gap-2">
          <button className="p-2.5 hover:bg-slate-50 rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-slate-700" />
          </button>
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="p-2.5 hover:bg-slate-50 rounded-full transition-colors"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-700'}`} />
          </button>
        </div>
      </nav>

      <div className="py-12 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Columna Izquierda: Narrativa Visual */}
          <div className="lg:col-span-7 space-y-12">
            <section className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-video lg:aspect-[16/10] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200"
              >
                <img 
                  src={event.coverImage} 
                  className="w-full h-full object-cover" 
                  alt={event.title} 
                />
                <div className="absolute bottom-6 left-6 flex gap-2">
                  <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm">
                    {event.category}
                  </span>
                </div>
              </motion.div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-600">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold">{rating}</span>
                  <span className="text-slate-400 font-medium">({reviews} likes)</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-950 leading-[0.95]">
                  {event.title}
                </h1>
              </div>
            </section>

            {/* Grid de Información Rápida */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Fecha</p>
                <p className="text-sm font-bold">{formattedDate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Horario</p>
                <p className="text-sm font-bold">{formattedTime}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Capacidad</p>
                <p className="text-sm font-bold">{event.capacity} personas</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Precio</p>
                <p className="text-sm font-bold">{event.price}</p>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-2xl font-bold">Detalles de la experiencia</h3>
              <p className="text-slate-600 leading-relaxed text-lg font-light">
                {event.description}
              </p>

              {/* Tags del evento */}
              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {event.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold"
                    >
                      <Tag className="w-3 h-3" />
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {amenities.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-5 rounded-3xl bg-[#F8FAFC] border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                    <div className="bg-white p-2 rounded-xl shadow-sm group-hover:text-primary-600 transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Columna Derecha: Sticky Action Box */}
          <aside className="lg:col-span-5">
            <div className="sticky top-28 space-y-8">
              <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
                {/* Elemento decorativo sutil */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
                
                <div className="relative">
                  <div className="flex justify-between items-end mb-10">
                    <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase mb-2">Entrada General</p>
                      <h2 className="text-5xl font-black text-slate-900">{event.price}</h2>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold mb-2 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.capacity} cupos
                      </div>
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-8 h-8 rounded-full border-2 border-white" alt="user" />
                        ))}
                        <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                          +{event.likes}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 mb-10 text-sm">
                    <div className="flex items-start gap-4">
                      <div className="bg-rose-50 p-2.5 rounded-2xl">
                        <MapPin className="w-5 h-5 text-rose-500" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-none mb-1 text-xs uppercase">Ubicación</p>
                        <p className="text-slate-500 font-medium">{event.location.address}</p>
                        <p className="text-slate-400 text-xs mt-1">
                          {event.location.latitude.toFixed(4)}, {event.location.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 p-2.5 rounded-2xl">
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-none mb-1 text-xs uppercase">Fecha y Hora</p>
                        <p className="text-slate-500 font-medium">{formattedDate}</p>
                        <p className="text-slate-500 font-medium">{formattedTime} hrs</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-purple-50 p-2.5 rounded-2xl">
                        <Info className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-none mb-1 text-xs uppercase">Política</p>
                        <p className="text-slate-500 font-medium">Presentar ticket digital en puerta. Evento para todas las edades.</p>
                      </div>
                    </div>
                  </div>

                  <button className="group w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-[2rem] font-black text-lg transition-all active:scale-[0.97] flex items-center justify-center gap-3 shadow-xl shadow-slate-200">
                    <Ticket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Asistiré
                  </button>                 
                </div>
              </div>

              {/* Tarjeta del Organizador */}
              <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 rounded-[2rem] border border-slate-100/50">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={event.organizer.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt={event.organizer.name} />
                    {event.organizer.isNew && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase ">Organiza</p>
                    <p className="text-sm font-black text-slate-800 ">{event.organizer.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default EventDetailPage;