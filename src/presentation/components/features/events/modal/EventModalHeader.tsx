import { X, MoreHorizontal } from 'lucide-react';
import type { Event } from './EventModal.types';

interface HeaderProps {
  event: Event;
  onClose: () => void;
}

export function EventModalHeader({ event, onClose }: HeaderProps) {
  return (
    <>
      <button onClick={onClose} className="absolute top-3 right-3 z-20 bg-black/40 backdrop-blur-sm p-1.5 rounded-full hover:bg-black/60 transition-all">
        <X className="w-4 h-4 text-white" />
      </button>

      <div className="flex items-center gap-2.5">
        <div className={`p-[1.5px] rounded-full ${event.organizer.isNew ? 'bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-500' : 'bg-stone-500'}`}>
          <div className="p-[1.5px] bg-black rounded-full">
            <img src={event.organizer.avatar || '/avatar.png'} alt={event.organizer.name} className="w-8 h-8 rounded-full object-cover" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-xs truncate">{event.organizer.name}</p>
          <p className="text-white/60 text-[10px]">{event.category}</p>
        </div>
        <button className="text-white/60 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
      </div>
    </>
  );
}
