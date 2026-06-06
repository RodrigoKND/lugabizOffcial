import EventModal from '@presentation/components/features/events/modal/EventModal';
import { MappedEvent } from './EventSection.types';

interface EventSectionModalProps {
  event: MappedEvent | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const EventSectionModal = ({
  event,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: EventSectionModalProps) => {
  if (!event) return null;

  return (
    <EventModal
      event={event}
      onClose={onClose}
      onNext={onNext}
      onPrev={onPrev}
      hasNext={hasNext}
      hasPrev={hasPrev}
    />
  );
};

export default EventSectionModal;
