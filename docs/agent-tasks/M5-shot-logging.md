# Agent Task: M5 - Shot Logging

**Milestone:** M5  
**Agent:** Claude Code  
**Estimated time:** 60-90 minutes  
**Depends on:** M4 (Bean Library) complete

---

## Context

You are building the shot logging and dial-in flow for "Beanary", an espresso dial-in companion app. This is the core workflow—users log shots, see comparisons, and mark their recipe as "dialed."

Read the following documentation files before starting:
- `/docs/03-data-models.md` — Shot type definition
- `/docs/05-design-system.md` — Visual design specs
- `/docs/04-feature-milestones.md` — M5 acceptance criteria

---

## Objective

Build the complete shot logging feature:
- Log shot form (dose, yield, time, grind, taste, notes)
- Auto-calculated ratio display
- Comparison with previous shot
- "Mark as Dialed" action
- Pre-fill from previous shot or dialed recipe

**Success criteria:**
- Can log a new shot for a bean
- Ratio calculates correctly and displays
- After logging, user sees comparison with previous shot
- Can mark any shot as "dialed"
- Marking as dialed updates bean's dialedRecipe
- Shot list shows all shots in order
- Shot numbers increment correctly
- Form validates inputs (dose > 0, etc.)
- All tests pass

---

## Files to Create/Modify

```
src/components/shot/
├── ShotForm.tsx
├── ShotForm.test.tsx
├── ShotComparison.tsx
├── ShotComparison.test.tsx
└── index.ts

src/stores/
├── shotStore.ts
├── shotStore.test.ts
└── index.ts (update)

src/pages/
└── LogShot.tsx (update)

src/utils/
├── calculations.ts
└── calculations.test.ts
```

---

## Step-by-Step Instructions

### 1. Create Calculation Utilities

Create `src/utils/calculations.ts`:

```typescript
/**
 * Calculate the ratio from dose and yield.
 * Returns rounded to 2 decimal places.
 */
export function calculateRatio(doseGrams: number, yieldGrams: number): number {
  if (doseGrams <= 0) return 0;
  return Math.round((yieldGrams / doseGrams) * 100) / 100;
}

/**
 * Format ratio for display (e.g., "1:2.2")
 */
export function formatRatio(ratio: number): string {
  return `1:${ratio.toFixed(1)}`;
}

/**
 * Format time for display (e.g., "28s" or "1:05")
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get a human-readable label for a balance value.
 */
export function getBalanceLabel(balance: number): string {
  const labels: Record<number, string> = {
    [-2]: 'Very Sour',
    [-1]: 'Slightly Sour',
    [0]: 'Balanced',
    [1]: 'Slightly Bitter',
    [2]: 'Very Bitter',
  };
  return labels[balance] || 'Unknown';
}

/**
 * Get a color class for a balance value.
 */
export function getBalanceColor(balance: number): string {
  if (balance === 0) return 'text-dialed dark:text-dialed-dm-text';
  if (balance < 0) return 'text-amber-600 dark:text-amber-400';
  return 'text-orange-600 dark:text-orange-400';
}
```

