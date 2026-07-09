import React, { useEffect, useRef, useState } from 'react';

interface TikTokCardVideoProps {
  videoId: string;
  fallbackImageUrl?: string;
  className?: string;
}

const TikTokCardVideo: React.FC<TikTokCardVideoProps> = ({ videoId, fallbackImageUrl, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '150px 0px', threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className ?? ''}`}>
      {fallbackImageUrl && (
        <img
          src={fallbackImageUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {inView && (
        <iframe
          src={`https://www.tiktok.com/embed/v2/${videoId}?autoplay=1&muted=1&loop=1&controls=0`}
          className="absolute inset-0 w-full h-full"
          style={{ border: 0, pointerEvents: 'none' }}
          allow="autoplay; encrypted-media"
          loading="lazy"
          title="TikTok video"
        />
      )}
    </div>
  );
};

export default TikTokCardVideo;
