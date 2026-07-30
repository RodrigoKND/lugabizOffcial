import React, { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';

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
  const [playerReady, setPlayerReady] = useState(false);
  const [showSoundHint, setShowSoundHint] = useState(false);

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

  // embed.js swaps our <blockquote> for a real <iframe> once TikTok's player is ready.
  // Watching for that swap (instead of guessing a timeout) lets the loading skeleton
  // disappear right when the video is actually there, and only then surface the
  // "tap for sound" hint — showing it earlier would point at a still-loading player.
  useEffect(() => {
    if (!inView) return;
    const el = containerRef.current;
    if (!el) return;

    const container = el;
    let hintTimer: ReturnType<typeof setTimeout> | undefined;

    const onIframeLoad = () => {
      setPlayerReady(true);
      setShowSoundHint(true);
      hintTimer = setTimeout(() => setShowSoundHint(false), 4000);
    };

    const attachIfPresent = () => {
      const iframe = container.querySelector('iframe');
      if (iframe) { iframe.addEventListener('load', onIframeLoad, { once: true }); return true; }
      return false;
    };

    // Fallback in case embed.js is blocked (ad blockers) or TikTok never swaps in an
    // iframe — without this the loading skeleton would spin forever.
    const giveUpTimer = setTimeout(() => setPlayerReady(true), 10000);

    if (attachIfPresent()) {
      return () => { if (hintTimer) clearTimeout(hintTimer); clearTimeout(giveUpTimer); };
    }

    const mutationObserver = new MutationObserver(() => { if (attachIfPresent()) mutationObserver.disconnect(); });
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      if (hintTimer) clearTimeout(hintTimer);
      clearTimeout(giveUpTimer);
    };
  }, [inView, videoId]);

  const dismissHint = () => setShowSoundHint(false);

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden ${className ?? ''}`}>
      {fallbackImageUrl && (
        <img src={fallbackImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      )}

      {inView && !playerReady && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2.5 pointer-events-none">
          <div className="w-10 h-10 rounded-full border-2 border-white/15 border-t-white/80 animate-spin" />
          <p className="text-white/70 text-xs font-medium tracking-wide">Cargando video de TikTok…</p>
        </div>
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

      {/* Friendly nudge toward TikTok's own tap-to-unmute — TikTok exposes no API to control
          volume programmatically, so the real player must receive the tap. pointer-events-none
          keeps this purely informational so it never steals the tap it's pointing at. */}
      {playerReady && showSoundHint && (
        <div className="absolute top-4 inset-x-0 z-30 flex justify-center pointer-events-none">
          <button
            onClick={dismissHint}
            className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg pointer-events-auto animate-pulse"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            Toca el video para activar el sonido
          </button>
        </div>
      )}
    </div>
  );
};

export default TikTokHeroEmbed;
