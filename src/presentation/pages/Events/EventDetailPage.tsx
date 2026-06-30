import { useNavigate } from 'react-router-dom';
import { useAuth } from '@presentation/context';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import { useEventDetail } from '@presentation/hooks/events/useEventDetail';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import EventDetailLoading from '@presentation/components/features/events/detail/EventDetailLoading';
import EventDetailNotFound from '@presentation/components/features/events/detail/EventDetailNotFound';
import EventDetailNavbar from '@presentation/components/features/events/detail/EventDetailNavbar';
import EventDetailHero from '@presentation/components/features/events/detail/EventDetailHero';
import EventDetailInfo from '@presentation/components/features/events/detail/EventDetailInfo';
import EventDetailAttendeeStack from '@presentation/components/features/events/detail/EventDetailAttendeeStack';
import EventDetailSidebar from '@presentation/components/features/events/detail/EventDetailSidebar';

const EventDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    event, isAttending, attendeeCount, attendees, isLoading, isLiked, isFull,
    eventStatus, showDeleteConfirm, showShareConfirm, formattedDate, hasCoords,
    handleLike, setShowDeleteConfirm, setShowShareConfirm, handleAttend, handleShare, handleDelete,
  } = useEventDetail();

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

  if (isLoading) {
    return <EventDetailLoading />;
  }

  if (!event) {
    return <EventDetailNotFound />;
  }

  return (
    <section className="min-h-screen bg-[#FDFCFB] text-stone-800 pb-24 md:pb-0">
      <EventDetailNavbar
        event={event}
        isLiked={isLiked}
        userId={user?.id}
        onShare={handleShare}
        onLike={handleLike}
        onEdit={() => navigate(`/edit-event/${event.id}`)}
        onDelete={() => setShowDeleteConfirm(true)}
      />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <EventDetailHero event={event} onShare={handleShare} />
            <EventDetailInfo event={event} formattedDate={formattedDate} />
            {user?.id === event.userId && attendees.length > 0 && (
              <EventDetailAttendeeStack attendees={attendees} />
            )}
          </div>
          <div className="lg:col-span-2 space-y-4">
            <EventDetailSidebar
              event={event}
              eventStatus={eventStatus}
              isAttending={isAttending}
              isFull={isFull}
              attendeeCount={attendeeCount}
              formattedDate={formattedDate}
              hasCoords={hasCoords}
              onAttend={handleAttend}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          const deleted = await handleDelete();
          if (deleted) navigate('/');
        }}
        title="Eliminar evento"
        message={`¿Estás seguro de eliminar "${event.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />

      <ConfirmDialog
        open={showShareConfirm}
        onClose={() => setShowShareConfirm(false)}
        onConfirm={async () => {
          setShowShareConfirm(false);
          await handleAttend();
        }}
        title="Confirmar asistencia"
        message={`¿Confirmar tu asistencia a "${event.name}"?`}
        confirmLabel="Confirmar"
        cancelLabel="Ahora no"
        variant="info"
      />
    </section>
  );
};

export default EventDetailPage;
