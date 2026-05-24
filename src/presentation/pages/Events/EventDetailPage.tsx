import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
<<<<<<< HEAD
<<<<<<< HEAD
import toast from 'react-hot-toast';
import {
  MapPin, ArrowLeft, Share2, CheckCircle2, Ticket,
  Info, Clock, Users, Tag, Calendar, Loader2
} from 'lucide-react';
import { useAuth } from '@presentation/context';
=======
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MapPin, ArrowLeft, Share2, Heart, CheckCircle2, Ticket,
  Info, Clock, Users, Tag, Calendar, Loader2
} from 'lucide-react';
import { usePlaces, useAuth } from '@presentation/context';
>>>>>>> main
=======
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MapPin, ArrowLeft, Share2, Heart, CheckCircle2, Ticket,
  Info, Clock, Users, Tag, Calendar, Loader2
} from 'lucide-react';
import { usePlaces, useAuth } from '@presentation/context';
>>>>>>> main
import { eventsService, eventSharesService } from '@lib/supabase';
import { Event } from '@domain/entities';
import { Map, MapMarker, MarkerContent } from '@presentation/components/ui/map';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import { notificationsService } from '@lib/supabase';

const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
<<<<<<< HEAD
<<<<<<< HEAD
=======
  const { events } = usePlaces();
>>>>>>> main
=======
  const { events } = usePlaces();
>>>>>>> main
  const [event, setEvent] = useState<Event | null>(null);
  const [isAttending, setIsAttending] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> main
  const [isLiked, setIsLiked] = useState(false);
