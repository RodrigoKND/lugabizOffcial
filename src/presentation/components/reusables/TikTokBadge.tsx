import React from 'react';
import { Music2 } from 'lucide-react';

interface TikTokBadgeProps {
  className?: string;
}

const TikTokBadge: React.FC<TikTokBadgeProps> = ({ className }) => (
  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm text-white shrink-0 ${className ?? ''}`}>
    <Music2 className="w-3.5 h-3.5" />
  </span>
);

export default TikTokBadge;
