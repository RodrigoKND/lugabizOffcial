import { Heart, MessageCircle, Bookmark, Share2, Loader2 } from 'lucide-react';

interface ActionsProps {
  liked: boolean;
  likesCount: number;
  commentsCount: number;
  saved: boolean;
  showComments: boolean;
  isSharing: boolean;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onToggleSave: () => void;
  onShare: () => void;
  horizontal?: boolean;
}

export function EventModalActions({
  liked, likesCount, commentsCount, saved, showComments, isSharing,
  onToggleLike, onToggleComments, onToggleSave, onShare, horizontal,
}: ActionsProps) {
  if (horizontal) {
    return (
      <div className="flex items-center justify-around">
        <button onClick={onToggleLike} className="flex flex-col items-center gap-1">
          <Heart className={`w-5 h-5 ${liked ? 'text-pink-400 fill-pink-400' : 'text-white/70'}`} />
          <span className="text-white/50 text-[10px] font-medium">{likesCount}</span>
        </button>

        <button onClick={onToggleComments} className="flex flex-col items-center gap-1">
          <MessageCircle className={`w-5 h-5 ${showComments ? 'text-amber-400' : 'text-white/70'}`} />
          <span className="text-white/50 text-[10px] font-medium">{commentsCount}</span>
        </button>

        <button onClick={onToggleSave} className="flex flex-col items-center gap-1">
          <Bookmark className={`w-5 h-5 ${saved ? 'text-amber-400 fill-amber-400' : 'text-white/70'}`} />
        </button>

        <button onClick={onShare} disabled={isSharing} className="flex flex-col items-center gap-1">
          {isSharing ? <Loader2 className="w-5 h-5 text-white/70 animate-spin" /> : <Share2 className="w-5 h-5 text-white/70" />}
        </button>
      </div>
    );
  }

  return (
    <div className="absolute right-2 bottom-28 flex flex-col items-center gap-3">
      <button onClick={onToggleLike} className="flex flex-col items-center gap-0.5">
        <div className={`p-2 rounded-full backdrop-blur-sm transition-all ${liked ? 'bg-pink-500/40' : 'bg-white/15'}`}>
          <Heart className={`w-5 h-5 ${liked ? 'text-pink-400 fill-pink-400' : 'text-white'}`} />
        </div>
        <span className="text-white text-[10px] font-bold">{likesCount}</span>
      </button>

      <button onClick={onToggleComments} className="flex flex-col items-center gap-0.5">
        <div className={`p-2 rounded-full backdrop-blur-sm transition-all ${showComments ? 'bg-amber-500/40' : 'bg-white/15'}`}>
          <MessageCircle className={`w-5 h-5 ${showComments ? 'text-amber-400' : 'text-white'}`} />
        </div>
        <span className="text-white text-[10px] font-bold">{commentsCount}</span>
      </button>

      <button onClick={onToggleSave} className="flex flex-col items-center gap-0.5">
        <div className={`p-2 rounded-full backdrop-blur-sm transition-all ${saved ? 'bg-amber-500/40' : 'bg-white/15'}`}>
          <Bookmark className={`w-5 h-5 ${saved ? 'text-amber-400 fill-amber-400' : 'text-white'}`} />
        </div>
      </button>

      <button onClick={onShare} disabled={isSharing} className="flex flex-col items-center gap-0.5">
        <div className="p-2 rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all">
          {isSharing ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Share2 className="w-5 h-5 text-white" />}
        </div>
      </button>
    </div>
  );
}
