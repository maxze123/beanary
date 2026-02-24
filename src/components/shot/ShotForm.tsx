import { useState } from 'react';
import { Button, Input, TasteSlider } from '../shared';
import { calculateRatio, formatRatio } from '../../utils/calculations';
import type { CreateShotInput, BalanceValue, Shot } from '../../types';

export type ShotPrefill = Pick<Shot, 'doseGrams' | 'yieldGrams' | 'timeSeconds' | 'grindSetting'> & {
  taste?: { balance: BalanceValue };
  notes?: string;
};

interface ShotFormProps {
  beanId: string;
  previousShot?: ShotPrefill | null;
  onSubmit: (input: CreateShotInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function ShotForm({
  beanId,
  previousShot,
  onSubmit,
  onCancel,
  submitLabel = 'Log Shot',
  isLoading = false,
}: ShotFormProps) {
  // Pre-fill from previous shot if available
  const [doseGrams, setDoseGrams] = useState(previousShot?.doseGrams?.toString() || '18');
  const [yieldGrams, setYieldGrams] = useState(previousShot?.yieldGrams?.toString() || '');
  const [timeSeconds, setTimeSeconds] = useState(previousShot?.timeSeconds?.toString() || '');
  const [grindSetting, setGrindSetting] = useState(previousShot?.grindSetting || '');
  const [balance, setBalance] = useState<BalanceValue>(previousShot?.taste?.balance ?? 0);
  const [notes, setNotes] = useState(previousShot?.notes || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate ratio in real-time
  const dose = parseFloat(doseGrams) || 0;
  const yieldG = parseFloat(yieldGrams) || 0;
  const ratio = calculateRatio(dose, yieldG);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const doseNum = parseFloat(doseGrams);
    if (!doseGrams || isNaN(doseNum) || doseNum <= 0) {
      newErrors.doseGrams = 'Enter a valid dose';
    } else if (doseNum > 30) {
      newErrors.doseGrams = 'Dose seems too high';
    }

    const yieldNum = parseFloat(yieldGrams);
    if (!yieldGrams || isNaN(yieldNum) || yieldNum <= 0) {
      newErrors.yieldGrams = 'Enter a valid yield';
    } else if (yieldNum > 100) {
      newErrors.yieldGrams = 'Yield seems too high';
    }

    const timeNum = parseFloat(timeSeconds);
    if (!timeSeconds || isNaN(timeNum) || timeNum <= 0) {
      newErrors.timeSeconds = 'Enter a valid time';
    } else if (timeNum > 120) {
      newErrors.timeSeconds = 'Time seems too long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      beanId,
      doseGrams: parseFloat(doseGrams),
      yieldGrams: parseFloat(yieldGrams),
      timeSeconds: parseFloat(timeSeconds),
      grindSetting: grindSetting.trim(),
      taste: { balance },
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Dose / Yield / Time row */}
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Dose (g)"
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="18"
          value={doseGrams}
          onChange={(e) => setDoseGrams(e.target.value)}
          error={errors.doseGrams}
          disabled={isLoading}
        />
        <Input
          label="Yield (g)"
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="36"
          value={yieldGrams}
          onChange={(e) => setYieldGrams(e.target.value)}
          error={errors.yieldGrams}
          disabled={isLoading}
        />
        <Input
          label="Time (s)"
          type="number"
          inputMode="numeric"
          placeholder="28"
          value={timeSeconds}
          onChange={(e) => setTimeSeconds(e.target.value)}
          error={errors.timeSeconds}
          disabled={isLoading}
        />
      </div>

      {/* Ratio display */}
      {ratio > 0 && (
        <div className="text-center py-2">
          <span className="text-sm text-espresso-700/60 dark:text-steam-300">Ratio: </span>
          <span className="text-lg font-semibold text-espresso-900 dark:text-steam-50">
            {formatRatio(ratio)}
          </span>
        </div>
      )}

      {/* Grind setting */}
      <Input
        label="Grind Setting (optional)"
        placeholder="e.g., 2.5 or 15 clicks"
        value={grindSetting}
        onChange={(e) => setGrindSetting(e.target.value)}
        disabled={isLoading}
      />

      {/* Taste slider */}
      <div>
        <label className="block text-xs text-espresso-700/60 dark:text-steam-300 mb-2">
          How did it taste?
        </label>
        <TasteSlider value={balance} onChange={setBalance} disabled={isLoading} />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs text-espresso-700/60 dark:text-steam-300 mb-1">
          Notes (optional)
        </label>
        <textarea
          className="
            w-full px-3 py-2 rounded-lg
            bg-crema-50 dark:bg-roast-800
            border border-crema-200 dark:border-roast-600
            text-espresso-900 dark:text-steam-50
            placeholder:text-crema-400 dark:placeholder:text-steam-400
            focus:outline-none focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
          "
          rows={2}
          placeholder="Any observations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