Create `src/utils/calculations.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  calculateRatio,
  formatRatio,
  formatTime,
  getBalanceLabel,
  getBalanceColor,
} from './calculations';

describe('calculateRatio', () => {
  it('calculates ratio correctly', () => {
    expect(calculateRatio(18, 36)).toBe(2);
    expect(calculateRatio(18, 40)).toBe(2.22);
    expect(calculateRatio(20, 40)).toBe(2);
  });

  it('handles edge cases', () => {
    expect(calculateRatio(0, 36)).toBe(0);
    expect(calculateRatio(-1, 36)).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateRatio(18, 41)).toBe(2.28);
    expect(calculateRatio(17, 39)).toBe(2.29);
  });
});

describe('formatRatio', () => {
  it('formats ratio with 1 decimal place', () => {
    expect(formatRatio(2)).toBe('1:2.0');
    expect(formatRatio(2.22)).toBe('1:2.2');
    expect(formatRatio(2.5)).toBe('1:2.5');
  });
});

describe('formatTime', () => {
  it('formats seconds under 60', () => {
    expect(formatTime(28)).toBe('28s');
    expect(formatTime(45)).toBe('45s');
  });

  it('formats seconds over 60', () => {
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(120)).toBe('2:00');
  });
});

describe('getBalanceLabel', () => {
  it('returns correct labels', () => {
    expect(getBalanceLabel(-2)).toBe('Very Sour');
    expect(getBalanceLabel(-1)).toBe('Slightly Sour');
    expect(getBalanceLabel(0)).toBe('Balanced');
    expect(getBalanceLabel(1)).toBe('Slightly Bitter');
    expect(getBalanceLabel(2)).toBe('Very Bitter');
  });
});

describe('getBalanceColor', () => {
  it('returns green for balanced', () => {
    expect(getBalanceColor(0)).toContain('dialed');
  });

  it('returns amber for sour', () => {
    expect(getBalanceColor(-1)).toContain('amber');
    expect(getBalanceColor(-2)).toContain('amber');
  });

  it('returns orange for bitter', () => {
    expect(getBalanceColor(1)).toContain('orange');
    expect(getBalanceColor(2)).toContain('orange');
  });
});
```

### 2. Create Shot Store

Create `src/stores/shotStore.ts`:

```typescript
import { create } from 'zustand';
import type { Shot } from '../types';
import type { CreateShotInput } from '../types';
import {
  getShotsForBean,
  getLatestShotForBean,
  createShot,
  deleteShot,
} from '../db';

interface ShotState {
  shots: Shot[];
  latestShot: Shot | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadShots: (beanId: string) => Promise<void>;
  loadLatestShot: (beanId: string) => Promise<void>;
  addShot: (input: CreateShotInput) => Promise<Shot>;
  removeShot: (id: string, beanId: string) => Promise<void>;
  clearShots: () => void;
  clearError: () => void;
}

export const useShotStore = create<ShotState>((set) => ({
  shots: [],
  latestShot: null,
  isLoading: false,
  error: null,

  loadShots: async (beanId: string) => {
    set({ isLoading: true, error: null });
    try {
      const shots = await getShotsForBean(beanId);
      const latestShot = shots.length > 0 ? shots[shots.length - 1] : null;
      set({ shots, latestShot, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to load shots', isLoading: false });
    }
  },

  loadLatestShot: async (beanId: string) => {
    try {
      const shot = await getLatestShotForBean(beanId);
      set({ latestShot: shot || null });
    } catch (e) {
      // Silent fail - not critical
    }
  },

  addShot: async (input: CreateShotInput) => {
    set({ isLoading: true, error: null });
    try {
      const shot = await createShot(input);
      const shots = await getShotsForBean(input.beanId);
      set({ shots, latestShot: shot, isLoading: false });
      return shot;
    } catch (e) {
      set({ error: 'Failed to log shot', isLoading: false });
      throw e;
    }
  },

  removeShot: async (id: string, beanId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteShot(id);
      const shots = await getShotsForBean(beanId);
      const latestShot = shots.length > 0 ? shots[shots.length - 1] : null;
      set({ shots, latestShot, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to delete shot', isLoading: false });
      throw e;
    }
  },

  clearShots: () => set({ shots: [], latestShot: null }),

  clearError: () => set({ error: null }),
}));
```

