import React from 'react';

export interface CandleData {
  id: number;
  colorClass: 'green-candle' | 'purple-candle' | 'blue-candle' | 'yellow-candle';
  top: string;
  left: string;
  blown: boolean;
}

interface PixelCakeProps {
  candles: CandleData[];
  onCandleClick?: (id: number) => void;
  scale?: number;
}

export const PixelCake: React.FC<PixelCakeProps> = ({
  candles,
  onCandleClick,
  scale = 7.5,
}) => {
  // Cake base pixel art is 64x64px.
  // When scaled by `scale`, total visual bounding box is approximately (64 * scale) px.
  const visualDimension = 64 * scale;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{
        width: `${visualDimension}px`,
        height: `${visualDimension}px`,
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    >
      <div
        className="cake"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transformOrigin: '0 0',
          transform: `scale(${scale})`,
        }}
      >
        {candles.map((candle) => (
          <React.Fragment key={candle.id}>
            {/* The animated pixel art candle */}
            <div
              className={`candle ${candle.colorClass} ${candle.blown ? 'blown' : ''}`}
              style={{
                position: 'absolute',
                top: candle.top,
                left: candle.left,
                pointerEvents: 'none',
              }}
            />

            {/* Click/Tap hit target in cake coordinate space */}
            <button
              type="button"
              onClick={() => onCandleClick?.(candle.id)}
              disabled={candle.blown}
              title={candle.blown ? 'Extinguished' : 'Click or tap to blow out this candle'}
              aria-label={candle.blown ? 'Blown out candle' : 'Lit candle. Click to blow out'}
              style={{
                position: 'absolute',
                top: candle.top,
                left: candle.left,
                width: '6px',
                height: '11px',
                transform: 'translate(-2px, -3px)',
                cursor: candle.blown ? 'default' : 'pointer',
                background: 'transparent',
                border: 'none',
                padding: 0,
                zIndex: 15,
              }}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
