import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
<<<<<<< HEAD
<<<<<<< HEAD
  MapPin, Plus, Calendar, Camera, X, Users, TrendingUp, Eye, Heart, BarChart3, LogOut,
  CheckCircle2, Clock, Star, Loader2, Bell, Ticket, Pencil, Megaphone,
  MessageCircle, Share2, Bookmark, Activity, UserCheck, Award, ExternalLink,
  ChevronRight, Menu
} from 'lucide-react';
import { useAuth, usePlaces } from '@presentation/context';
import { EventForm, OwnerAnnouncement } from '@presentation/components/features';
import { Event, Place } from '@domain/entities';
import { eventsService } from '@lib/supabase';
import { edgeService } from '@lib/supabase/services/notifications/edgeFunctions';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, uploadAvatar, updateProfile, isAdmin, notifications, unreadCount } = useAuth();
=======
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
>>>>>>> main
=======
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
>>>>>>> main
  const { getLengthPlacesByUserId, getLengthReviewsByUserId, getSavedPlacesByUserId, getUserEvents, getEventsAttending } = usePlaces();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [showEventForm, setShowEventForm] = useState(false);
<<<<<<< HEAD
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState('saved');
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', bio: '', isOwner: false, ownerBusinessName: '' });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useSEO({ title: user?.name || 'Perfil', description: 'Perfil de usuario en Lugabiz' });
=======
  const [activeTab, setActiveTab] = useState<string>('saved');
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', bio: '', ownerBusinessName: '' });

=======
  const [activeTab, setActiveTab] = useState<string>('saved');
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', bio: '', ownerBusinessName: '' });

>>>>>>> main
  useSEO({
    title: user?.name || 'Perfil',
    description: 'Perfil de usuario en Lugabiz',
  });
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      setEditData({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
<<<<<<< HEAD
<<<<<<< HEAD
        isOwner: user.isOwner || false,
        ownerBusinessName: user.ownerBusinessName || '',
      });

      const [saved, events, attending] = await Promise.all([
        getSavedPlacesByUserId(user.id),
        getUserEvents(user.id),
        getEventsAttending(user.id),
      ]);
      if (saved) setSavedPlaces(saved);
      setMyEvents(events);
      setAttendingEvents(attending);

      const ownerNotifs = notifications.filter(n => n.type === 'owner_announcement');
      setAnnouncements(ownerNotifs);
=======
=======
>>>>>>> main
        ownerBusinessName: user.ownerBusinessName || '',
      });

      const saved = await getSavedPlacesByUserId(user.id);
      if (saved) setSavedPlaces(saved);

      const events = getUserEvents(user.id);
      setMyEvents(events);

      const attending = await getEventsAttending(user.id);
      setAttendingEvents(attending);
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
    };
    init();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      edgeService.createOwnerAnnouncement('', '').catch(() => {});
    }
  }, [isAdmin]);

  if (!user) return <Navigate to="/" replace />;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    await uploadAvatar(file);
    setIsUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
