import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Disc3, Play, Pause } from 'lucide-react';

interface YouTubeBackgroundMusicProps {
  videoId?: string;
  autoPlay?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubeBackgroundMusic: React.FC<YouTubeBackgroundMusicProps> = ({
  videoId = '1aokooixKIo',
  autoPlay = true,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const containerId = useRef(`yt-bg-player-${Math.random().toString(36).substring(2, 9)}`);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.unMute();
        playerRef.current.playVideo();
        setIsPlaying(true);
        setIsMuted(false);
      }
    } catch (e) {
      console.warn('Error toggling YT player:', e);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (e) {
      console.warn('Error muting YT player:', e);
    }
  }, [isMuted]);

  useEffect(() => {
    let isCancelled = false;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;

      try {
        playerRef.current = new window.YT.Player(containerId.current, {
          height: '1',
          width: '1',
          videoId,
          playerVars: {
            autoplay: autoPlay ? 1 : 0,
            controls: 0,
            loop: 1,
            playlist: videoId,
            playsinline: 1,
            disablekb: 1,
            fs: 0,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (isCancelled) return;
              setIsReady(true);
              if (autoPlay) {
                try {
                  event.target.playVideo();
                  setIsPlaying(true);
                } catch {
                  // Browser autoplay restriction
                }
              }
            },
            onStateChange: (event: any) => {
              if (isCancelled) return;
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
              }
            },
          },
        });
      } catch (err) {
        console.warn('Failed to initialize YouTube player:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };

      if (!document.getElementById('youtube-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
    }

    // Auto-attempt play on first user interaction if blocked by browser
    const handleFirstInteraction = () => {
      if (!hasInteracted && playerRef.current) {
        setHasInteracted(true);
        try {
          playerRef.current.playVideo();
          setIsPlaying(true);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      isCancelled = true;
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [videoId, autoPlay, hasInteracted]);

  return (
    <div className="flex items-center gap-2">
      {/* Hidden YouTube Iframe Container */}
      <div
        id={containerId.current}
        className="pointer-events-none fixed -top-96 -left-96 opacity-0"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Retro Vinyl Music Badge & Controls */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 hover:bg-white text-[#4a3030] shadow-md border border-[#f3d2d9] text-xs font-bold transition-all">
        {/* Spinning Vinyl Icon */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex items-center gap-1.5 text-xs font-bold hover:text-[#b1583b] transition-colors cursor-pointer"
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          <Disc3
            className={`w-4 h-4 text-[#c96a4b] transition-transform ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '4s' }}
          />
          <span className="hidden sm:inline font-mono text-[11px] truncate max-w-[150px]">
            Sparks — Coldplay 🎵
          </span>
          <span className="sm:hidden font-mono text-[11px]">
            Sparks 🎵
          </span>
        </button>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="p-1 rounded-full hover:bg-stone-100 text-[#4a3030] transition-colors cursor-pointer"
          aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>

        {/* Mute Button */}
        <button
          type="button"
          onClick={toggleMute}
          className="p-1 rounded-full hover:bg-stone-100 text-[#4a3030] transition-colors cursor-pointer"
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
