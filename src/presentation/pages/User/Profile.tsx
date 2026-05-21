import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
  MapPin, Plus, Calendar, Camera, X, ChevronRight, UserPlus,
  Users, TrendingUp, Eye, Heart, BarChart3, LogOut,
  CheckCircle2, Clock, Star, Loader2, Bell, Ticket, Pencil
} from 'lucide-react';
import { useAuth, usePlaces } from '@presentation/context';
import { PlacesCarousel, EventForm } from '@presentation/components/features';
import { Event } from '@domain/entities';
import { eventsService } from '@lib/supabase';
import { useSEO } from '@presentation/hooks/seo/useSEO';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, uploadAvatar, updateProfile, isAdmin } = useAuth();
  const { getLengthPlacesByUserId, getLengthReviewsByUserId, getSavedPlacesByUserId, getUserEvents, getEventsAttending } = usePlaces();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [showEventForm, setShowEventForm] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('saved');
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', bio: '', ownerBusinessName: '' });

  useSEO({
    title: user?.name || 'Perfil',
    description: 'Perfil de usuario en Lugabiz',
  });

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      setEditData({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        ownerBusinessName: user.ownerBusinessName || '',
      });

      const saved = await getSavedPlacesByUserId(user.id);
      if (saved) setSavedPlaces(saved);

      const events = getUserEvents(user.id);
      setMyEvents(events);

      const attending = await getEventsAttending(user.id);
      setAttendingEvents(attending);
    };
    init();
  }, [user]);

  if (!user) return <Navigate to="/" replace />;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    await uploadAvatar(file);
    setIsUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
    await updateProfile(editData);
    setIsEditing(false);
  };

  const handleSubmitEventForm = () => {
    setShowEventForm(false);
  };

  const tabs = [
    { id: 'saved', label: 'Colección', icon: Heart },
    { id: 'events', label: 'Mis Eventos', icon: Calendar },
    { id: 'attending', label: 'Asistiré', icon: CheckCircle2 },
  ];

  if (user.isOwner) tabs.push({ id: 'owner', label: 'Dashboard', icon: BarChart3 });

  const myPlacesCount = getLengthPlacesByUserId(user.id).length;
  const reviewsCount = getLengthReviewsByUserId(user.id);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-800">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm text-center">
              <div className="relative inline-block mb-4">
                <img src={user.avatar || '/avatar.png'}
                  className="w-24 h-24 rounded-2xl object-cover shadow-md" alt={user.name} />
                <button onClick={() => avatarInputRef.current?.click()} disabled={isUploadingAvatar}
                  className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-2 rounded-xl hover:scale-110 transition-transform shadow-md disabled:opacity-50">
                  {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <h1 className="text-xl font-bold mb-1">{user.name}</h1>
              <p className="text-stone-400 text-sm mb-4">{user.email}</p>
              {user.bio && <p className="text-stone-500 text-sm mb-4">{user.bio}</p>}
              {user.isOwner && user.ownerBusinessName && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold mb-4">
                  <Star className="w-3 h-3" /> {user.ownerBusinessName}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-stone-50 p-3 rounded-2xl">
                  <p className="text-xl font-bold">{myPlacesCount}</p>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase">Lugares</p>
                </div>
                <div className="bg-stone-50 p-3 rounded-2xl">
                  <p className="text-xl font-bold">{reviewsCount}</p>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase">Reseñas</p>
                </div>
              </div>
              <button onClick={() => setShowEventForm(true)}
                className="w-full bg-amber-500 text-white py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-sm">
                <Plus className="w-4 h-4" /> Crear Evento
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-stone-700">Configuración</h3>
                <button onClick={() => setIsEditing(true)}
                  className="p-2 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors text-amber-600">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {isAdmin && (
                  <Link to="/admin"
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors text-sm text-stone-600">
                    <BarChart3 className="w-4 h-4" /> Panel Admin
                  </Link>
                )}
                <button onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm text-red-500">
                  <LogOut className="w-4 h-4" /> Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="flex gap-6 border-b border-stone-100 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-400 hover:text-stone-600'
                    }`}>
                    <Icon className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'saved' && (
                <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {savedPlaces.length > 0 ? (
                    <PlacesCarousel setShowAllPlacesModal={() => {}} places={savedPlaces} onPlaceClick={(p) => navigate(`/place/${p.id}`)} />
                  ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-stone-100">
                      <div className="text-5xl mb-4">🦕</div>
                      <h3 className="text-lg font-bold mb-2">Aún no tienes lugares guardados</h3>
                      <p className="text-stone-400 text-sm mb-6">Explora y guarda tus lugares favoritos</p>
                      <Link to="/" className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-2xl font-medium text-sm hover:bg-amber-600">
                        Explorar lugares
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'events' && (
                <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {myEvents.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-stone-100">
                      <div className="text-5xl mb-4">🦕</div>
                      <h3 className="text-lg font-bold mb-2">Aún no has publicado eventos</h3>
                      <button onClick={() => setShowEventForm(true)}
                        className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-2xl font-medium text-sm hover:bg-amber-600">
                        <Plus className="w-4 h-4" /> Crear Evento
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-stone-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Eye className="w-4 h-4 text-stone-400" />
                            <span className="text-lg font-bold">{myEvents.reduce((a, e) => a + e.attendeesCount, 0)}</span>
                          </div>
                          <p className="text-[10px] font-semibold text-stone-400 uppercase">Asistentes</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-stone-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-stone-400" />
                            <span className="text-lg font-bold">{myEvents.length}</span>
                          </div>
                          <p className="text-[10px] font-semibold text-stone-400 uppercase">Eventos</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-stone-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-stone-400" />
                            <span className="text-lg font-bold">{myEvents.filter(e => new Date(e.dateStart) > new Date()).length}</span>
                          </div>
                          <p className="text-[10px] font-semibold text-stone-400 uppercase">Próximos</p>
                        </div>
                      </div>

                      {myEvents.map(event => (
                        <div key={event.id} className="bg-white rounded-2xl p-5 border border-stone-100 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              {event.category && (
                                <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-semibold uppercase mb-2">
                                  {event.category.name}
                                </span>
                              )}
                              <Link to={`/event/${event.id}`} className="text-lg font-bold text-stone-800 hover:text-amber-600 transition-colors block">
                                {event.name}
                              </Link>
                              <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-1">
                                <Calendar className="w-3 h-3" /> {event.dateStart.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-stone-500">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.attendeesCount} asistentes</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.address}</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === 'attending' && (
                <motion.div key="attending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {attendingEvents.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-stone-100">
                      <div className="text-5xl mb-4">🦕</div>
                      <h3 className="text-lg font-bold mb-2">No asistes a ningún evento</h3>
                      <p className="text-stone-400 text-sm mb-6">Confirma tu asistencia a eventos</p>
                      <Link to="/" className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-2xl font-medium text-sm hover:bg-amber-600">
                        Ver eventos
                      </Link>
                    </div>
                  ) : (
                    attendingEvents.map(event => (
                      <Link key={event.id} to={`/event/${event.id}`}
                        className="block bg-white p-5 rounded-2xl border border-stone-100 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-4">
                          {event.image && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                              <img src={event.image} className="w-full h-full object-cover" alt="" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-stone-800 truncate">{event.name}</h4>
                            <p className="text-xs text-stone-400 flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" /> {event.dateStart.toLocaleDateString()} | {event.timeStart}
                            </p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        </div>
                      </Link>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'owner' && (
                <motion.div key="owner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-stone-100">
                      <p className="text-2xl font-bold text-stone-800">{myPlacesCount}</p>
                      <p className="text-xs text-stone-400 font-semibold uppercase mt-1">Lugares publicados</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-stone-100">
                      <p className="text-2xl font-bold text-stone-800">{myEvents.length}</p>
                      <p className="text-xs text-stone-400 font-semibold uppercase mt-1">Eventos creados</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-stone-100">
                      <p className="text-2xl font-bold text-stone-800">{reviewsCount}</p>
                      <p className="text-xs text-stone-400 font-semibold uppercase mt-1">Reseñas recibidas</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-stone-100">
                      <p className="text-2xl font-bold text-stone-800">{savedPlaces.length}</p>
                      <p className="text-xs text-stone-400 font-semibold uppercase mt-1">Veces guardado</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-stone-100">
                    <h3 className="font-bold text-stone-800 mb-4">Tus lugares publicados</h3>
                    {myPlacesCount > 0 ? (
                      <PlacesCarousel setShowAllPlacesModal={() => {}} places={getLengthPlacesByUserId(user.id)} onPlaceClick={(p) => navigate(`/place/${p.id}`)} />
                    ) : (
                      <p className="text-stone-400 text-sm">Aún no has publicado lugares</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <EventForm isOpen={showEventForm} onClose={() => setShowEventForm(false)} />

      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-stone-100">
                <h3 className="text-lg font-bold text-stone-800">Editar Perfil</h3>
                <button onClick={() => setIsEditing(false)} className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors">
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Nombre</label>
                  <input type="text" value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-amber-400 focus:bg-white transition-all outline-none" placeholder="Nombre" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Teléfono</label>
                  <input type="text" value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-amber-400 focus:bg-white transition-all outline-none" placeholder="Teléfono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Bio</label>
                  <textarea value={editData.bio} onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-amber-400 focus:bg-white transition-all outline-none resize-none" placeholder="Bio" rows={3} />
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-stone-50 rounded-2xl">
                  <input type="checkbox" checked={!!editData.ownerBusinessName}
                    onChange={e => setEditData(p => ({ ...p, ownerBusinessName: e.target.checked ? p.ownerBusinessName || 'Mi Negocio' : '' }))}
                    className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400" />
                  <span className="text-sm text-stone-600 font-medium">Soy dueño de negocio</span>
                </label>
                {editData.ownerBusinessName && (
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">Nombre del negocio</label>
                    <input type="text" value={editData.ownerBusinessName} onChange={e => setEditData(p => ({ ...p, ownerBusinessName: e.target.value }))}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-amber-400 focus:bg-white transition-all outline-none" placeholder="Nombre del negocio" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 p-6 border-t border-stone-100">
                <button onClick={handleSaveProfile} disabled={!editData.name.trim()}
                  className="flex-1 py-3 bg-amber-500 text-white rounded-2xl font-semibold text-sm hover:bg-amber-600 transition-all disabled:opacity-50">Guardar Cambios</button>
                <button onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-2xl font-semibold text-sm hover:bg-stone-200 transition-all">Cancelar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
