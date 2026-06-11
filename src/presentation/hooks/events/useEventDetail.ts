import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@presentation/context';
import { eventsService, eventSharesService, notificationsService, eventLikesService } from '@lib/supabase';
import { edgeService } from '@lib/supabase/services/notifications/edgeFunctions';
import { userActivityService } from '@lib/supabase/services/places/userActivity';
import { Event } from '@domain/entities';
import type { EventAttendee, EventStatus } from '@domain/entities/EventDetailTypes';
import { getEventStatus, formatEventDate } from './eventStatusUtils';

export function useEventDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [isAttending, setIsAttending] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [eventStatus, setEventStatus] = useState<EventStatus>('upcoming');

  const shareRef = new URLSearchParams(window.location.search).get('ref');

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      try {
        const eventData = await eventsService.getEventById(id);
        if (eventData) {
          setEvent(eventData);
          setAttendeeCount(eventData.attendeesCount);
          setIsFull(!!(eventData.capacity && eventData.attendeesCount >= eventData.capacity));
          setEventStatus(getEventStatus(eventData.dateStart, eventData.timeStart, eventData.timeEnd));
          // Registrar vista del evento en BD para personalización
          if (user?.id) {
            userActivityService.trackAction(user.id, 'view_event', {
              event: id,
              category: (eventData as any).category?.name,
            }).catch(() => {});
          }

          if (user) {
            const attending = await eventsService.isAttending(user.id, id);
            setIsAttending(attending);

            const liked = await eventLikesService.getLike(eventData.id, user.id);
            setIsLiked(liked);

            // When opened via shared link and not yet attending, prompt for confirmation
            if (shareRef && !attending) {
              setShowShareConfirm(true);
            }
          }

          const evAttendees = await eventsService.getEventAttendees(id);
          setAttendees(evAttendees);
        }
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvent();
  }, [id, user]);

  const handleAttend = async () => {
    if (!user) {
      toast.error('Inicia sesión para confirmar asistencia');
      return;
    }
    if (!event) return;

    if (!isAttending && event.capacity && attendeeCount >= event.capacity) {
      toast.error('El evento ha alcanzado su capacidad máxima');
      return;
    }

    try {
      if (isAttending) {
        await eventsService.cancelAttendance(user.id, event.id);
        setIsAttending(false);
        setAttendeeCount(prev => Math.max(0, prev - 1));
        setIsFull(false);
        toast.success('Asistencia cancelada');
      } else {
        await eventsService.attendEvent(user.id, event.id, shareRef || undefined);
        const newCount = attendeeCount + 1;
        setIsAttending(true);
        setAttendeeCount(newCount);
        toast.success('Asistencia confirmada!');

        if (event.userId !== user.id) {
          const label = newCount === 1 ? 'asistente confirmado' : 'asistentes confirmados';
          // In-app notification: only count, no name
          notificationsService.createNotification({
            userId: event.userId,
            type: 'event_attendance',
            title: '🎉 Nueva asistencia confirmada',
            body: `${event.name} tiene ${newCount} ${label}.`,
            data: { event_id: event.id, url: `/event/${event.id}` },
          }).catch(() => {});
          // Push notification to owner's device
          edgeService.sendAttendancePush(event.id, newCount).catch(() => {});
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
      const eventDate = new Date(event.dateStart);
      const formattedDate = formatEventDate(eventDate);
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
    } catch {
      toast.error('Error al compartir');
    }
  };

  const handleLike = useCallback(async () => {
    if (!user || !event) {
      toast.error('Inicia sesión para dar like');
      return;
    }
    try {
      const result = await eventLikesService.toggleLike(event.id, user.id);
      setIsLiked(result.liked);
    } catch {
      toast.error('Error al actualizar like');
    }
  }, [event, user]);

  const handleDelete = async () => {
    if (!event) return;
    try {
      await eventsService.deleteEvent(event.id);
      toast.success('Evento eliminado');
      return true;
    } catch {
      toast.error('Error al eliminar');
      return false;
    }
  };

  const formattedDate = event ? formatEventDate(event.dateStart) : '';
  const hasCoords = event ? event.coords && event.coords.length === 2 : false;

  return {
    event,
    isAttending,
    attendeeCount,
    attendees,
    isLoading,
    isLiked,
    isFull,
    eventStatus,
    showDeleteConfirm,
    showShareConfirm,
    formattedDate,
    hasCoords,
    shareRef,
    handleLike,
    setShowDeleteConfirm,
    setShowShareConfirm,
    handleAttend,
    handleShare,
    handleDelete,
  };
}
