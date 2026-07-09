import React, { useEffect, useRef, useState } from 'react';

interface TikTokHeroEmbedProps {
  videoId: string;
  videoUrl: string;
  fallbackImageUrl?: string;
  className?: string;
}

/**
 * TikTok has no API to force silent/looping autoplay or strip its own UI (captions,
 * creator name, sound attribution are always interactive per their docs) — this renders
 * their real, official embed (blockquote + embed.js), which the viewer taps to play.
 */
const TikTokHeroEmbed: React.FC<TikTokHeroEmbedProps> = ({ videoId, videoUrl, fallbackImageUrl, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: '200px 0px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    // TikTok's embed.js only scans the DOM for unprocessed blockquotes when it executes,
    // so a fresh <script> is injected on each mount to (re)trigger hydration in this SPA.
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [inView, videoId]);

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden ${className ?? ''}`}>
      {fallbackImageUrl && (
        <img src={fallbackImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      )}
      {inView && (
        <blockquote
          className="tiktok-embed relative z-10"
          cite={videoUrl}
          data-video-id={videoId}
          style={{ maxWidth: '100%', minWidth: '260px', margin: 0 }}
        >
          <section>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">Ver en TikTok</a>
          </section>
        </blockquote>
      )}
    </div>
  );
};

export default TikTokHeroEmbed;
