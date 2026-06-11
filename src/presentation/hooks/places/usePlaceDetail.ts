import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usePlaces, useAuth } from '@presentation/context';
import { placesService, placeSharesService, reviewsService } from '@lib/supabase';
import { realtimeService } from '@lib/supabase/services/notifications/websocket';
import { userActivityService } from '@lib/supabase/services/places/userActivity';
import { Place, Review } from '@domain/entities';

export function usePlaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlaceById, places } = usePlaces();
  const { user, isSaved, toggleSavedPlace } = useAuth();
  const [place, setPlace] = useState<Place | null>(() => getPlaceById(id || '') || null);
  const [isLoadingPlace, setIsLoadingPlace] = useState(!getPlaceById(id || ''));
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const REVIEWS_PER_PAGE = 5;

  const isPlaceSaved = user && isSaved(place?.id || '');

  useEffect(() => {
    if (!id) return;
    const found = getPlaceById(id);
    if (found) {
      setPlace(found);
      setIsLoadingPlace(false);
      if (user?.id) {
        userActivityService.trackAction(user.id, 'view_place', {
          place: id,
          placeName: found.name,
          category: found.category?.name,
          socialGroups: (found.socialGroups ?? []).map((sg: any) => sg.name),
        }).catch(() => {});
      }
      return;
    }
    setIsLoadingPlace(true);
    placesService.getPlaceById(id)
      .then(p => {
        setPlace(p);
        if (p && user?.id) {
          userActivityService.trackAction(user.id, 'view_place', {
            place: id,
            placeName: p.name,
            category: p.category?.name,
            socialGroups: (p.socialGroups ?? []).map((sg: any) => sg.name),
          }).catch(() => {});
        }
      })
      .catch(() => { setPlace(null); })
      .finally(() => setIsLoadingPlace(false));
  }, [id, places]);

  const loadReviews = useCallback(async (page: number, append: boolean = false) => {
    if (!id) return;
    try {
      const data = await reviewsService.getReviewsForPlace(id, REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);
      if (append) {
        setReviews(prev => [...prev, ...data]);
      } else {
        setReviews(data);
      }
      setHasMoreReviews(data.length === REVIEWS_PER_PAGE);
    } catch {}
  }, [id]);

  useEffect(() => {
    setReviewPage(0);
    loadReviews(0, false);
  }, [id, loadReviews]);

  useEffect(() => {
    if (!id) return;
    return realtimeService.subscribeToReviews((payload) => {
      if (payload.eventType === 'INSERT') {
        const newReview = payload.new;
        if (newReview.parent_id) return;
        const reviewWithUser: Review = {
          id: newReview.id,
          userId: newReview.user_id,
          userName: user?.name || 'Usuario',
          userAvatar: user?.avatar,
          rating: newReview.rating,
          comment: newReview.comment,
          parentId: newReview.parent_id,
          createdAt: new Date(newReview.created_at),
        };
        setReviews(prev => [reviewWithUser, ...prev]);
      }
    }, id);
  }, [id, user]);

  const loadMoreReviews = useCallback(() => {
    const nextPage = reviewPage + 1;
    setReviewPage(nextPage);
    loadReviews(nextPage, true);
  }, [reviewPage, loadReviews]);

  const sharePlace = useCallback(async () => {
    if (!place || !user) return;
    try {
      const share = await placeSharesService.createShare(place.id, user.id);
      const shareUrl = share.sharedUrl;
      const shareData: ShareData = {
        title: `${place.name} | Lugabiz`,
        text: `🌟 ${user.name} te invita a visitar ${place.name}\n\n${place.description}\n\n📍 ${place.address}`,
        url: shareUrl,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Enlace de invitación copiado!');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        toast.error('Error al compartir');
      }
    }
  }, [place, user]);

  const handleDelete = useCallback(async () => {
    if (!place) return;
    try {
      const { placesService } = await import('@lib/supabase');
      await placesService.deletePlace(place.id);
      toast.success('Lugar eliminado');
      navigate('/');
    } catch {
      toast.error('Error al eliminar');
    }
  }, [place, navigate]);

  return {
    id,
    navigate,
    place,
    isLoadingPlace,
    user,
    isPlaceSaved,
    reviews,
    hasMoreReviews,
    loadMoreReviews,
    showDeleteConfirm,
    setShowDeleteConfirm,
    sharePlace,
    handleDelete,
    toggleSavedPlace,
  };
}