Create `src/stores/shotStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useShotStore } from './shotStore';
import { useBeanStore } from './beanStore';
import { resetDatabase } from '../db';

describe('shotStore', () => {
  let testBeanId: string;

  beforeEach(async () => {
    await resetDatabase();
    useShotStore.setState({
      shots: [],
      latestShot: null,
      isLoading: false,
      error: null,
    });
    
    // Create a test bean
    const bean = await useBeanStore.getState().addBean({
      name: 'Test Bean',
      roaster: 'Test Roaster',
    });
    testBeanId = bean.id;
  });

  it('starts with empty state', () => {
    const state = useShotStore.getState();
    expect(state.shots).toEqual([]);
    expect(state.latestShot).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('loads empty shots list', async () => {
    await useShotStore.getState().loadShots(testBeanId);
    const state = useShotStore.getState();
    expect(state.shots).toEqual([]);
    expect(state.latestShot).toBeNull();
  });

  it('adds a shot', async () => {
    const shot = await useShotStore.getState().addShot({
      beanId: testBeanId,
      doseGrams: 18,
      yieldGrams: 36,
      timeSeconds: 28,
      taste: { balance: 0 },
    });

    expect(shot.doseGrams).toBe(18);
    expect(shot.ratio).toBe(2);
    
    const state = useShotStore.getState();
    expect(state.shots).toHaveLength(1);
    expect(state.latestShot?.id).toBe(shot.id);
  });

  it('tracks shot numbers', async () => {
    const shot1 = await useShotStore.getState().addShot({
      beanId: testBeanId,
      doseGrams: 18,
      yieldGrams: 36,
      timeSeconds: 24,
      taste: { balance: -1 },
    });
    
    const shot2 = await useShotStore.getState().addShot({
      beanId: testBeanId,
      doseGrams: 18,
      yieldGrams: 36,
      timeSeconds: 28,
      taste: { balance: 0 },
    });

    expect(shot1.shotNumber).toBe(1);
    expect(shot2.shotNumber).toBe(2);
  });

  it('removes a shot', async () => {
    const shot = await useShotStore.getState().addShot({
      beanId: testBeanId,
      doseGrams: 18,
      yieldGrams: 36,
      timeSeconds: 28,
      taste: { balance: 0 },
    });

    await useShotStore.getState().removeShot(shot.id, testBeanId);

    const state = useShotStore.getState();
    expect(state.shots).toHaveLength(0);
    expect(state.latestShot).toBeNull();
  });

  it('clears shots', async () => {
    await useShotStore.getState().addShot({
      beanId: testBeanId,
      doseGrams: 18,
      yieldGrams: 36,
      timeSeconds: 28,
      taste: { balance: 0 },
    });

    useShotStore.getState().clearShots();

    const state = useShotStore.getState();
    expect(state.shots).toEqual([]);
    expect(state.latestShot).toBeNull();
  });
});
```

### 3. Update Stores Index

Update `src/stores/index.ts`:

```typescript
export { useBeanStore } from './beanStore';
export { useShotStore } from './shotStore';
```

### 4. Create ShotForm Component

Create `src/components/shot/ShotForm.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { Button, Input, TasteSlider } from '../shared';
import { calculateRatio, formatRatio } from '../../utils/calculations';
import type { CreateShotInput, BalanceValue, Shot } from '../../types';

interface ShotFormProps {
  beanId: string;
  previousShot?: Shot | null;
  onSubmit: (input: CreateShotInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ShotForm({
  beanId,
  previousShot,
  onSubmit,
  onCancel,
  isLoading = false,
}: ShotFormProps) {
  // Pre-fill from previous shot if available
  const [doseGrams, setDoseGrams] = useState(previousShot?.doseGrams?.toString() || '18');
  const [yieldGrams, setYieldGrams] = useState(previousShot?.yieldGrams?.toString() || '');
  const [timeSeconds, setTimeSeconds] = useState(previousShot?.timeSeconds?.toString() || '');
  const [grindSetting, setGrindSetting] = useState(previousShot?.grindSetting || '');
  const [balance, setBalance] = useState<BalanceValue>(0);
  const [notes, setNotes] = useState('');

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
          {isLoading ? 'Saving...' : 'Log Shot'}
        </Button>
      </div>
    </form>
  );
}
```