<<<<<<< HEAD
<<<<<<< HEAD
    const isOwner = !!editData.ownerBusinessName;
    await updateProfile({ ...editData, isOwner });
    setIsEditing(false);
  };

  const tabs = [
    { id: 'saved', label: 'Colección', icon: Bookmark },
    { id: 'events', label: 'Mis Eventos', icon: Calendar },
    { id: 'attending', label: 'Asistiré', icon: CheckCircle2 },
  ];
  if (user.isOwner) tabs.push({ id: 'dashboard', label: 'Dashboard', icon: BarChart3 });
  if (isAdmin) tabs.push({ id: 'admin', label: 'Admin', icon: Activity });

  const myPlaces = getLengthPlacesByUserId(user.id);
  const reviewsCount = getLengthReviewsByUserId(user.id);

  const StatCard = ({ icon: Icon, label, value, color = 'text-primary-500' }: any) => (
    <div className="bg-white rounded-xl p-4 border border-primary-100/40 shadow-xs">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-primary-50`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-xs font-semibold text-text-secondary uppercase">{label}</span>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  );

  const tabContent = () => {
    switch (activeTab) {
      case 'saved':
        return (
          <div className="space-y-2">
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">{savedPlaces.length} lugares guardados</p>
            {savedPlaces.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-primary-100/40">
                <Bookmark className="w-10 h-10 text-primary-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-text-primary mb-1">Tu colección está vacía</h3>
                <p className="text-sm text-text-secondary mb-5">Explora y guarda lugares que te gusten</p>
                <Link to="/" className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-600 transition-all">
                  Explorar
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {savedPlaces.map(place => (
                  <button key={place.id} onClick={() => navigate(`/place/${place.id}`)}
                    className="group relative rounded-xl overflow-hidden bg-white border border-primary-100/40 shadow-xs hover:shadow-md transition-all active:scale-[0.97]">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                        style={{ backgroundImage: `url(${place.image || ''})` }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 z-10">
                        <p className="text-white font-semibold text-xs truncate">{place.name}</p>
                        <p className="text-white/60 text-[10px]">{place.category?.name}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'events':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide">{myEvents.length} eventos</p>
              <button onClick={() => setShowEventForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-semibold hover:bg-primary-600 transition-all">
                <Plus className="w-3 h-3" /> Crear
              </button>
            </div>
            {myEvents.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-primary-100/40">
                <Calendar className="w-10 h-10 text-primary-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-text-primary mb-1">Sin eventos</h3>
                <p className="text-sm text-text-secondary mb-5">Crea tu primer evento</p>
                <button onClick={() => setShowEventForm(true)}
                  className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-600 transition-all">
                  <Plus className="w-4 h-4" /> Crear Evento
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myEvents.slice(0, 20).map(event => (
                  <div key={event.id}
                    className="bg-white rounded-xl p-4 border border-primary-100/40 hover:shadow-sm transition-all flex items-center gap-3">
                    {event.image && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-primary-50 shrink-0">
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {event.category && <span className="px-1.5 py-0.5 bg-primary-50 text-primary-600 rounded text-[10px] font-semibold">{event.category.name}</span>}
                        <p className="text-xs text-text-secondary">{event.dateStart.toLocaleDateString()}</p>
                      </div>
                      <Link to={`/event/${event.id}`} className="font-semibold text-sm text-text-primary hover:text-primary-600 transition-colors truncate block">
                        {event.name}
                      </Link>
                      <div className="flex items-center gap-3 text-[11px] text-text-secondary mt-0.5">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.attendeesCount}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.address}</span>
                      </div>
                    </div>
                    <button onClick={async () => {
                      if (!confirm('¿Eliminar evento?')) return;
                      try {
                        await eventsService.deleteEvent(event.id);
                        setMyEvents(prev => prev.filter(e => e.id !== event.id));
                        toast.success('Evento eliminado');
                      } catch { toast.error('Error'); }
                    }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                      <X className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'attending':
        return (
          <div className="space-y-2">
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">{attendingEvents.length} eventos</p>
            {attendingEvents.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-primary-100/40">
                <CheckCircle2 className="w-10 h-10 text-primary-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-text-primary mb-1">No asistes a eventos</h3>
                <Link to="/" className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-600 transition-all mt-5">
                  Ver eventos
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {attendingEvents.slice(0, 30).map(event => (
                  <Link key={event.id} to={`/event/${event.id}`}
                    className="block bg-white rounded-xl p-4 border border-primary-100/40 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary-50 shrink-0">
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${event.image || ''})` }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-text-primary truncate">{event.name}</h4>
                        <p className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3 h-3" /> {event.dateStart.toLocaleDateString()} | {event.timeStart}
                        </p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );

      case 'dashboard':
        const upcomingEvents = myEvents.filter(e => new Date(e.dateStart) > new Date());
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={MapPin} label="Lugares" value={myPlaces.length} />
              <StatCard icon={Calendar} label="Eventos" value={myEvents.length} />
              <StatCard icon={Users} label="Asistentes" value={myEvents.reduce((a, e) => a + e.attendeesCount, 0)} color="text-pink-500" />
              <StatCard icon={Star} label="Próximos" value={upcomingEvents.length} color="text-amber-500" />
            </div>
            <button onClick={() => setShowAnnouncement(true)}
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-xs">
              <Megaphone className="w-4 h-4" /> Enviar Anuncio a Usuarios
            </button>
            {myPlaces.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-primary-100/40">
                <h3 className="font-semibold text-sm text-text-primary mb-3">Tus lugares</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {myPlaces.slice(0, 6).map(place => (
                    <button key={place.id} onClick={() => navigate(`/place/${place.id}`)}
                      className="aspect-[4/3] rounded-xl overflow-hidden relative group">
                      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                        style={{ backgroundImage: `url(${place.image || ''})` }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <p className="absolute bottom-1.5 left-1.5 right-1.5 text-white font-semibold text-[10px] truncate">{place.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'admin':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-text-primary uppercase tracking-wide">Monitor del Sistema</h3>
              <Link to="/admin" className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-600">
                Panel completo <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Users} label="Total Usuarios" value="—" />
              <StatCard icon={MapPin} label="Lugares" value={myPlaces.length} />
              <StatCard icon={Calendar} label="Eventos" value={myEvents.length} />
              <StatCard icon={Bell} label="Notificaciones" value={unreadCount} color="text-pink-500" />
            </div>
            <div className="bg-white rounded-xl p-4 border border-primary-100/40">
              <h4 className="font-semibold text-sm text-text-primary mb-3">Actividad Reciente</h4>
              {notifications.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-6">Sin actividad reciente</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.slice(0, 15).map(n => (
                    <div key={n.id} className="flex items-start gap-2.5 text-xs p-2 rounded-lg hover:bg-primary-50 transition-colors">
                      <Bell className="w-3.5 h-3.5 text-primary-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-text-primary">{n.title}</p>
                        <p className="text-text-secondary">{n.body}</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">{n.createdAt.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-feed-bg pb-24 md:pb-0">
      <div className="purple-blob w-72 h-72 bg-primary-200/20 -top-20 -left-20" />
      <div className="purple-blob w-80 h-80 bg-pink-200/10 top-1/3 -right-32" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-primary-100/40 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative shrink-0">
              <img src={user.avatar || '/avatar.png'}
                className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-2 ring-primary-100" alt={user.name} />
              <button onClick={() => avatarInputRef.current?.click()} disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 bg-primary-500 text-white p-1.5 rounded-lg hover:scale-110 transition-transform shadow-sm disabled:opacity-50">
                {isUploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex items-center justify-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-xl font-bold text-text-primary">{user.name}</h1>
                  <p className="text-sm text-text-secondary">{user.email}</p>
                </div>
                <button onClick={() => setIsEditing(true)}
                  className="hidden sm:flex p-2 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-primary-500 shrink-0">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              {user.bio && <p className="text-sm text-text-secondary mt-1">{user.bio}</p>}
              {user.isOwner && user.ownerBusinessName && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold mt-2">
                  <Award className="w-3 h-3" /> Dueño de {user.ownerBusinessName}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-primary-100/30">
            <div className="text-center">
              <p className="text-lg font-bold text-text-primary">{myPlaces.length}</p>
              <p className="text-[10px] font-semibold text-text-secondary uppercase">Lugares</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-text-primary">{reviewsCount}</p>
              <p className="text-[10px] font-semibold text-text-secondary uppercase">Reseñas</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-text-primary">{myEvents.length}</p>
              <p className="text-[10px] font-semibold text-text-secondary uppercase">Eventos</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4 sm:hidden">
            <button onClick={() => setShowEventForm(true)}
              className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary-600 transition-all">
              <Plus className="w-3.5 h-3.5" /> Crear Evento
            </button>
            <button onClick={() => setIsEditing(true)}
              className="py-2.5 px-4 bg-primary-50 text-primary-500 rounded-xl font-semibold text-xs hover:bg-primary-100 transition-all">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="py-2.5 px-4 bg-primary-50 text-primary-500 rounded-xl font-semibold text-xs hover:bg-primary-100 transition-all">
              <Menu className="w-3.5 h-3.5" />
            </button>
          </div>

          {showMobileMenu && (
            <div className="mt-2 space-y-1 sm:hidden">
              {isAdmin && (
                <Link to="/admin" onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-primary-50 transition-colors">
                  <BarChart3 className="w-4 h-4" /> Panel Admin
                </Link>
              )}
              <button onClick={() => { logout(); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 sm:gap-6 border-b border-primary-100/30 overflow-x-auto scrollbar-hide mb-5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content (scalable with max-height) */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {tabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <EventForm isOpen={showEventForm} onClose={() => setShowEventForm(false)} />
      <OwnerAnnouncement isOpen={showAnnouncement} onClose={() => setShowAnnouncement(false)} />

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-primary-100">
                <h3 className="text-base font-bold text-text-primary">Editar Perfil</h3>
                <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                  <X className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Nombre</label>
                  <input type="text" value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Teléfono</label>
                  <input type="text" value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Bio</label>
                  <textarea value={editData.bio} onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all resize-none" rows={3} />
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-primary-50/50 rounded-xl">
                  <input type="checkbox" checked={!!editData.ownerBusinessName}
                    onChange={e => setEditData(p => ({ ...p, ownerBusinessName: e.target.checked ? p.ownerBusinessName || 'Mi Negocio' : '' }))}
                    className="w-4 h-4 rounded border-primary-300 text-primary-500 focus:ring-primary-400" />
                  <span className="text-sm text-text-primary font-medium">Soy dueño de negocio</span>
                </label>
                {editData.ownerBusinessName && (
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Nombre del negocio</label>
                    <input type="text" value={editData.ownerBusinessName} onChange={e => setEditData(p => ({ ...p, ownerBusinessName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 p-5 border-t border-primary-100">
                <button onClick={handleSaveProfile} disabled={!editData.name.trim()}
                  className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all disabled:opacity-50">Guardar</button>
                <button onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 bg-primary-50 text-text-secondary rounded-xl font-semibold text-sm hover:bg-primary-100 transition-all">Cancelar</button>
=======
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

=======
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

>>>>>>> main
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
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
<<<<<<< HEAD
<<<<<<< HEAD

      {/* Desktop Logout */}
      <div className="hidden sm:block fixed bottom-6 right-6 z-40">
        <button onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-100 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all shadow-xs">
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </div>
=======
>>>>>>> main
=======
>>>>>>> main
    </div>
  );
};

export default Profile;
