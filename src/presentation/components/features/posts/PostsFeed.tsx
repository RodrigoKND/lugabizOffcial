import { useState, useEffect, useCallback } from 'react';
import { Store, Plus } from 'lucide-react';
import { postsService } from '@lib/supabase/services/posts/posts';
import { BusinessPost } from '@domain/entities/Post';
import { useAuth } from '@presentation/context';
import BusinessPostCard from './BusinessPostCard';
import CreatePostModal from './CreatePostModal';

const PAGE_SIZE = 9;

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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl border border-primary-100/40 overflow-hidden animate-pulse">
              <div style={{ aspectRatio: '4/3' }} className="bg-stone-100" />
              <div className="px-3 py-2.5 space-y-2">
                <div className="h-2.5 bg-stone-200 rounded w-1/2" />
                <div className="h-2 bg-stone-100 rounded w-full" />
                <div className="h-2 bg-stone-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts - horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
        {posts.map(post => (
          <div key={post.id} className="snap-start shrink-0 w-[280px] sm:w-[300px]">
            <BusinessPostCard
              post={post}
              onDeleted={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
            />
          </div>
        ))}
      </div>

      {/* Load more */}
      {!loading && posts.length > 0 && hasMore && !compact && (
        <button
          onClick={() => load(false)}
          disabled={loading}
          className="w-full py-3 rounded-xl border border-primary-100 text-primary-600 text-sm font-semibold hover:bg-primary-50 transition-colors disabled:opacity-50"
        >
          {loading ? 'Cargando…' : 'Ver más posts'}
        </button>
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
