import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
MapPin, ArrowLeft, Share2, Heart, 
CheckCircle2, Ticket, Info 
} from 'lucide-react';
import { mockEvents } from '@/components/EventSection'; // Ajusta la ruta

const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  // Buscamos el evento por ID
  const event = mockEvents.find(e => e.id === id);

  // Scroll al inicio al cargar
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

  // Datos extra "quemados" o simulados para enriquecer la vista
  const extraDetails = {
    price: event.category === 'Bienestar' ? 'Gratis' : '$15.50',
    fullAddress: `${event.location}, Sector Histórico, Ciudad Principal`,
    capacity: "Cupo limitado",
    amenities: ["Estacionamiento vigilado", "Zona Pet Friendly", "Acceso Wi-Fi"],
    rating: 4.9,
    reviews: event.comments + 12,
  };

  return (
    <section className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-rose-100">
      {/* Barra de Navegación Minimalista */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <Link 
          to="/"
          className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold tracking-tight">Volver</span>
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
                  src={event.imageUrl} 
                  className="w-full h-full object-cover" 
                  alt={event.title} 
                />
                <div className="absolute bottom-6 left-6 flex gap-2">
                  <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {event.category}
                  </span>
                </div>
              </motion.div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-600">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold">{extraDetails.rating}</span>
                  <span className="text-slate-400 font-medium">({extraDetails.reviews} likes)</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter leading-[0.95]">
                  {event.title}
                </h1>
              </div>
            </section>

            {/* Grid de Información Rápida */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</p>
                <p className="text-sm font-bold">{event.startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horario</p>
                <p className="text-sm font-bold">{event.availableHours.start} - {event.availableHours.end}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lugar</p>
                <p className="text-sm font-bold">{event.location}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Esfuerzo</p>
                <p className="text-sm font-bold">Relajado</p>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-2xl font-bold tracking-tight">Detalles de la experiencia</h3>
              <p className="text-slate-600 leading-relaxed text-lg font-light">
                {event.description} Cada detalle ha sido cuidado para garantizar una atmósfera segura y vibrante. Únete a cientos de entusiastas en {event.location} para celebrar lo mejor de nuestra cultura local.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {extraDetails.amenities.map((item, i) => (
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
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Entrada General</p>
                      <h2 className="text-5xl font-black text-slate-900">{extraDetails.price}</h2>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold mb-2">
                        {extraDetails.capacity}
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
                        <p className="font-black text-slate-900 leading-none mb-1 text-xs uppercase tracking-tighter">Cómo llegar</p>
                        <p className="text-slate-500 font-medium">{extraDetails.fullAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 p-2.5 rounded-2xl">
                        <Info className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-none mb-1 text-xs uppercase tracking-tighter">Política</p>
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organiza</p>
                    <p className="text-sm font-black text-slate-800 tracking-tight">{event.organizer.name}</p>
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