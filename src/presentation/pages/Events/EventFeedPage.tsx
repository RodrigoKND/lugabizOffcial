import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@presentation/context';
import { useEventFeed } from '@presentation/hooks/events/useEventFeed';
import { useEventViewTracker } from '@presentation/hooks/events/useEventViewTracker';
import { EventPanel } from '@presentation/components/features/events/feed/EventPanel';
import { FeedLoadingState } from '@presentation/components/features/events/feed/FeedLoadingState';
import { FeedEmptyState } from '@presentation/components/features/events/feed/FeedEmptyState';
import { FeedProgressBar } from '@presentation/components/features/events/feed/FeedProgressBar';

const EventFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, currentIndex, loading, goNext, goPrev } = useEventFeed();

  useEventViewTracker(user, events, currentIndex, loading);

  if (loading) return <FeedLoadingState />;
  if (events.length === 0) return <FeedEmptyState />;

  const current = events[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-0 md:p-4"
      onClick={() => navigate(-1)}
    >
      <div
        className="relative flex items-center justify-center w-full h-full max-w-5xl mx-auto"
        onClick={e => e.stopPropagation()}
      >
        <FeedProgressBar total={events.length} currentIndex={currentIndex} />

        {currentIndex > 0 && (
          <button onClick={e => { e.stopPropagation(); goPrev(); }}
            className="hidden md:flex absolute -left-5 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border border-white/10 backdrop-blur-sm shadow-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full md:rounded-2xl overflow-hidden"
          >
            <EventPanel
              event={current}
              userId={user?.id}
              onClose={() => navigate(-1)}
              onNext={goNext}
              onPrev={goPrev}
              hasNext={currentIndex < events.length - 1}
              hasPrev={currentIndex > 0}
            />
          </motion.div>
        </AnimatePresence>

        {currentIndex < events.length - 1 && (
          <button onClick={e => { e.stopPropagation(); goNext(); }}
            className="hidden md:flex absolute -right-5 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border border-white/10 backdrop-blur-sm shadow-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EventFeedPage;