Create `src/components/shot/ShotForm.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShotForm } from './ShotForm';

describe('ShotForm', () => {
  const defaultProps = {
    beanId: 'bean-123',
    onSubmit: vi.fn(),
  };

  it('renders all input fields', () => {
    render(<ShotForm {...defaultProps} />);
    expect(screen.getByLabelText('Dose (g)')).toBeInTheDocument();
    expect(screen.getByLabelText('Yield (g)')).toBeInTheDocument();
    expect(screen.getByLabelText('Time (s)')).toBeInTheDocument();
    expect(screen.getByLabelText('Grind Setting (optional)')).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', () => {
    render(<ShotForm {...defaultProps} />);
    
    // Clear default dose value and submit
    fireEvent.change(screen.getByLabelText('Dose (g)'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Log Shot'));
    
    expect(screen.getByText('Enter a valid dose')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid yield')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid time')).toBeInTheDocument();
  });

  it('calculates and displays ratio', () => {
    render(<ShotForm {...defaultProps} />);
    
    fireEvent.change(screen.getByLabelText('Dose (g)'), { target: { value: '18' } });
    fireEvent.change(screen.getByLabelText('Yield (g)'), { target: { value: '36' } });
    
    expect(screen.getByText('1:2.0')).toBeInTheDocument();
  });

  it('calls onSubmit with form values', () => {
    const handleSubmit = vi.fn();
    render(<ShotForm {...defaultProps} onSubmit={handleSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Dose (g)'), { target: { value: '18' } });
    fireEvent.change(screen.getByLabelText('Yield (g)'), { target: { value: '36' } });
    fireEvent.change(screen.getByLabelText('Time (s)'), { target: { value: '28' } });
    fireEvent.click(screen.getByText('Log Shot'));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      beanId: 'bean-123',
      doseGrams: 18,
      yieldGrams: 36,
      timeSeconds: 28,
      grindSetting: '',
      taste: { balance: 0 },
      notes: '',
    });
  });

  it('pre-fills from previous shot', () => {
    const previousShot = {
      id: 'shot-1',
      beanId: 'bean-123',
      doseGrams: 18,
      yieldGrams: 40,
      timeSeconds: 30,
      grindSetting: '2.5',
      ratio: 2.22,
      taste: { balance: 0 as const },
      notes: '',
      shotNumber: 1,
      isDialedShot: false,
      createdAt: '2026-01-01',
    };
    
    render(<ShotForm {...defaultProps} previousShot={previousShot} />);
    
    expect(screen.getByLabelText('Dose (g)')).toHaveValue(18);
    expect(screen.getByLabelText('Yield (g)')).toHaveValue(40);
    expect(screen.getByLabelText('Time (s)')).toHaveValue(30);
    expect(screen.getByLabelText('Grind Setting (optional)')).toHaveValue('2.5');
  });

  it('calls onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(<ShotForm {...defaultProps} onCancel={handleCancel} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleCancel).toHaveBeenCalled();
  });
});
```

### 5. Create ShotComparison Component

Create `src/components/shot/ShotComparison.tsx`:

```tsx
import type { Shot } from '../../types';
import { Card } from '../shared';
import { formatRatio, getBalanceLabel, getBalanceColor } from '../../utils/calculations';

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
  const getDelta = (current: number, previous: number): string => {
    const diff = current - previous;
    if (diff === 0) return '—';
    return diff > 0 ? `+${diff}` : `${diff}`;
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
            "{currentShot.notes}"
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
                {getDelta(currentShot.yieldGrams, previousShot.yieldGrams)}g
              </p>
            </div>
            <div>
              <span className="text-espresso-700/60 dark:text-steam-400">Time</span>
              <p className="font-medium text-espresso-900 dark:text-steam-50">
                {getDelta(currentShot.timeSeconds, previousShot.timeSeconds)}s
              </p>
            </div>
            <div>
              <span className="text-espresso-700/60 dark:text-steam-400">Taste</span>
              <p className={`font-medium ${getBalanceColor(currentShot.taste.balance)}`}>
                {getBalanceLabel(currentShot.taste.balance)}
              </p>
            </div>
          </div>
        </Card>
      )}

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

      {/* Suggestion for non-balanced shots */}
      {currentShot.taste.balance !== 0 && (
        <p className="text-sm text-center text-espresso-700/60 dark:text-steam-300">
          {currentShot.taste.balance < 0
            ? 'Tasting sour? Try grinding finer or extending the shot.'
            : 'Tasting bitter? Try grinding coarser or pulling shorter.'}
        </p>
      )}
    </div>
  );
}
```

