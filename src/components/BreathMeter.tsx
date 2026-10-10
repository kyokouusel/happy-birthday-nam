import React from 'react';
import { Mic, MicOff, Wind, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { SensitivityLevel } from '../hooks/useBlowDetection';

interface BreathMeterProps {
  micState: 'prompt' | 'active' | 'denied' | 'unsupported';
  onStartMic: () => void;
  onStopMic: () => void;
  onManualBlow: () => void;
  blowRatio: number;
  threshold: number;
  isBlowing: boolean;
  sensitivity: SensitivityLevel;
  onSensitivityChange: (s: SensitivityLevel) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  allBlown: boolean;
  onRelight: () => void;
}

export const BreathMeter: React.FC<BreathMeterProps> = ({
  micState,
  onStartMic,
  onStopMic,
  onManualBlow,
  blowRatio,
  threshold,
  isBlowing,
  sensitivity,
  onSensitivityChange,
  soundEnabled,
  onToggleSound,
  allBlown,
  onRelight,
}) => {
  const percentage = Math.min(100, Math.round((blowRatio / (threshold * 1.6)) * 100));
  const thresholdPct = Math.round((threshold / (threshold * 1.6)) * 100);

  return (
    <div className="w-full max-w-md mx-auto px-4 mt-2">
      <div className="bg-[#fff7ee] border-2 border-[#d97757]/30 rounded-2xl p-4 shadow-sm">
        {/* Top bar: Mic status centered + Sound toggle on the side */}
        <div className="relative flex items-center justify-center mb-3 min-h-[38px]">
          {/* Centered Mic Status / Enable Button */}
          <div className="flex items-center justify-center">
            {micState === 'active' ? (
              <button
                type="button"
                onClick={onStopMic}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 transition-colors shadow-xs"
                title="Microphone active. Click to pause."
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <Mic className="w-3.5 h-3.5 text-emerald-600" />
                Mic Listening
              </button>
            ) : micState === 'denied' ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                <MicOff className="w-3.5 h-3.5" />
                Mic Blocked (Use button)
              </span>
            ) : micState === 'unsupported' ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                Mic not supported
              </span>
            ) : (
              <button
                type="button"
                onClick={onStartMic}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#e07a5f] hover:bg-[#d0694e] text-white shadow-md transition-transform active:scale-95"
              >
                <Mic className="w-4 h-4 animate-bounce" />
                Enable Mic to Blow 🎙️
              </button>
            )}
          </div>

          {/* Sound toggle pinned to right */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
            <button
              type="button"
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                  : 'bg-stone-100 border-stone-200 text-stone-500 hover:bg-stone-200'
              }`}
              title={soundEnabled ? '8-Bit Chiptune Sound: ON' : 'Sound: OFF'}
              aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Breath Meter Bar */}
        {micState === 'active' && (
          <div className="mb-3 space-y-1">
            <div className="flex justify-between items-center text-xs text-stone-600 pixel-font">
              <span>{isBlowing ? '🌬️ Breath detected!' : 'Gently blow on device mic...'}</span>
              <span className="font-mono text-[11px] text-stone-400">
                {Math.round(blowRatio * 100)}%
              </span>
            </div>
            <div className="relative h-3 w-full bg-stone-200 rounded-full overflow-hidden border border-stone-300">
              {/* Threshold indicator line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                style={{ left: `${thresholdPct}%` }}
                title="Blow threshold"
              />
              <div
                className={`h-full transition-all duration-75 rounded-full ${
                  isBlowing
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm'
                    : 'bg-gradient-to-r from-amber-300 to-amber-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-stone-400 pt-0.5">
              <span>Breath Energy</span>
              <div className="flex gap-2">
                <span>Sensitivity:</span>
                {(['low', 'medium', 'high'] as SensitivityLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onSensitivityChange(level)}
                    className={`capitalize ${
                      sensitivity === level
                        ? 'font-bold text-[#e07a5f] underline'
                        : 'hover:text-stone-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons: Blow Out or Relight */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {!allBlown ? (
            <button
              type="button"
              onClick={onManualBlow}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-sm active:scale-95 transition-transform"
            >
              <Wind className="w-4 h-4 animate-pulse" />
              Blow Out Candles 💨
            </button>
          ) : (
            <button
              type="button"
              onClick={onRelight}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm active:scale-95 transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              Make Another Wish (Relight 🕯️)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
