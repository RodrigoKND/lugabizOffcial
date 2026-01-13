import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Palette, Plus,
  Calendar, Camera, X, Upload,
  ChevronRight,
  Utensils, Music, Sparkles, Film, Ticket, UserPlus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePlaces } from '@/context/PlacesContext';
import Preferences from '@/components/Preferences';
import PlacesCarousel from '@/components/PlacesCarousel';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { places, getLengthPlacesByUserId, getLengthReviewsByUserId } = usePlaces();

  // States
  const [openPreferencesModal, setOpenPreferencesModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'saved' | 'attending' | 'friends'>('saved');
  const [category, setCategory] = useState('Gastronomía');
  const [showAttendeesModal, setShowAttendeesModal] = useState<any | null>(null);
  const [_, setShowAllPlacesModal] = useState(false);

  if (!user) return <Navigate to="/" replace />;
  // --- FORM LOGIC: Campos dinámicos por categoría ---
  const renderCategoryFields = () => {
    switch (category) {
      case 'Gastronomía':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tipo de Cocina</label>
              <input type="text" placeholder="Ej: Fusión Japonesa, Vegana..." className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Menú / Especialidad</label>
              <input type="text" placeholder="Platillo estrella" className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="col-span-full flex gap-2 overflow-x-auto pb-2">
              {['Degustación', 'Barra Libre', 'Pet Friendly', 'Música en vivo'].map(f => (
                <span key={f} className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-bold whitespace-nowrap">+ {f}</span>
              ))}
            </div>
          </motion.div>
        );
      case 'Fiesta/Música':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lineup / DJ</label>
              <input type="text" placeholder="Artistas invitados" className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dresscode</label>
              <input type="text" placeholder="Ej: All White, Elegante..." className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black" />
            </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-bold text-sm text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Inicio
          </button>
          <div className="flex gap-4">
            <button onClick={() => setOpenPreferencesModal(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Palette className="w-5 h-5" /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-12 gap-8">

          {/* USER INFO PANEL */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm text-center">
              <div className="relative inline-block mb-6">
                <img src={user.avatar || '/avatar.png'} className="w-32 h-32 rounded-[2.5rem] object-cover shadow-2xl" />
                <button className="absolute -bottom-2 -right-2 bg-purple-500 text-white p-3 rounded-2xl hover:scale-110 transition-transform shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h1 className="text-3xl font-black tracking-tighter mb-1">{user.name}</h1>
              <p className="text-gray-400 text-sm font-medium mb-8">{user.email}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                  <p className="text-2xl font-black">{getLengthPlacesByUserId(user.id).length}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Lugares</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                  <p className="text-2xl font-black">{getLengthReviewsByUserId(user.id)}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Reseñas</p>
                </div>
              </div>

              <button
                onClick={() => setShowEventForm(true)}
                className="w-full bg-purple-500 text-white py-4 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-2 hover:bg-purple-600 transition-all shadow-xl shadow-gray-200"
              >
                <Plus className="w-5 h-5" /> Crear Evento
              </button>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="flex gap-8 border-b border-gray-100">
              {['saved', 'attending', 'friends'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={`pb-4 text-sm font-black tracking-tight transition-all border-b-2 ${activeTab === t ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                >
                  {t === 'saved' ? 'Colección' : t === 'attending' ? 'Asistiré' : 'Comunidad'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {
                activeTab === 'saved' &&
               <PlacesCarousel 
                setShowAllPlacesModal={setShowAllPlacesModal}
                places={places}
                onPlaceClick={(place) => navigate(`/place/${place.id}`)}
              />
              }

              {activeTab === 'attending' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key="attending" className="grid gap-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      onClick={() => setShowAttendeesModal({ title: 'Festival de Jazz', attendees: 24 })}
                      className="group bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-3xl overflow-hidden shadow-inner">
                          <img src={`https://images.unsplash.com/photo-1514525253361-bee8a187499b?w=400`} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black tracking-tighter">Noche de Jazz & Bourbon</h4>
                          <div className="flex items-center gap-4 text-xs text-gray-400 font-bold mt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 15 Ene</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-rose-500" /> Club Central</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex -space-x-2 justify-end mb-2">
                          {[1, 2, 3].map(a => <img key={a} src={`https://i.pravatar.cc/100?img=${a + 20}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />)}
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-black transition-colors">Ver quiénes van <ChevronRight className="inline w-3 h-3" /></p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'friends' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="friends" className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center text-center">
                      <img src={`https://i.pravatar.cc/150?img=${i + 40}`} className="w-16 h-16 rounded-2xl mb-4" />
                      <h5 className="font-black text-sm tracking-tight">Marco Tulio</h5>
                      <p className="text-[10px] text-emerald-500 font-black uppercase mb-4 tracking-widest underline decoration-2">Confirmado en 3 eventos</p>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-[10px] font-black transition-colors">
                        <UserPlus className="w-3 h-3" /> Perfil
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* MODAL: QUIÉNES ASISTIRÁN */}
      <AnimatePresence>
        {showAttendeesModal && (
          <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAttendeesModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-black tracking-tighter">Asistentes al Evento</h3>
                <button onClick={() => setShowAttendeesModal(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-3xl transition-colors">
                    <div className="flex items-center gap-4">
                      <img src={`https://i.pravatar.cc/100?img=${i + 50}`} className="w-12 h-12 rounded-2xl object-cover" />
                      <div>
                        <p className="font-black text-sm">Carla Jiménez</p>
                        <p className="text-[10px] font-bold text-gray-400">Amigo común</p>
                      </div>
                    </div>
                    <button className="p-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100"><UserPlus className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CREAR EVENTO PRO (DINÁMICO) */}
      <AnimatePresence>
        {showEventForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowEventForm(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl my-8">
              <div className="p-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter">Organizar</h2>
                    <p className="text-gray-400 font-bold text-sm">Crea una experiencia que todos recuerden.</p>
                  </div>
                  <button onClick={() => setShowEventForm(false)} className="p-3 bg-gray-50 rounded-2xl"><X className="w-6 h-6" /></button>
                </div>

                <div className="space-y-8">
                  {/* Selector de Categoría con Estilo */}
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {[
                      { id: 'Gastronomía', icon: Utensils, color: 'text-orange-500' },
                      { id: 'Fiesta/Música', icon: Music, color: 'text-purple-500' },
                      { id: 'Cine', icon: Film, color: 'text-blue-500' },
                      { id: 'Wellness', icon: Sparkles, color: 'text-emerald-500' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all border-2 ${category === cat.id ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                      >
                        <cat.icon className={`w-4 h-4 ${category === cat.id ? 'text-white' : cat.color}`} /> {cat.id}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Título de la experiencia</label>
                      <input type="text" placeholder="¿Cómo se llama tu evento?" className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-lg font-bold border-none focus:ring-2 focus:ring-black transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Fecha</label>
                        <input type="date" className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Ubicación</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="text" placeholder="Lugar o Link Google Maps" className="w-full pl-11 pr-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black" />
                        </div>
                      </div>
                    </div>

                    {/* CAMPOS DINÁMICOS SEGÚN CATEGORÍA */}
                    <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 space-y-6">
                      <p className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Detalles de {category}
                      </p>
                      {renderCategoryFields()}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">¿Por qué la gente debe asistir?</label>
                        <textarea rows={3} placeholder="Describe el 'WOW factor' de tu evento..." className="w-full px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black resize-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Precio sugerido</label>
                        <div className="relative">
                          <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="text" placeholder="Ej: $15 o Gratis" className="w-full pl-11 pr-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black" />
                        </div>
                      </div>
                      <div className="space-y-2 text-center flex items-end">
                        <label className="w-full cursor-pointer flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:border-black hover:text-black transition-all">
                          <Upload className="w-4 h-4" /> Portada
                          <input type="file" className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-black text-white py-5 rounded-[2rem] font-black text-lg hover:bg-gray-800 transition-all shadow-2xl shadow-gray-200">
                    Lanzar Evento
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Preferences openPreferences={openPreferencesModal} setClosePreferences={setOpenPreferencesModal} />
    </div>
  );
};

export default Profile;