Create `src/components/shot/ShotComparison.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShotComparison } from './ShotComparison';
import type { Shot } from '../../types';

const createMockShot = (overrides: Partial<Shot> = {}): Shot => ({
  id: 'shot-1',
  beanId: 'bean-1',
  doseGrams: 18,
  yieldGrams: 36,
  timeSeconds: 28,
  grindSetting: '',
  ratio: 2,
  taste: { balance: 0 },
  notes: '',
  shotNumber: 1,
  isDialedShot: false,
  createdAt: '2026-01-01',
  ...overrides,
});

describe('ShotComparison', () => {
  it('renders current shot details', () => {
    const shot = createMockShot();
    render(<ShotComparison currentShot={shot} />);
    
    expect(screen.getByText('Shot #1')).toBeInTheDocument();
    expect(screen.getByText('18g')).toBeInTheDocument();
    expect(screen.getByText('36g')).toBeInTheDocument();
    expect(screen.getByText('28s')).toBeInTheDocument();
    expect(screen.getByText('Balanced')).toBeInTheDocument();
  });

  it('shows comparison with previous shot', () => {
    const current = createMockShot({ shotNumber: 2, yieldGrams: 40, timeSeconds: 30 });
    const previous = createMockShot({ shotNumber: 1, yieldGrams: 36, timeSeconds: 28 });
    
    render(<ShotComparison currentShot={current} previousShot={previous} />);
    
    expect(screen.getByText('vs Shot #1')).toBeInTheDocument();
    expect(screen.getByText('+4g')).toBeInTheDocument(); // yield delta
    expect(screen.getByText('+2s')).toBeInTheDocument(); // time delta
  });

  it('shows "Mark as Dialed" button for balanced shots', () => {
    const shot = createMockShot({ taste: { balance: 0 } });
    const handleDial = vi.fn();
    
    render(<ShotComparison currentShot={shot} onMarkAsDialed={handleDial} />);
    
    const button = screen.getByText('Mark as Dialed');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleDial).toHaveBeenCalled();
  });

  it('shows suggestion for sour shots', () => {
    const shot = createMockShot({ taste: { balance: -1 } });
    render(<ShotComparison currentShot={shot} />);
    
    expect(screen.getByText(/grinding finer/)).toBeInTheDocument();
  });

  it('shows suggestion for bitter shots', () => {
    const shot = createMockShot({ taste: { balance: 1 } });
    render(<ShotComparison currentShot={shot} />);
    
    expect(screen.getByText(/grinding coarser/)).toBeInTheDocument();
  });

  it('does not show "Mark as Dialed" for non-balanced shots', () => {
    const shot = createMockShot({ taste: { balance: -1 } });
    render(<ShotComparison currentShot={shot} onMarkAsDialed={() => {}} />);
    
    expect(screen.queryByText('Mark as Dialed')).not.toBeInTheDocument();
  });
});
```

### 6. Create Shot Components Barrel Export

Create `src/components/shot/index.ts`:

```typescript
export { ShotForm } from './ShotForm';
export { ShotComparison } from './ShotComparison';
```

### 7. Update LogShot Page

