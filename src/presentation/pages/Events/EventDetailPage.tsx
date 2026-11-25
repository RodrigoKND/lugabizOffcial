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
import EventActionCard from '@presentation/components/features/events/detail/EventActionCard';
import EventPlaceCard from '@presentation/components/features/events/detail/EventPlaceCard';

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

  if (isLoading) return <EventDetailLoading />;
  if (!event) return <EventDetailNotFound />;

  return (
    <section className="min-h-screen bg-lg-ground text-lg-text pb-24 md:pb-8">
      <EventDetailNavbar
        event={event}
        isLiked={isLiked}
        userId={user?.id}
        onShare={handleShare}
        onLike={handleLike}
        onEdit={() => navigate(`/edit-event/${event.id}`)}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      {/* Celular: portada → acción → historia → lugar. Escritorio: portada e historia a la izquierda, acción y lugar a la derecha. */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-5">
          <div className="order-1 lg:col-span-3 lg:col-start-1 lg:row-start-1">
            <EventDetailHero event={event} formattedDate={formattedDate} />
          </div>
          <div className="order-2 lg:col-span-2 lg:col-start-4 lg:row-start-1">
            <EventActionCard
              event={event}
              eventStatus={eventStatus}
              isAttending={isAttending}
              isFull={isFull}
              attendeeCount={attendeeCount}
              onAttend={handleAttend}
            />
          </div>
          <div className="order-3 space-y-6 lg:col-span-3 lg:col-start-1 lg:row-start-2">
            <EventDetailInfo event={event} />
            {user?.id === event.userId && attendees.length > 0 && <EventDetailAttendeeStack attendees={attendees} />}
          </div>
          <div className="order-4 lg:col-span-2 lg:col-start-4 lg:row-start-2">
            <EventPlaceCard event={event} formattedDate={formattedDate} hasCoords={hasCoords} />
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
