import { type ChangeEvent } from 'react';
import { type BalanceValue } from '../../types';

interface TasteSliderProps {
  value: BalanceValue;
  onChange: (value: BalanceValue) => void;
  disabled?: boolean;
}

const balanceLabels: Record<BalanceValue, string> = {
  [-2]: 'Very Sour',
  [-1]: 'Slightly Sour',
  [0]: 'Balanced',
  [1]: 'Slightly Bitter',
  [2]: 'Very Bitter',
};

export function TasteSlider({ value, onChange, disabled }: TasteSliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value) as BalanceValue);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-espresso-700/60 dark:text-steam-300 mb-2">
        <span>Sour</span>
        <span>Bitter</span>
      </div>

      <input
        type="range"
        min={-2}
        max={2}
        step={1}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="
          w-full h-1 rounded-full appearance-none cursor-pointer
          bg-crema-200 dark:bg-roast-700
          disabled:opacity-50 disabled:cursor-not-allowed
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-caramel-500
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-caramel-500
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:cursor-pointer
        "
      />

      <div className="mt-2 text-center">
        <span className="text-sm font-medium text-espresso-900 dark:text-steam-50">
          {balanceLabels[value]}
        </span>
      </div>
    </div>
  );
}
