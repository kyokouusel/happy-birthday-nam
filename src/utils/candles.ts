import { CandleData } from '../components/PixelCake';

export const CANDLE_COLORS: Array<CandleData['colorClass']> = [
  'green-candle',
  'purple-candle',
  'blue-candle',
  'yellow-candle',
];

const CAKE_VISUAL_WIDTH = 35;
const CANDLE_VISUAL_WIDTH = 2;
const CANDLES_PER_ROW = 6;
const SHIFT_AMOUNT = 4;

export function generateCandles(count: number): CandleData[] {
  const clampedCount = Math.min(Math.max(count, 1), 30);
  const candles: CandleData[] = [];

  for (let i = 0; i < clampedCount; i++) {
    const colorClass = CANDLE_COLORS[i % CANDLE_COLORS.length];
    const row = Math.floor(i / CANDLES_PER_ROW);
    const col = i % CANDLES_PER_ROW;

    const totalCandlesInRow = Math.min(
      CANDLES_PER_ROW,
      clampedCount - row * CANDLES_PER_ROW
    );
    const rowSpacing = CAKE_VISUAL_WIDTH / (totalCandlesInRow + 1);

    const leftBase = rowSpacing * (col + 1) - CANDLE_VISUAL_WIDTH / 2 + 5;
    const rowShift = row % 2 === 0 ? 0 : SHIFT_AMOUNT;

    const top = `${10 + row * 3}px`;
    const left = `${leftBase - rowShift + 4}px`;

    candles.push({
      id: i,
      colorClass,
      top,
      left,
      blown: false,
    });
  }

  return candles;
}
