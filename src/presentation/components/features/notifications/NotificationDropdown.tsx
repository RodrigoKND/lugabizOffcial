import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MapPin, Calendar, Star, Megaphone, ClipboardList, CheckCheck, Clock } from 'lucide-react';
import { useAuth } from '@presentation/context';
import { AppNotification } from '@domain/entities';

function getNavUrl(n: AppNotification): string {
  // Edge functions always store the target URL in data.url — prefer it
  if (n.data?.url && typeof n.data.url === 'string') return n.data.url;

  switch (n.type) {
    case 'market_survey':
    case 'survey':
      return '/';
    case 'nearby':
    case 'new_place': {
      const pid = n.data?.place_id || (n.data?.places?.[0]);
      return pid ? `/place/${pid}` : '/';
    }
    case 'event_invite':
    case 'event_start':
      return n.data?.event_id ? `/event/${n.data.event_id}` : '/';
    case 'new_review':
      return n.data?.place_id ? `/place/${n.data.place_id}` : '/';
    default:
      return '/';
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'ahora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return date.toLocaleDateString();
}

function groupByDate(items: AppNotification[]): { label: string; items: AppNotification[] }[] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: { label: string; items: AppNotification[] }[] = [];
  const todayItems = items.filter(i => i.createdAt.toDateString() === today.toDateString());
  const yesterdayItems = items.filter(i => i.createdAt.toDateString() === yesterday.toDateString());
  const thisWeekItems = items.filter(i => i.createdAt > weekAgo && i.createdAt < yesterday);
  const olderItems = items.filter(i => i.createdAt <= weekAgo);

  if (todayItems.length) groups.push({ label: 'Hoy', items: todayItems });
  if (yesterdayItems.length) groups.push({ label: 'Ayer', items: yesterdayItems });
  if (thisWeekItems.length) groups.push({ label: 'Esta semana', items: thisWeekItems });
  if (olderItems.length) groups.push({ label: 'Anterior', items: olderItems });
  return groups;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markNotifAsRead, markAllNotifsAsRead } = useAuth();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const groups = groupByDate(notifications);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  // Lock scroll on mobile when open
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isMobile, open]);

  const handleNotifClick = async (n: AppNotification) => {
    if (!n.read) await markNotifAsRead(n.id);
    onClose();
    navigate(getNavUrl(n));
  };

  const renderContent = () => (
    <>
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell className="w-4 h-4 text-stone-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-[7px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-800 leading-none">Notificaciones</h3>
              <p className="text-[10px] text-stone-400 mt-0.5">Mantente al día</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllNotifsAsRead}
              className="text-[11px] font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg hover:bg-amber-50">
              <CheckCheck className="w-3 h-3" />
              Leer todas
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[28rem] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
        {notifications.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-5 h-5 text-stone-300" />
            </div>
            <p className="text-sm font-medium text-stone-700">Sin notificaciones</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Novedades aparecerán aquí</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <div className="px-4 pt-3 pb-1.5">
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">{group.label}</span>
              </div>
              {group.items.map((n, idx) => {
                const isUnread = !n.read;
                const isHovered = hoveredId === n.id;

                let icon: React.ReactNode;
                if (n.type === 'market_survey' || n.type === 'survey') {
                  icon = <ClipboardList className="w-3.5 h-3.5" />;
                } else if (n.type === 'nearby') {
                  icon = <MapPin className="w-3.5 h-3.5" />;
                } else if (n.type === 'event_invite') {
                  icon = <Calendar className="w-3.5 h-3.5" />;
                } else if (n.type === 'new_review') {
                  icon = <Star className="w-3.5 h-3.5" />;
                } else if (n.type === 'owner_announcement') {
                  icon = <Megaphone className="w-3.5 h-3.5" />;
                } else {
                  icon = <Bell className="w-3.5 h-3.5" />;
                }

                return (
                  <motion.button
                    key={n.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.025, duration: 0.2 }}
                    onClick={() => handleNotifClick(n)}
                    onMouseEnter={() => setHoveredId(n.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-all duration-150 border-b border-stone-50 last:border-0 ${
                      isHovered ? 'bg-amber-50/60' : ''
                    } ${isUnread ? 'bg-amber-50/30' : ''}`}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-150 ${
                      isUnread
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-stone-100 text-stone-400'
                    }`}>
                      {icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs leading-snug ${isUnread ? 'font-semibold text-stone-800' : 'text-stone-500'}`}>
                          {n.title}
                        </p>
                        {isUnread && (
                          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                        )}
                      </div>
                      {n.body && (
                        <p className={`text-[11px] mt-0.5 line-clamp-2 ${isUnread ? 'text-stone-600' : 'text-stone-400'}`}>
                          {n.body}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-2.5 h-2.5 text-stone-300" />
                        <span className="text-[10px] text-stone-400">{timeAgo(n.createdAt)}</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/50">
          <button onClick={() => { onClose(); navigate('/profile'); }}
            className="w-full text-center text-[11px] font-medium text-stone-500 hover:text-stone-700 transition-colors py-1.5 rounded-lg hover:bg-white">
            Ver historial completo
          </button>
        </div>
      )}
    </>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {isMobile ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={onClose}
            >
              <motion.div
                ref={ref}
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                className="fixed inset-x-4 top-16 bottom-24 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
                  {renderContent()}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
              className="fixed right-4 top-16 mt-2 w-[22rem] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] border border-stone-100 z-50 overflow-hidden"
            >
              {renderContent()}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
