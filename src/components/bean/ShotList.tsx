import type { Shot } from '../../types';
import { Card } from '../shared';

interface ShotListProps {
  shots: Shot[];
  onShotClick?: (shot: Shot) => void;
}

const balanceLabels: Record<number, string> = {
  [-2]: 'Very Sour',
  [-1]: 'Sour',
  [0]: 'Balanced',
  [1]: 'Bitter',
  [2]: 'Very Bitter',
};

export function ShotList({ shots, onShotClick }: ShotListProps) {
  if (shots.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-espresso-700 dark:text-steam-200">
        Shot History
      </h3>
      {shots.map((shot) => (
        <Card
          key={shot.id}
          padding="sm"
          className={`
            ${onShotClick ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''}
            ${shot.isDialedShot ? 'ring-2 ring-dialed dark:ring-dialed-dm-text' : ''}
          `}
          onClick={() => onShotClick?.(shot)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-espresso-700/50 dark:text-steam-400 w-6">
                #{shot.shotNumber}
              </span>
              <div className="text-sm">
                <span className="text-espresso-900 dark:text-steam-50">
                  {shot.doseGrams}g → {shot.yieldGrams}g
                </span>
                <span className="text-espresso-700/50 dark:text-steam-400 mx-2">
                  in {shot.timeSeconds}s
                </span>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-medium ${
                  shot.taste.balance === 0
                    ? 'text-dialed dark:text-dialed-dm-text'
                    : shot.taste.balance < 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}
              >
                {balanceLabels[shot.taste.balance]}
              </span>
              {shot.isDialedShot && (
                <div className="text-xs text-dialed dark:text-dialed-dm-text mt-0.5">
                  ★ Dialed
                </div>
              )}
            </div>
          </div>
          {shot.notes && (
            <p className="text-xs text-espresso-700/60 dark:text-steam-300 mt-1 ml-9">
              {shot.notes}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
