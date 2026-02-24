import type { DialedRecipe } from '../../types';
import { Card } from '../shared';

interface BeanRecipeProps {
  recipe: DialedRecipe;
  grindSetting?: string;
}

export function BeanRecipe({ recipe, grindSetting }: BeanRecipeProps) {
  return (
    <Card className="bg-dialed-light dark:bg-dialed-dm-bg border-dialed dark:border-dialed-dm-text/30">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-5 h-5 text-dialed-dark dark:text-dialed-dm-text"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="font-medium text-dialed-dark dark:text-dialed-dm-text">
          Dialed Recipe
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-dialed-dark/60 dark:text-dialed-dm-text/60">
            Dose
          </span>
          <p className="text-lg font-semibold text-dialed-dark dark:text-dialed-dm-text">
            {recipe.doseGrams}g
          </p>
        </div>
        <div>
          <span className="text-xs text-dialed-dark/60 dark:text-dialed-dm-text/60">
            Yield
          </span>
          <p className="text-lg font-semibold text-dialed-dark dark:text-dialed-dm-text">
            {recipe.yieldGrams}g
          </p>
        </div>
        <div>
          <span className="text-xs text-dialed-dark/60 dark:text-dialed-dm-text/60">
            Time
          </span>
          <p className="text-lg font-semibold text-dialed-dark dark:text-dialed-dm-text">
            {recipe.timeSeconds}s
          </p>
        </div>
        <div>
          <span className="text-xs text-dialed-dark/60 dark:text-dialed-dm-text/60">
            Ratio
          </span>
          <p className="text-lg font-semibold text-dialed-dark dark:text-dialed-dm-text">
            1:{recipe.ratio.toFixed(1)}
          </p>
        </div>
        {grindSetting && (
          <div className="col-span-2">
            <span className="text-xs text-dialed-dark/60 dark:text-dialed-dm-text/60">
              Grind Setting
            </span>
            <p className="text-lg font-semibold text-dialed-dark dark:text-dialed-dm-text">
              {grindSetting}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