>>>>>>> main

  const shareRef = new URLSearchParams(window.location.search).get('ref');

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      try {
        const eventData = await eventsService.getEventById(id);
        if (eventData) {
          setEvent(eventData);
          setAttendeeCount(eventData.attendeesCount);

          if (user) {
            const attending = await eventsService.isAttending(user.id, id);
            setIsAttending(attending);
          }

          const evAttendees = await eventsService.getEventAttendees(id);
          setAttendees(evAttendees);

          if (shareRef && user) {
            await eventSharesService.attendWithShare(id, user.id, shareRef);
            toast.success('Asistencia confirmada!');
            setIsAttending(true);
            setAttendeeCount(prev => prev + 1);
          }
        }
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvent();
  }, [id, user]);

  useSEO({
    title: event?.name || 'Evento',
    description: event?.description || 'Detalles del evento',
    image: event?.image,
    schema: event ? {
      '@type': 'Event',
      name: event.name,
      description: event.description,
      startDate: event.dateStart.toISOString(),
      location: { '@type': 'Place', address: event.address },
    } : undefined,
  });

  const handleAttend = async () => {
    if (!user) {
      toast.error('Inicia sesión para confirmar asistencia');
      return;
    }
    if (!event) return;

    try {
      if (isAttending) {
        await eventsService.cancelAttendance(user.id, event.id);
        setIsAttending(false);
        setAttendeeCount(prev => Math.max(0, prev - 1));
        toast.success('Asistencia cancelada');
      } else {
        await eventsService.attendEvent(user.id, event.id, shareRef || undefined);
        setIsAttending(true);
        setAttendeeCount(prev => prev + 1);
        toast.success('Asistencia confirmada!');

        if (event.userId !== user.id) {
          await notificationsService.createNotification({
            userId: event.userId,
            type: 'event_invite',
            title: 'Nuevo asistente!',
            body: `${user.name} asistirá a ${event.name}`,
          });
        }
      }
    } catch {
      toast.error('Error al procesar tu solicitud');
    }
  };

  const handleShare = async () => {
    if (!user || !event) {
      toast.error('Inicia sesión para compartir');
      return;
    }
    try {
      const share = await eventSharesService.createShare(event.id, user.id);
<<<<<<< HEAD
<<<<<<< HEAD
      const shareText = `🎉 ${event.name}\n📅 ${formattedDate} | ${event.timeStart}\n📍 ${event.address}\n\n${share.sharedUrl}`;
      if (navigator.share) {
        await navigator.share({
          title: `${event.name} | Lugabiz`,
          text: shareText,
          url: share.sharedUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Enlace de invitación copiado!');
      }
=======
      await navigator.clipboard.writeText(share.sharedUrl);
      toast.success('Enlace de invitación copiado!');
>>>>>>> main
=======
      await navigator.clipboard.writeText(share.sharedUrl);
      toast.success('Enlace de invitación copiado!');
>>>>>>> main
    } catch {
      toast.error('Error al compartir');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center space-y-4">
        <div className="text-6xl">🦕</div>
        <p className="text-stone-500 font-medium">Evento no encontrado</p>
        <button onClick={() => navigate('/')} className="text-amber-600 font-bold hover:text-amber-700">Volver al inicio</button>
      </div>
    );
  }

  const eventDate = new Date(event.dateStart);
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const hasCoords = event.coords && event.coords.length === 2;

  return (
    <section className="min-h-screen bg-[#FDFCFB] text-stone-800">
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> main
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-100 px-6 py-4 flex justify-between items-center">
        <Link to="/" className="group flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Volver</span>
        </Link>
        <div className="flex gap-2">
          <button onClick={handleShare} className="p-2.5 hover:bg-stone-50 rounded-xl transition-colors">
            <Share2 className="w-5 h-5 text-stone-600" />
          </button>
          <button onClick={() => setIsLiked(!isLiked)} className="p-2.5 hover:bg-stone-50 rounded-xl transition-colors">
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-400 text-red-400' : 'text-stone-600'}`} />
          </button>
        </div>
      </nav>

<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-stone-100 shadow-sm">
              <img src={event.image || 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?w=800'}
                className="w-full h-full object-cover" alt={event.name} />
<<<<<<< HEAD
<<<<<<< HEAD
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <button onClick={handleShare} className=" bg-white/90 backdrop-blur-sm p-2 rounded-full">
                  <Share2 className="w-5 h-5 text-stone-600" />
                </button>
=======
              <div className="absolute bottom-4 left-4">
>>>>>>> main
=======
              <div className="absolute bottom-4 left-4">
>>>>>>> main
                {event.category && (
                  <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-sm">
                    {event.category.name}
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-stone-800 leading-tight">
              {event.name}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 border border-stone-100 shadow-xs">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-stone-700">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 border border-stone-100 shadow-xs">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-stone-700">{event.timeStart}</span>
              </div>
              {event.capacity && (
                <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 border border-stone-100 shadow-xs">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-stone-700">{event.capacity} cupos</span>
                </div>
              )}
            </div>

            <p className="text-stone-600 leading-relaxed">
              {event.description}
            </p>

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                    <Tag className="w-3 h-3" /> #{tag}
                  </span>
                ))}
              </div>
            )}

            {attendees.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-stone-100">
                <h3 className="font-semibold text-stone-800 mb-4">
                  Asistentes ({attendees.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {attendees.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2">
                      <img src={a.userAvatar || '/avatar.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-sm font-medium text-stone-700">{a.userName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Precio</p>
                  <p className="text-2xl font-bold text-stone-800">
                    {event.isFree ? 'Gratis' : `Bs. ${event.price}`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-stone-500">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{attendeeCount}</span>
                    <span>asistentes</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {hasCoords && (
                  <div className="rounded-2xl overflow-hidden border border-stone-100" style={{ height: '160px' }}>
                    <Map center={[event.coords[1], event.coords[0]]} zoom={15} style={{ width: '100%', height: '100%' }}>
                      <MapMarker longitude={event.coords[1]} latitude={event.coords[0]}>
                        <MarkerContent>
                          <div style={{ width: 36, height: 36, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                            <svg viewBox="0 0 48 48" fill="none">
<<<<<<< HEAD
<<<<<<< HEAD
                              <path d="M24 2C15.164 2 8 9.164 8 18c0 12 16 28 16 28s16-16 16-28C40 9.164 32.836 2 24 2z" fill="#D4785C" />
                              <path d="M24 2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z" fill="white" />
                              <circle cx="24" cy="10" r="4" fill="#D4785C" />
=======
                              <path d="M24 2C15.164 2 8 9.164 8 18c0 12 16 28 16 28s16-16 16-28C40 9.164 32.836 2 24 2z" fill="#D4785C"/>
                              <path d="M24 2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z" fill="white"/>
                              <circle cx="24" cy="10" r="4" fill="#D4785C"/>
>>>>>>> main
=======
                              <path d="M24 2C15.164 2 8 9.164 8 18c0 12 16 28 16 28s16-16 16-28C40 9.164 32.836 2 24 2z" fill="#D4785C"/>
                              <path d="M24 2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z" fill="white"/>
                              <circle cx="24" cy="10" r="4" fill="#D4785C"/>
>>>>>>> main
                            </svg>
                          </div>
                        </MarkerContent>
                      </MapMarker>
                    </Map>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="bg-amber-50 p-2.5 rounded-xl"><MapPin className="w-5 h-5 text-amber-500" /></div>
                  <div>
                    <p className="text-xs font-semibold text-stone-400 uppercase">Ubicación</p>
                    <p className="text-sm font-medium text-stone-700">{event.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-amber-50 p-2.5 rounded-xl"><Clock className="w-5 h-5 text-amber-500" /></div>
                  <div>
                    <p className="text-xs font-semibold text-stone-400 uppercase">Fecha y Hora</p>
                    <p className="text-sm font-medium text-stone-700">{formattedDate}</p>
                    <p className="text-sm text-stone-500">{event.timeStart}{event.timeEnd ? ` - ${event.timeEnd}` : ''}</p>
                  </div>
                </div>

                {event.capacity && (
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-50 p-2.5 rounded-xl"><Info className="w-5 h-5 text-amber-500" /></div>
                    <div>
                      <p className="text-xs font-semibold text-stone-400 uppercase">Capacidad</p>
                      <p className="text-sm font-medium text-stone-700">{event.capacity} personas</p>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleAttend}
<<<<<<< HEAD
<<<<<<< HEAD
                className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 ${isAttending
                  ? 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-md'
                  }`}>
=======
=======
>>>>>>> main
                className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 ${
                  isAttending
                    ? 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
                    : 'bg-amber-500 text-white hover:bg-amber-600 shadow-md'
                }`}>
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> main
                {isAttending ? <><CheckCircle2 className="w-5 h-5" /> Asistiré</> : <><Ticket className="w-5 h-5" /> Confirmar Asistencia</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetailPage;
