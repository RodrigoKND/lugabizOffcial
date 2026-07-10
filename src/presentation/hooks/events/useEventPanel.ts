import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { extractTikTokVideoId } from '@infrastructure/utils/socialLinks';
import { useEventLikes } from '@presentation/hooks/useEventLikes';
import { useEventSaves } from '@presentation/hooks/useEventSaves';
import { useEventComments } from '@presentation/hooks/useEventComments';
import { eventSharesService } from '@lib/supabase';
import type { Event } from '@domain/entities';
import type { EventPanelState, EventPanelHandlers, PanelReplyTarget } from '@domain/entities/props/EventPanelProps';

interface LocalState {
  commentText: string;
  replyTo: PanelReplyTarget;
  sending: boolean;
  sharing: boolean;
  expanded: boolean;
  imgIdx: number;
  imgLoaded: boolean;
  imgError: boolean;
  showComments: boolean;
  isMobile: boolean;
  showVideo: boolean;
}

function getInitState(hasTikTok: boolean): LocalState {
  return {
    commentText: '',
    replyTo: null,
    sending: false,
    sharing: false,
    expanded: false,
    imgIdx: 0,
    imgLoaded: false,
    imgError: false,
    showComments: false,
    isMobile: window.innerWidth < 768,
    showVideo: hasTikTok,
  };
}

export function useEventPanel(
  event: Event,
  userId?: string,
  onPrev?: () => void,
  onNext?: () => void,
  hasPrev?: boolean,
  hasNext?: boolean,
) {
  const { liked, likesCount, toggleLike } = useEventLikes(event.id, userId);
  const { saved, toggleSave } = useEventSaves(event.id, userId);
  const { comments, addComment } = useEventComments(event.id);

  const tiktokId = extractTikTokVideoId(event.socialLinks?.tiktok);
  const images = [event.image, ...(event.gallery ?? [])].filter(Boolean) as string[];
  const dateStr = new Date(event.dateStart).toLocaleDateString('es', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
  const timeStr = event.timeStart + (event.timeEnd ? ` – ${event.timeEnd}` : '');

  const [local, setLocal] = useState<LocalState>(() => getInitState(!!tiktokId));

  const inputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const touchX = useRef(0);

  useEffect(() => {
    const check = () => setLocal(s => ({ ...s, isMobile: window.innerWidth < 768 }));
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!local.isMobile || local.showComments) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, local.isMobile, local.showComments]);

  useEffect(() => {
    if (local.replyTo) inputRef.current?.focus();
  }, [local.replyTo]);

  const sendComment = useCallback(async () => {
    if (!userId || !local.commentText.trim() || local.sending) return;
    setLocal(s => ({ ...s, sending: true }));
    const text = local.replyTo
      ? `@${local.replyTo.userName} ${local.commentText.trim()}`
      : local.commentText.trim();
    try {
      await addComment(userId, text, local.replyTo?.id ?? undefined);
      setLocal(s => ({ ...s, commentText: '', replyTo: null }));
    } catch {
      toast.error('Error al enviar comentario');
    }
    setLocal(s => ({ ...s, sending: false }));
  }, [userId, local.commentText, local.sending, local.replyTo, addComment]);

  const handleShare = useCallback(async () => {
    if (!userId) { toast.error('Inicia sesión para compartir'); return; }
    setLocal(s => ({ ...s, sharing: true }));
    try {
      const share = await eventSharesService.createShare(event.id, userId);
      await navigator.clipboard.writeText(share.sharedUrl);
      toast.success('Enlace copiado');
    } catch {
      toast.error('Error al compartir');
    }
    setLocal(s => ({ ...s, sharing: false }));
  }, [userId, event.id]);

  const navigatePrev = useCallback(() => {
    if (local.imgIdx > 0) {
      setLocal(s => ({ ...s, imgIdx: s.imgIdx - 1, imgLoaded: false }));
    } else if (hasPrev && onPrev) {
      onPrev();
    }
  }, [local.imgIdx, hasPrev, onPrev]);

  const navigateNext = useCallback(() => {
    if (local.imgIdx < images.length - 1) {
      setLocal(s => ({ ...s, imgIdx: s.imgIdx + 1, imgLoaded: false }));
    } else if (hasNext && onNext) {
      onNext();
    }
  }, [local.imgIdx, images.length, hasNext, onNext]);

  const handleTouchStart = useCallback((clientX: number) => {
    touchX.current = clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (clientX: number) => {
      const d = touchX.current - clientX;
      if (Math.abs(d) > 50) {
        d > 0 ? navigateNext() : navigatePrev();
      }
    },
    [navigateNext, navigatePrev],
  );

  const state: EventPanelState = {
    liked,
    likesCount,
    saved,
    comments,
    commentText: local.commentText,
    replyTo: local.replyTo,
    sending: local.sending,
    sharing: local.sharing,
    expanded: local.expanded,
    imgIdx: local.imgIdx,
    imgLoaded: local.imgLoaded,
    imgError: local.imgError,
    showComments: local.showComments,
    isMobile: local.isMobile,
    showVideo: local.showVideo,
    images,
    dateStr,
    timeStr,
    tiktokId,
  };

  const handlers: EventPanelHandlers = {
    toggleLike,
    toggleSave,
    setCommentText: text => setLocal(s => ({ ...s, commentText: text })),
    setReplyTo: target => setLocal(s => ({ ...s, replyTo: target })),
    sendComment,
    handleShare,
    toggleExpanded: () => setLocal(s => ({ ...s, expanded: !s.expanded })),
    toggleShowVideo: () => setLocal(s => ({ ...s, showVideo: !s.showVideo })),
    setShowComments: show => setLocal(s => ({ ...s, showComments: show })),
    navigatePrev,
    navigateNext,
    onImageLoad: () => setLocal(s => ({ ...s, imgLoaded: true })),
    onImageError: () => setLocal(s => ({ ...s, imgError: true })),
    handleTouchStart,
    handleTouchEnd,
  };

  return { state, handlers, inputRef, commentsEndRef };
}
