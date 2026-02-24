import { useNavigate } from 'react-router-dom';
import type { Bean } from '../../types';
import { Card, CardDivider, DialedBadge, ProgressBadge, StarRating } from '../shared';

interface BeanCardProps {
  bean: Bean;
  shotCount?: number;
}

export function BeanCard({ bean, shotCount = 0 }: BeanCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/bean/${bean.id}`);
  };

  return (
    <Card
      className="cursor-pointer active:scale-[0.99] transition-transform"
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h2 className="font-medium text-espresso-900 dark:text-steam-50 truncate">
            {bean.name}
          </h2>
          <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-0.5 truncate">
            {bean.roaster}
          </p>
        </div>
        <div className="ml-2 flex-shrink-0">
          {bean.isDialedIn ? (
            <DialedBadge />
          ) : shotCount > 0 ? (
            <ProgressBadge />
          ) : null}
        </div>
      </div>

      {/* Recipe (if dialed) */}
      {bean.dialedRecipe && (
        <CardDivider>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-espresso-700/60 dark:text-steam-300">Dose</span>
              <p className="font-medium text-espresso-900 dark:text-steam-50">
                {bean.dialedRecipe.doseGrams}g
              </p>
            </div>
            <div className="text-espresso-700/30 dark:text-steam-400">→</div>
            <div>
              <span className="text-espresso-700/60 dark:text-steam-300">Yield</span>
              <p className="font-medium text-espresso-900 dark:text-steam-50">
                {bean.dialedRecipe.yieldGrams}g
              </p>
            </div>
            <div className="text-espresso-700/30 dark:text-steam-400">in</div>
            <div>
              <span className="text-espresso-700/60 dark:text-steam-300">Time</span>
              <p className="font-medium text-espresso-900 dark:text-steam-50">
                {bean.dialedRecipe.timeSeconds}s
              </p>
            </div>
            <div className="ml-auto">
              <span className="text-espresso-700/60 dark:text-steam-300">Ratio</span>
              <p className="font-medium text-espresso-900 dark:text-steam-50">
                1:{bean.dialedRecipe.ratio.toFixed(1)}
              </p>
            </div>
          </div>
        </CardDivider>
      )}

      {/* Progress hint (if not dialed but has shots) */}
      {!bean.isDialedIn && shotCount > 0 && (
        <CardDivider>
          <p className="text-sm text-espresso-700/60 dark:text-steam-300">
            {shotCount} shot{shotCount !== 1 ? 's' : ''} logged
          </p>
        </CardDivider>
      )}

      {/* Empty hint (if no shots) */}
      {!bean.isDialedIn && shotCount === 0 && (
        <CardDivider>
          <p className="text-sm text-espresso-700/60 dark:text-steam-300">
            No shots yet · Tap to start dialing
          </p>
        </CardDivider>
      )}

      {/* Rating (if set) */}
      {bean.rating && (
        <div className="mt-3">
          <StarRating value={bean.rating} readonly size="sm" />
        </div>
      )}
    </Card>
  );
}
