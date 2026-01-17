import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Palette, Plus,
  Calendar, Camera, X,
  ChevronRight,
  UserPlus,
  Users, TrendingUp, Eye, Heart,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePlaces } from '@/context/PlacesContext';
import Preferences from '@/components/Preferences';
import PlacesCarousel from '@/components/PlacesCarousel';
import EventForm from '@/components/EventForm';
import { Place } from '@/types';


const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getLengthPlacesByUserId, getLengthReviewsByUserId, getSavedPlacesByUserId } = usePlaces();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // States
  const [openPreferencesModal, setOpenPreferencesModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'saved' | 'attending' | 'friends' | 'events'>('saved');
  const [showAttendeesModal, setShowAttendeesModal] = useState<any | null>(null);
  const [_, setShowAllPlacesModal] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Mock: Eventos publicados por el usuario
  const userEvents = [
    {
      id: 1,
      title: 'Noche de Tacos y Mezcal',
      category: 'Gastronomía',
      date: '2026-02-15',
      attendees: 45,
      views: 320,
      likes: 89,
      revenue: 1350
    }
  ];


  // Manejar cambio de avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);

    // Simular upload (reemplazar con lógica real)
    const reader = new FileReader();
    reader.onloadend = () => {
      // TODO: Reemplazar con lógica real
      setIsUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  // Manejar cambio de portada del evento
  // const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
  //   };
  //   reader.readAsDataURL(file);
  // };

  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);

  useEffect(() => {
    const renderPlacesSaved = async () => {
      if(!user) return;
      
      const placesSaved = await getSavedPlacesByUserId(user.id);
      
      if(!placesSaved) return;
      setSavedPlaces(placesSaved);
    }
    renderPlacesSaved();
    
  }, [user]);

  if (!user) return <Navigate to="/" replace />;

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

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-12 gap-8">

          {/* USER INFO PANEL */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm text-center">
              <div className="relative inline-block mb-6">
                <img
                  src={user.avatar || '/avatar.png'}
                  className="w-32 h-32 rounded-[2.5rem] object-cover shadow-2xl"
                  alt={user.name}
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-2 -right-2 bg-purple-500 text-white p-3 rounded-2xl hover:scale-110 transition-transform shadow-lg disabled:opacity-50"
                >
                  {isUploadingAvatar ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <h1 className="text-3xl font-black mb-1">{user.name}</h1>
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
            <div className="flex gap-8 border-b border-gray-100 overflow-x-auto">
              {['saved', 'events', 'attending', 'friends'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={`pb-4 text-sm font-black transition-all border-b-2 whitespace-nowrap ${activeTab === t ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                >
                  {t === 'saved' ? 'Colección' : t === 'events' ? 'Mis Eventos' : t === 'attending' ? 'Asistiré' : 'Comunidad'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'saved' && (
                  savedPlaces.length > 0 &&
                  <PlacesCarousel
                    setShowAllPlacesModal={setShowAllPlacesModal}
                    places={savedPlaces}
                    onPlaceClick={(place) => navigate(`/place/${place.id}`)}
                  />
                
              )}

              {activeTab === 'events' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key="events"
                  className="space-y-6"
                >
                  {userEvents.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-16 text-center border border-gray-100">
                      <div className="text-8xl mb-6">🦕</div>
                      <h3 className="text-2xl font-black mb-2">Aún no has publicado eventos</h3>
                      <p className="text-gray-400 font-medium mb-8">¡Crea tu primer evento y empieza a conectar con tu comunidad!</p>
                      <button
                        onClick={() => setShowEventForm(true)}
                        className="inline-flex items-center gap-2 bg-purple-500 text-white px-8 py-4 rounded-[1.5rem] font-black hover:bg-purple-600 transition-all shadow-lg"
                      >
                        <Plus className="w-5 h-5" /> Crear Mi Primer Evento
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Estadísticas generales */}
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="bg-white p-6 rounded-[2rem] w-1/2 border border-gray-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 rounded-xl">
                              <Eye className="w-4 h-4 text-blue-500" />
                            </div>
                            <p className="text-2xl font-black">{userEvents.reduce((acc, e) => acc + e.views, 0)}</p>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Vistas Totales</p>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem]  w-1/2 border border-gray-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-50 rounded-xl">
                              <Users className="w-4 h-4 text-purple-500" />
                            </div>
                            <p className="text-2xl font-black">{userEvents.reduce((acc, e) => acc + e.attendees, 0)}</p>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Asistentes</p>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] w-1/2 border border-gray-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-rose-50 rounded-xl">
                              <Heart className="w-4 h-4 text-rose-500" />
                            </div>
                            <p className="text-2xl font-black">{userEvents.reduce((acc, e) => acc + e.likes, 0)}</p>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Me Gusta</p>
                        </div>
                      </div>

                      {/* Lista de eventos */}
                      {userEvents.map((event) => (
                        <div key={event.id} className="bg-white rounded-[2rem] p-6 border border-gray-100">
                          <div className="flex items-start justify-between mb-6">
                            <div>
                              <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase mb-3">
                                {event.category}
                              </span>
                              <h3 className="text-2xl font-black mb-2">{event.title}</h3>
                              <p className="text-sm text-gray-400 font-bold flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> {event.date}
                              </p>
                            </div>
                            <button className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                              <TrendingUp className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-2xl">
                              <Eye className="w-4 h-4 text-gray-400 mx-auto mb-2" />
                              <p className="text-lg font-black">{event.views}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase">Vistas</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-2xl">
                              <Users className="w-4 h-4 text-gray-400 mx-auto mb-2" />
                              <p className="text-lg font-black">{event.attendees}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase">Asistentes</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-2xl">
                              <Heart className="w-4 h-4 text-gray-400 mx-auto mb-2" />
                              <p className="text-lg font-black">{event.likes}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase">Me Gusta</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </motion.div>
              )}

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
                          <h4 className="text-xl font-black">Noche de Jazz & Bourbon</h4>
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
                        <p className="text-[10px] font-black text-gray-400 uppercase group-hover:text-black transition-colors">Ver quiénes van <ChevronRight className="inline w-3 h-3" /></p>
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
                      <h5 className="font-black text-sm ">Marco Tulio</h5>
                      <p className="text-[10px] text-emerald-500 font-black uppercase mb-4">Confirmado en 3 eventos</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

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
                <h3 className="text-xl font-black">Asistentes al Evento</h3>
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

      <EventForm isOpen={showEventForm} onClose={() => setShowEventForm(false)} />

      <Preferences openPreferences={openPreferencesModal} setClosePreferences={setOpenPreferencesModal} />
    </div>
  );
};

export default Profile;