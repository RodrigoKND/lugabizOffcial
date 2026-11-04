import type { EventAttendee } from '@domain/entities/EventDetailTypes';

interface EventDetailAttendeesProps {
  attendees: EventAttendee[];
}

export default function EventDetailAttendees({ attendees }: EventDetailAttendeesProps) {
  if (attendees.length === 0) return null;

  return (
    <div className="bg-lg-surface rounded-3xl p-6 border border-lg-surface-2">
      <h3 className="font-semibold text-lg-text mb-4">
        Asistentes ({attendees.length})
      </h3>
      <div className="flex flex-wrap gap-3">
        {attendees.map((a) => (
          <div key={a.id} className="flex items-center gap-2 bg-lg-surface-2 rounded-xl px-3 py-2">
            <img src={a.userAvatar || '/avatar.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
            <span className="text-sm font-medium text-lg-text">{a.userName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
