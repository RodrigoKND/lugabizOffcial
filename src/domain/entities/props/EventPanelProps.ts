import type { Event } from '@domain/entities/Event';
import type { EventComment } from '@lib/supabase/services/events/eventComments';

export type PanelReplyTarget = { id: string; userName: string } | null;

export interface EventPanelProps {
  event: Event;
  userId?: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface EventPanelState {
  liked: boolean;
  likesCount: number;
  saved: boolean;
  comments: EventComment[];
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
  images: string[];
  dateStr: string;
  timeStr: string;
  tiktokId: string | null;
}

export interface EventPanelHandlers {
  toggleLike: () => void;
  toggleSave: () => void;
  setCommentText: (text: string) => void;
  setReplyTo: (target: PanelReplyTarget) => void;
  sendComment: () => Promise<void>;
  handleShare: () => Promise<void>;
  toggleExpanded: () => void;
  toggleShowVideo: () => void;
  setShowComments: (show: boolean) => void;
  navigatePrev: () => void;
  navigateNext: () => void;
  onImageLoad: () => void;
  onImageError: () => void;
  handleTouchStart: (clientX: number) => void;
  handleTouchEnd: (clientX: number) => void;
}
