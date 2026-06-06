import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Store, Plus, ChevronRight } from 'lucide-react';
import { postsService } from '@lib/supabase/services/posts/posts';
import { BusinessPost } from '@domain/entities/Post';
import { useAuth } from '@presentation/context';
import BusinessPostCard from './BusinessPostCard';
import CreatePostModal from './CreatePostModal';

const PAGE_SIZE = 5;

interface PostsFeedProps {
  compact?: boolean;
}

const PostsFeed: React.FC<PostsFeedProps> = ({ compact = false }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BusinessPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const isOwner = user?.isOwner || user?.role === 'owner';

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    const offset = reset ? 0 : page * PAGE_SIZE;
    const data = await postsService.getPosts(PAGE_SIZE + 1, offset, user?.id);
    const slice = data.slice(0, PAGE_SIZE);
    setHasMore(data.length > PAGE_SIZE);
    setPosts(prev => reset ? slice : [...prev, ...slice]);
    if (!reset) setPage(p => p + 1);
    setLoading(false);
  }, [page, user?.id]);

  useEffect(() => { load(true); }, []);

  function handleCreated(post: BusinessPost) {
    setPosts(prev => [post, ...prev]);
  }

  if (!loading && posts.length === 0 && !isOwner) return null;

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-primary-500" />
          <h2 className="font-bold text-sm uppercase tracking-wide text-text-primary">Posts de Negocios</h2>
        </div>
        {isOwner && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white rounded-xl text-xs font-semibold hover:bg-primary-600 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Publicar
          </button>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && posts.length === 0 && (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-primary-100/40 overflow-hidden animate-pulse">
              <div className="flex items-center gap-3 px-4 py-4">
                <div className="w-10 h-10 rounded-full bg-stone-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-stone-200 rounded w-1/3" />
                  <div className="h-2.5 bg-stone-100 rounded w-1/4" />
                </div>
              </div>
              <div className="h-48 bg-stone-100" />
              <div className="px-4 py-3 space-y-2">
                <div className="h-3 bg-stone-100 rounded w-full" />
                <div className="h-3 bg-stone-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {(compact ? posts.slice(0, 3) : posts).map(post => (
          <BusinessPostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load more / See all */}
      {!loading && posts.length > 0 && (
        compact && posts.length > 3 ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary-100 text-primary-600 text-sm font-semibold hover:bg-primary-50 transition-colors"
            onClick={() => {}}
          >
            Ver todos los posts
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        ) : hasMore && !compact ? (
          <button
            onClick={() => load(false)}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-primary-100 text-primary-600 text-sm font-semibold hover:bg-primary-50 transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando…' : 'Ver más posts'}
          </button>
        ) : null
      )}

      {/* Owner empty state */}
      {!loading && posts.length === 0 && isOwner && (
        <div className="text-center py-10 px-6">
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3">
            <Store className="w-7 h-7 text-primary-300" />
          </div>
          <p className="font-bold text-text-primary mb-1">Publica tu primer post</p>
          <p className="text-sm text-text-secondary mb-4">Comparte novedades, fotos y ofertas flash con la comunidad.</p>
          <button onClick={() => setCreateOpen(true)}
            className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors shadow-sm">
            Crear post
          </button>
        </div>
      )}

      <CreatePostModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
    </section>
  );
};

export default PostsFeed;
