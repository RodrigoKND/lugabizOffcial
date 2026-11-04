import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users } from 'lucide-react';
import type { EventAttendee } from '@domain/entities/EventDetailTypes';

interface Props {
  attendees: EventAttendee[];
}

export default function EventDetailAttendeeStack({ attendees }: Props) {
  const [showModal, setShowModal] = useState(false);
  if (attendees.length === 0) return null;

  const maxStack = 5;
  const visible = attendees.slice(0, maxStack);
  const remainder = attendees.length - maxStack;

  return (
    <>
      <button onClick={() => setShowModal(true)}
        className="group flex items-center gap-3 bg-lg-surface rounded-2xl px-4 py-3 border border-lg-surface-2 hover:border-lg-surface-2 transition-all w-fit">
        <div className="flex -space-x-2">
          {visible.map((a, i) => (
            <div key={a.id} className="relative"
              style={{ zIndex: maxStack - i }}>
              <img src={a.userAvatar || '/avatar.png'} alt=""
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
            </div>
          ))}
          {remainder > 0 && (
            <div className="w-8 h-8 rounded-full bg-lg-surface-2 text-lg-accent ring-2 ring-white flex items-center justify-center text-xs font-bold">
              +{remainder}
            </div>
          )}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-lg-text">{attendees.length} {attendees.length === 1 ? 'asistente confirmado' : 'asistentes confirmados'}</p>
          <p className="text-[10px] text-lg-dim">Ver lista completa</p>
        </div>
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-lg-surface rounded-3xl w-full max-w-sm max-h-[70vh] overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-lg-surface-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-lg-accent" />
                  <h3 className="font-bold text-lg-text text-sm">Asistentes ({attendees.length})</h3>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-lg-surface-2 transition-colors">
                  <X className="w-4 h-4 text-lg-dim" />
                </button>
              </div>
              <div className="overflow-y-auto p-5 space-y-3 max-h-[55vh]">
                {attendees.map((a) => (
                  <div key={a.id} className="flex items-center gap-3">
                    <img src={a.userAvatar || '/avatar.png'} alt=""
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-lg-surface-2" />
                    <span className="text-sm font-medium text-lg-text">{a.userName}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