Update `src/pages/LogShot.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useBeanStore } from '../stores/beanStore';
import { useShotStore } from '../stores/shotStore';
import { ShotForm, ShotComparison } from '../components/shot';
import { Button } from '../components/shared';
import type { CreateShotInput } from '../types';

type PageState = 'form' | 'result';

export function LogShot() {
  const { id: beanId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isRedial = searchParams.get('redial') === 'true';

  const { currentBean, loadBean, dialBean } = useBeanStore();
  const { shots, latestShot, addShot, loadShots, isLoading: shotLoading } = useShotStore();

  const [pageState, setPageState] = useState<PageState>('form');
  const [justLoggedShot, setJustLoggedShot] = useState<typeof latestShot>(null);
  const [isDialing, setIsDialing] = useState(false);

  useEffect(() => {
    if (beanId) {
      loadBean(beanId);
      loadShots(beanId);
    }
  }, [beanId, loadBean, loadShots]);

  if (!beanId) {
    return <div className="p-4">Invalid bean ID</div>;
  }

  if (!currentBean) {
    return (
      <div className="px-5 pt-12 pb-4">
        <p className="text-espresso-700 dark:text-steam-200">Loading...</p>
      </div>
    );
  }

  // Determine what to pre-fill
  const getPrefillShot = () => {
    if (isRedial) {
      // For re-dial, start fresh (or from dialed recipe)
      if (currentBean.dialedRecipe) {
        return {
          doseGrams: currentBean.dialedRecipe.doseGrams,
          yieldGrams: currentBean.dialedRecipe.yieldGrams,
          timeSeconds: currentBean.dialedRecipe.timeSeconds,
          grindSetting: currentBean.dialedRecipe.grindSetting,
        } as any;
      }
      return null;
    }
    // For continue dialing, use latest shot
    return latestShot;
  };

  const handleSubmit = async (input: CreateShotInput) => {
    try {
      const shot = await addShot(input);
      setJustLoggedShot(shot);
      setPageState('result');
    } catch (e) {
      // Error handled in store
    }
  };

  const handleMarkAsDialed = async () => {
    if (!justLoggedShot) return;
    setIsDialing(true);
    try {
      await dialBean(beanId, justLoggedShot.id);
      navigate(`/bean/${beanId}`);
    } catch (e) {
      // Error handled in store
    } finally {
      setIsDialing(false);
    }
  };

  const handleLogAnother = () => {
    setJustLoggedShot(null);
    setPageState('form');
  };

  const handleDone = () => {
    navigate(`/bean/${beanId}`);
  };

  // Get previous shot for comparison (the one before the just-logged shot)
  const previousShot = shots.length >= 2 && justLoggedShot
    ? shots.find(s => s.shotNumber === justLoggedShot.shotNumber - 1) || null
    : null;

  return (
    <div>
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <button
          onClick={() => navigate(`/bean/${beanId}`)}
          className="flex items-center gap-1 text-sm text-espresso-700/70 dark:text-steam-300 mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {currentBean.name}
        </button>
        <h1 className="text-2xl font-semibold">
          {pageState === 'form' ? 'Log Shot' : `Shot #${justLoggedShot?.shotNumber}`}
        </h1>
        {pageState === 'form' && (
          <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
            {isRedial
              ? 'Starting fresh dial-in'
              : shots.length > 0
              ? `Shot #${shots.length + 1}`
              : 'First shot for this bean'}
          </p>
        )}
      </header>

      <main className="px-4 pb-4">
        {pageState === 'form' ? (
          <ShotForm
            beanId={beanId}
            previousShot={getPrefillShot()}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/bean/${beanId}`)}
            isLoading={shotLoading}
          />
        ) : justLoggedShot ? (
          <div className="space-y-4">
            <ShotComparison
              currentShot={justLoggedShot}
              previousShot={previousShot}
              onMarkAsDialed={handleMarkAsDialed}
              isDialLoading={isDialing}
            />

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" onClick={handleLogAnother} className="flex-1">
                Log Another
              </Button>
              <Button variant="ghost" onClick={handleDone} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] `npm run test:run` — all tests pass
- [ ] `npm run lint` — no errors
- [ ] `npm run dev` — app starts

Manual testing:
- [ ] Can navigate to Log Shot page from bean detail
- [ ] Form shows with dose pre-filled to 18
- [ ] Ratio updates as you type yield
- [ ] Can submit form with valid values
- [ ] After submit, shows shot comparison
- [ ] If previous shot exists, shows delta comparison
- [ ] "Mark as Dialed" button appears for balanced (0) shots
- [ ] Clicking "Mark as Dialed" updates bean and navigates back
- [ ] Sour/bitter shots show adjustment suggestions
- [ ] "Log Another" returns to form with values pre-filled
- [ ] "Done" returns to bean detail
- [ ] Shot appears in shot history on bean detail page

---

## Notes for Agent

- The LogShot page has two states: 'form' and 'result' — handle both
- Pre-fill logic depends on whether it's a re-dial or continue
- The ShotComparison component shows the "Mark as Dialed" button only for balanced shots
- Basic guidance suggestions are in ShotComparison — M6 will add the full guidance engine
- Make sure to reload shots after adding one
- Commit message: `feat(shot): add shot logging and dial-in flow`
