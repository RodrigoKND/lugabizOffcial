import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@presentation/context';
import { eventSharesService } from '@lib/supabase';
import { useEventComments } from '@presentation/hooks/useEventComments';
import { useEventLikes } from '@presentation/hooks/useEventLikes';
import { useEventSaves } from '@presentation/hooks/useEventSaves';

export type ReplyTarget = { id: string; userName: string } | null;

export function useEventModal(eventId: string) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyTarget>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  const { comments, addComment } = useEventComments(eventId);
  const { liked, likesCount, toggleLike } = useEventLikes(eventId, user?.id);
  const { saved, toggleSave } = useEventSaves(eventId, user?.id);

  const handleShare = useCallback(async () => {
    if (!user) { toast.error('Inicia sesión para compartir'); return; }
    setIsSharing(true);
    try {
      const share = await eventSharesService.createShare(eventId, user.id);
      await navigator.clipboard.writeText(share.sharedUrl);
      toast.success('Enlace de invitación copiado!');
    } catch {
      toast.error('Error al compartir');
    } finally {
      setIsSharing(false);
    }
  }, [user, eventId]);

  const handleSendComment = useCallback(async () => {
    if (!user) { toast.error('Inicia sesión para comentar'); return; }
    if (!comment.trim() || sendingComment) return;
    setSendingComment(true);
    const text = replyTo ? `@${replyTo.userName} ${comment.trim()}` : comment.trim();
    try {
      await addComment(user.id, text, replyTo?.id);
      setComment('');
      setReplyTo(null);
    } catch {
      toast.error('Error al enviar comentario');
    } finally {
      setSendingComment(false);
    }
  }, [user, comment, sendingComment, addComment, replyTo]);

  return {
    user,
    comment, setComment,
    replyTo, setReplyTo,
    isExpanded, setIsExpanded,
    isSharing,
    sendingComment,
    comments,
    liked, likesCount, toggleLike,
    saved, toggleSave,
    handleShare,
    handleSendComment,
  };
}
