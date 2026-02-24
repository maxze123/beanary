import type { Shot } from '../../types';
import { Card } from '../shared';
import { formatRatio, getBalanceLabel, getBalanceColor } from '../../utils/calculations';
import { generateGuidance } from '../../utils/guidance';
import { GuidanceCard } from '../guidance';

interface ShotComparisonProps {
  currentShot: Shot;
  previousShot?: Shot | null;
  onMarkAsDialed?: () => void;
  isDialLoading?: boolean;
}

export function ShotComparison({
  currentShot,
  previousShot,
  onMarkAsDialed,
  isDialLoading,
}: ShotComparisonProps) {
  // Generate guidance based on current and previous shot
  const guidance = generateGuidance({
    currentShot,
    previousShot: previousShot || null,
  });

  const formatDelta = (current: number, previous: number, unit: string): string => {
    const diff = current - previous;
    if (diff === 0) return `0${unit}`;
    return diff > 0 ? `+${diff}${unit}` : `${diff}${unit}`;
  };

  return (
    <div className="space-y-4">
      {/* Current Shot Result */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-espresso-900 dark:text-steam-50">
            Shot #{currentShot.shotNumber}
          </span>
          <span className={`text-sm font-medium ${getBalanceColor(currentShot.taste.balance)}`}>
            {getBalanceLabel(currentShot.taste.balance)}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <span className="text-xs text-espresso-700/60 dark:text-steam-300">Dose</span>
            <p className="font-semibold text-espresso-900 dark:text-steam-50">
              {currentShot.doseGrams}g
            </p>
          </div>
          <div>
            <span className="text-xs text-espresso-700/60 dark:text-steam-300">Yield</span>
            <p className="font-semibold text-espresso-900 dark:text-steam-50">
              {currentShot.yieldGrams}g
            </p>
          </div>
          <div>
            <span className="text-xs text-espresso-700/60 dark:text-steam-300">Time</span>
            <p className="font-semibold text-espresso-900 dark:text-steam-50">
              {currentShot.timeSeconds}s
            </p>
          </div>
          <div>
            <span className="text-xs text-espresso-700/60 dark:text-steam-300">Ratio</span>
            <p className="font-semibold text-espresso-900 dark:text-steam-50">
              {formatRatio(currentShot.ratio)}
            </p>
          </div>
        </div>

        {currentShot.grindSetting && (
          <p className="text-xs text-espresso-700/60 dark:text-steam-300 mt-2">
            Grind: {currentShot.grindSetting}
          </p>
        )}

        {currentShot.notes && (
          <p className="text-sm text-espresso-700 dark:text-steam-200 mt-2 italic">
            &ldquo;{currentShot.notes}&rdquo;
          </p>
        )}
      </Card>

      {/* Comparison with previous */}
      {previousShot && (
        <Card className="bg-crema-50 dark:bg-roast-800">
          <span className="text-xs text-espresso-700/60 dark:text-steam-300 block mb-2">
            vs Shot #{previousShot.shotNumber}
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <span className="text-espresso-700/60 dark:text-steam-400">Yield</span>
              <p className="font-medium text-espresso-900 dark:text-steam-50">
                {formatDelta(currentShot.yieldGrams, previousShot.yieldGrams, 'g')}
              </p>
            </div>
            <div>
              <span className="text-espresso-700/60 dark:text-steam-400">Time</span>
              <p className="font-medium text-espresso-900 dark:text-steam-50">
                {formatDelta(currentShot.timeSeconds, previousShot.timeSeconds, 's')}
              </p>
            </div>
            <div>
              <span className="text-espresso-700/60 dark:text-steam-400">Previous</span>
              <p className={`font-medium ${getBalanceColor(previousShot.taste.balance)}`}>
                {getBalanceLabel(previousShot.taste.balance)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Guidance */}
      <GuidanceCard guidance={guidance} />

      {/* Mark as Dialed button */}
      {currentShot.taste.balance === 0 && onMarkAsDialed && (
        <button
          onClick={onMarkAsDialed}
          disabled={isDialLoading}
          className="
            w-full py-3 px-4 rounded-xl
            bg-dialed-light dark:bg-dialed-dm-bg
            text-dialed-dark dark:text-dialed-dm-text
            font-medium
            flex items-center justify-center gap-2
            hover:bg-dialed/20 dark:hover:bg-dialed-dm-bg/80
            disabled:opacity-50
            transition-colors
          "
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {isDialLoading ? 'Saving...' : 'Mark as Dialed'}
        </button>
      )}
    </div>
  );
}
