import { useState, useEffect, useRef, useCallback } from 'react';

export type SensitivityLevel = 'low' | 'medium' | 'high';

const SENSITIVITY_THRESHOLDS: Record<SensitivityLevel, number> = {
  low: 0.60,
  medium: 0.45,
  high: 0.30,
};

interface UseBlowDetectionOptions {
  onBlow: () => void;
  enabled?: boolean;
  sensitivity?: SensitivityLevel;
}

export function useBlowDetection({
  onBlow,
  enabled = true,
  sensitivity = 'medium',
}: UseBlowDetectionOptions) {
  const [micState, setMicState] = useState<'prompt' | 'active' | 'denied' | 'unsupported'>('prompt');
  const [blowRatio, setBlowRatio] = useState<number>(0);
  const [rawLevel, setRawLevel] = useState<number>(0);
  const [isBlowing, setIsBlowing] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const onBlowRef = useRef(onBlow);

  onBlowRef.current = onBlow;

  const threshold = SENSITIVITY_THRESHOLDS[sensitivity];

  const stopListening = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setBlowRatio(0);
    setRawLevel(0);
    setIsBlowing(false);
  }, []);

  const startListening = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicState('unsupported');
      return false;
    }

    try {
      stopListening();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let blowCooldown = 0;

      const detectBlowLoop = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        let highFreqSum = 0;
        let lowFreqSum = 0;
        const midpoint = Math.floor(bufferLength / 2);

        for (let i = 0; i < bufferLength; i++) {
          if (i < midpoint) {
            lowFreqSum += dataArray[i];
          } else {
            highFreqSum += dataArray[i];
          }
        }

        const highAvg = highFreqSum / midpoint;
        const lowAvg = lowFreqSum / (bufferLength - midpoint);

        // Ratio of high frequencies to low frequencies
        // Air turbulence hitting the mic produces broadband white/pink noise with strong high freq presence
        const ratio = highAvg / (lowAvg + 1);
        const overallVolume = (highAvg + lowAvg) / 2;

        setBlowRatio(Math.min(1.5, ratio));
        setRawLevel(Math.min(100, overallVolume));

        const isExceeding = ratio > threshold && (highAvg > 12 || overallVolume > 15);
        setIsBlowing(isExceeding);

        if (isExceeding) {
          const now = Date.now();
          if (now - blowCooldown > 300) {
            blowCooldown = now;
            onBlowRef.current();
          }
        }

        animFrameIdRef.current = requestAnimationFrame(detectBlowLoop);
      };

      setMicState('active');
      animFrameIdRef.current = requestAnimationFrame(detectBlowLoop);
      return true;
    } catch (err) {
      console.warn('Microphone permission or hardware access issue:', err);
      setMicState('denied');
      return false;
    }
  }, [stopListening, threshold]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    micState,
    startListening,
    stopListening,
    blowRatio,
    rawLevel,
    isBlowing,
    threshold,
  };
}
