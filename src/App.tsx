import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { PixelCake, CandleData } from './components/PixelCake';
import { BreathMeter } from './components/BreathMeter';
import { OpenWhenLetters } from './components/OpenWhenLetters';
import { generateCandles } from './utils/candles';
import { useBlowDetection, SensitivityLevel } from './hooks/useBlowDetection';
import {
  playExtinguishPuff,
  playBlowWhoosh,
  playHappyBirthdayChiptune,
  stopBirthdayMelody,
} from './utils/audio';
import { Sparkles, RefreshCw, Mail } from 'lucide-react';

export default function App() {
  const initialParams = new URLSearchParams(window.location.search);
  const [currentPage, setCurrentPage] = useState<'cake' | 'letters'>(() => {
    return initialParams.get('page') === 'letters' ? 'letters' : 'cake';
  });

  const candleCount = 21;
  const customWish = 'Happy Birthday My Love! Wishing you all the love and happiness in the world!! 💖🎉';
  const [subtitle, setSubtitle] = useState<string>('Make a wish and blow candles.');
  const [candles, setCandles] = useState<CandleData[]>(() => generateCandles(candleCount));
  const [allBlown, setAllBlown] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('medium');

  // Responsive scale for pixel art cake
  const [cakeScale, setCakeScale] = useState<number>(7.5);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const maxDim = Math.min(w - 32, h - 340);
      const computedScale = Math.min(8.0, Math.max(3.8, maxDim / 64));
      setCakeScale(computedScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigateToPage = (newPage: 'cake' | 'letters') => {
    setCurrentPage(newPage);
    const url = new URL(window.location.href);
    if (newPage === 'letters') {
      url.searchParams.set('page', 'letters');
    } else {
      url.searchParams.delete('page');
    }
    window.history.replaceState({}, '', url.toString());
  };

  // Trigger celebration effects
  const triggerCelebration = useCallback(() => {
    setAllBlown(true);
    setSubtitle(customWish);

    if (soundEnabled) {
      playHappyBirthdayChiptune();
    }

    // Confetti cannon burst
    try {
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch {
      // Confetti fallback
    }
  }, [customWish, soundEnabled]);

  // Blow out candles with staggered delays
  const blowOutCandles = useCallback(() => {
    if (allBlown) return;

    if (soundEnabled) {
      playBlowWhoosh();
    }

    setCandles((prevCandles) => {
      const unblown = prevCandles.filter((c) => !c.blown);
      if (unblown.length === 0) return prevCandles;

      prevCandles.forEach((candle) => {
        if (!candle.blown) {
          const delay = Math.random() * 900;
          setTimeout(() => {
            if (soundEnabled) {
              playExtinguishPuff();
            }
            setCandles((current) =>
              current.map((c) => (c.id === candle.id ? { ...c, blown: true } : c))
            );
          }, delay);
        }
      });

      return prevCandles;
    });

    setTimeout(() => {
      triggerCelebration();
    }, 1200);
  }, [allBlown, soundEnabled, triggerCelebration]);

  // Click single candle to blow it out individually
  const handleCandleClick = useCallback(
    (id: number) => {
      if (soundEnabled) {
        playExtinguishPuff();
      }
      setCandles((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, blown: true } : c));
        const allExtinguished = next.every((c) => c.blown);
        if (allExtinguished && !allBlown) {
          setTimeout(() => {
            triggerCelebration();
          }, 400);
        }
        return next;
      });
    },
    [allBlown, soundEnabled, triggerCelebration]
  );

  // Relight all candles
  const handleRelight = () => {
    stopBirthdayMelody();
    setCandles((prev) => prev.map((c) => ({ ...c, blown: false })));
    setAllBlown(false);
    setSubtitle('Make a wish and blow candles.');
  };

  // Blow detection via microphone
  const {
    micState,
    startListening,
    stopListening,
    blowRatio,
    isBlowing,
    threshold,
  } = useBlowDetection({
    onBlow: blowOutCandles,
    sensitivity,
  });

  // If user navigates to "Open When Letters" page:
  if (currentPage === 'letters') {
    return (
      <OpenWhenLetters
        onBackToCake={() => navigateToPage('cake')}
        recipientName="my love"
      />
    );
  }

  // Otherwise render Birthday Cake Page:
  return (
    <div className="min-h-screen bg-[#feefe5] flex flex-col justify-between items-center px-4 py-4 sm:py-6 select-none overflow-x-hidden">
      {/* Top Bar: Title and Letters navigation button */}
      <header className="w-full max-w-xl flex items-center justify-between gap-2 px-2 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🎂</span>
          <span className="font-bold text-base sm:text-lg pixel-font text-stone-800 tracking-wide">
            Birthday Candles
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick link to Open When Letters */}
          <button
            type="button"
            onClick={() => navigateToPage('letters')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-stone-700 text-xs sm:text-sm font-bold border border-[#d97757]/30 shadow-xs transition-colors cursor-pointer"
            title="Go to Open When Letters"
          >
            <Mail className="w-4 h-4 text-[#e07a5f]" />
            <span>Letters ✉️</span>
          </button>
        </div>
      </header>

      {/* Main Content: Birthday Greetings + Animated Pixel Cake */}
      <main className="flex-1 flex flex-col items-center justify-center my-auto w-full">
        {/* Headings */}
        <div className="text-center px-2 mb-2 max-w-lg">
          <h1
            id="mainTitle"
            className="text-2xl sm:text-4xl md:text-5xl font-bold pixel-font text-stone-800 tracking-wide transition-all"
          >
            Happy Birthday My Love!
          </h1>
          <p
            id="subTitle"
            className={`text-sm sm:text-base md:text-lg pixel-font mt-2 sm:mt-3 leading-relaxed transition-all duration-300 max-w-md mx-auto ${
              allBlown
                ? 'text-[#c94b32] font-bold animate-pulse'
                : 'text-stone-600'
            }`}
          >
            {subtitle}
          </p>
        </div>

        {/* The Animated Pixel Art Cake Container */}
        <div className="relative flex items-center justify-center py-2 sm:py-4">
          <PixelCake
            candles={candles}
            onCandleClick={handleCandleClick}
            scale={cakeScale}
          />
        </div>

        {/* Lit Candles Counter Badge & Relight */}
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100/90 text-amber-900 border border-amber-300 pixel-font">
            {allBlown ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                All {candleCount} candles blown! 🎉
              </>
            ) : (
              <>
                <span>🕯️</span>
                {candles.filter((c) => !c.blown).length} of {candleCount} candles lit
              </>
            )}
          </span>

          {allBlown && (
            <button
              type="button"
              onClick={handleRelight}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#e07a5f] hover:bg-[#d0694e] text-white shadow-xs transition-colors pixel-font cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Relight
            </button>
          )}
        </div>

        {/* NEXT PAGE BUTTON (Appears prominently when candles are blown out) */}
        {allBlown && (
          <div className="mt-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom duration-500">
            <button
              type="button"
              onClick={() => navigateToPage('letters')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#e07a5f] via-[#d95d39] to-[#c94b32] hover:brightness-110 text-white font-bold text-sm sm:text-base shadow-xl ring-4 ring-[#e07a5f]/25 hover:scale-105 active:scale-95 transition-all pixel-font cursor-pointer"
            >
              <Mail className="w-5 h-5 text-amber-200 animate-bounce" />
              <span>Click to View Letters ✉️→</span>
            </button>
            <p className="text-xs text-stone-500 mt-2 pixel-font">
              Your wish is made, my love! Tap to open your birthday letters.
            </p>
          </div>
        )}
      </main>

      {/* Bottom Controls: Microphone Blow Detection & Manual Trigger */}
      <footer className="w-full flex flex-col items-center pb-2">
        <BreathMeter
          micState={micState}
          onStartMic={startListening}
          onStopMic={stopListening}
          onManualBlow={blowOutCandles}
          blowRatio={blowRatio}
          threshold={threshold}
          isBlowing={isBlowing}
          sensitivity={sensitivity}
          onSensitivityChange={setSensitivity}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          allBlown={allBlown}
          onRelight={handleRelight}
        />

        <p className="text-[11px] text-stone-500 mt-2 text-center pixel-font">
          Tip: Blow gently into your device microphone or tap the candles!
        </p>
      </footer>
    </div>
  );
}
