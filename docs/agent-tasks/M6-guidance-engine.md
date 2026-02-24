# Agent Task: M6 - Guidance Engine

**Milestone:** M6  
**Agent:** Claude Code  
**Estimated time:** 45-60 minutes  
**Depends on:** M5 (Shot Logging) complete

---

## Context

You are building the guidance engine for "Beanary", an espresso dial-in companion app. This engine analyzes shot data and provides actionable suggestions to help users dial in their espresso.

Read the following documentation files before starting:
- `/docs/03-data-models.md` — GuidanceSuggestion and GuidanceInput types
- `/docs/04-feature-milestones.md` — M6 acceptance criteria

---

## Objective

Build a rule-based guidance engine that suggests adjustments based on shot data.

**Success criteria:**
- Guidance appears after logging a shot
- Suggestions match the rule set (sour+fast → grind finer, etc.)
- Reasoning is visible to user
- First shot gets appropriate starter guidance
- All rule branches have test coverage

---

## Bug Fixes From M5

Before building the guidance engine, fix these issues in `ShotComparison.tsx`:

### Fix 1: Delta display showing "—g" instead of "0g"

The `getDelta` function returns "—" for zero difference, but the unit "g" or "s" is appended outside, resulting in "—g". Fix by either:
- Returning "0" instead of "—" for zero difference, OR
- Including the unit inside the function

### Fix 2: Taste comparison showing current taste instead of previous

The comparison row shows the current shot's taste, which is redundant (it's already shown above). Change it to show the previous shot's taste so users can see what changed.

---

## Files to Create/Modify

```
src/utils/
├── guidance.ts
└── guidance.test.ts

src/components/guidance/
├── GuidanceCard.tsx
├── GuidanceCard.test.tsx
└── index.ts

src/components/shot/
├── ShotComparison.tsx (update - bug fixes + integrate guidance)
└── ShotComparison.test.tsx (update)
```

---

## Step-by-Step Instructions

### 1. Fix ShotComparison Bugs

Update `src/components/shot/ShotComparison.tsx`:

Replace the `getDelta` function and update the comparison section:

```tsx
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
```

### 2. Create Guidance Engine

Create `src/utils/guidance.ts`:

```typescript
import type { GuidanceSuggestion, GuidanceInput, GuidanceAction } from '../types';

/**
 * Time thresholds for extraction assessment (in seconds)
 */
const TIME_FAST = 20;
const TIME_SLOW = 35;
const TIME_NORMAL_MIN = 22;
const TIME_NORMAL_MAX = 32;

/**
 * Generate guidance based on shot data.
 * Uses rule-based logic to suggest adjustments.
 */
export function generateGuidance(input: GuidanceInput): GuidanceSuggestion {
  const { currentShot, previousShot } = input;
  const { balance } = currentShot.taste;
  const time = currentShot.timeSeconds;

  // First shot - give general guidance
  if (!previousShot) {
    return getFirstShotGuidance(balance, time);
  }

  // Balanced shot - encourage locking it in
  if (balance === 0) {
    return {
      action: 'none',
      message: 'This tastes dialed in!',
      confidence: 'high',
      reasoning: 'Your shot is balanced. Consider saving this as your recipe.',
    };
  }

  // Sour (under-extracted)
  if (balance < 0) {
    return getSourGuidance(balance, time, previousShot);
  }

  // Bitter (over-extracted)
  if (balance > 0) {
    return getBitterGuidance(balance, time, previousShot);
  }

  // Fallback
  return {
    action: 'experiment',
    message: 'Try adjusting one variable',
    confidence: 'low',
    reasoning: 'Make small changes and taste the difference.',
  };
}

/**
 * Guidance for the first shot of a dial-in session.
 */
function getFirstShotGuidance(balance: number, time: number): GuidanceSuggestion {
  if (balance === 0) {
    return {
      action: 'none',
      message: 'Great start!',
      confidence: 'medium',
      reasoning: 'First shot tastes balanced. Pull another to confirm before marking as dialed.',
    };
  }

  if (balance < 0) {
    // Sour first shot
    if (time < TIME_FAST) {
      return {
        action: 'grind-finer',
        message: 'Grind finer',
        confidence: 'high',
        reasoning: `Shot ran fast (${time}s) and tastes sour. Finer grind will slow extraction and add sweetness.`,
      };
    }
    return {
      action: 'grind-finer',
      message: 'Try grinding finer',
      confidence: 'medium',
      reasoning: `Shot tastes sour at ${time}s. A finer grind should help extract more sweetness.`,
    };
  }

  // Bitter first shot
  if (time > TIME_SLOW) {
    return {
      action: 'grind-coarser',
      message: 'Grind coarser',
      confidence: 'high',
      reasoning: `Shot ran slow (${time}s) and tastes bitter. Coarser grind will speed up extraction and reduce bitterness.`,
    };
  }
  return {
    action: 'grind-coarser',
    message: 'Try grinding coarser',
    confidence: 'medium',
    reasoning: `Shot tastes bitter at ${time}s. A coarser grind should reduce over-extraction.`,
  };
}

/**
 * Guidance for sour (under-extracted) shots.
 */
function getSourGuidance(
  balance: number,
  time: number,
  previousShot: NonNullable<GuidanceInput['previousShot']>
): GuidanceSuggestion {
  const timeDelta = time - previousShot.timeSeconds;
  const prevBalance = previousShot.taste.balance;
  const isVerySour = balance === -2;

  // Fast shot - definitely grind finer
  if (time < TIME_FAST) {
    return {
      action: 'grind-finer',
      message: 'Grind finer',
      confidence: 'high',
      reasoning: `Shot ran fast (${time}s) and is ${isVerySour ? 'very ' : ''}sour. Finer grind will slow it down and extract more sweetness.`,
    };
  }

  // Shot is slower than before but still sour
  if (timeDelta > 3 && balance < 0) {
    return {
      action: 'grind-finer',
      message: 'Keep grinding finer',
      confidence: 'medium',
      reasoning: `Shot slowed down (+${timeDelta}s) but still tastes sour. Continue fining up the grind.`,
    };
  }

  // Normal time range but sour
  if (time >= TIME_NORMAL_MIN && time <= TIME_NORMAL_MAX) {
    // Was balanced or bitter before, now sour - might be grind inconsistency
    if (prevBalance >= 0) {
      return {
        action: 'experiment',
        message: 'Check your puck prep',
        confidence: 'medium',
        reasoning: `Time is normal (${time}s) but taste went from ${prevBalance === 0 ? 'balanced' : 'bitter'} to sour. This might be channeling—try better distribution.`,
      };
    }
    return {
      action: 'grind-finer',
      message: 'Grind a bit finer',
      confidence: 'medium',
      reasoning: `Time is in range (${time}s) but still sour. Small grind adjustment should help.`,
    };
  }

  // Slow but sour (unusual - possible channeling)
  if (time > TIME_SLOW) {
    return {
      action: 'experiment',
      message: 'Check for channeling',
      confidence: 'low',
      reasoning: `Shot ran slow (${time}s) but tastes sour—this is unusual. Water might be channeling through the puck unevenly. Focus on puck prep.`,
    };
  }

  // Default sour guidance
  return {
    action: 'grind-finer',
    message: 'Grind finer',
    confidence: 'medium',
    reasoning: `Shot tastes ${isVerySour ? 'very ' : ''}sour. Finer grind will increase extraction.`,
  };
}

/**
 * Guidance for bitter (over-extracted) shots.
 */
function getBitterGuidance(
  balance: number,
  time: number,
  previousShot: NonNullable<GuidanceInput['previousShot']>
): GuidanceSuggestion {
  const timeDelta = time - previousShot.timeSeconds;
  const prevBalance = previousShot.taste.balance;
  const isVeryBitter = balance === 2;

  // Slow shot - definitely grind coarser
  if (time > TIME_SLOW) {
    return {
      action: 'grind-coarser',
      message: 'Grind coarser',
      confidence: 'high',
      reasoning: `Shot ran slow (${time}s) and is ${isVeryBitter ? 'very ' : ''}bitter. Coarser grind will speed it up and reduce extraction.`,
    };
  }

  // Shot is faster than before but still bitter
  if (timeDelta < -3 && balance > 0) {
    return {
      action: 'grind-coarser',
      message: 'Keep grinding coarser',
      confidence: 'medium',
      reasoning: `Shot sped up (${timeDelta}s) but still tastes bitter. Continue coarsening the grind.`,
    };
  }

  // Normal time range but bitter
  if (time >= TIME_NORMAL_MIN && time <= TIME_NORMAL_MAX) {
    // Was balanced or sour before, now bitter - might have overcorrected
    if (prevBalance <= 0) {
      return {
        action: 'grind-coarser',
        message: 'Went too fine—grind coarser',
        confidence: 'medium',
        reasoning: `Taste went from ${prevBalance === 0 ? 'balanced' : 'sour'} to bitter. You may have overcorrected—go slightly coarser.`,
      };
    }
    return {
      action: 'grind-coarser',
      message: 'Grind a bit coarser',
      confidence: 'medium',
      reasoning: `Time is in range (${time}s) but still bitter. Small grind adjustment should help.`,
    };
  }

  // Fast but bitter (unusual - likely very dark roast or stale coffee)
  if (time < TIME_FAST) {
    return {
      action: 'experiment',
      message: 'Unusual result—try a different approach',
      confidence: 'low',
      reasoning: `Shot ran fast (${time}s) but tastes bitter—this is unusual. The coffee might be very dark roasted or stale. Try lowering brew temperature if possible.`,
    };
  }

  // Default bitter guidance
  return {
    action: 'grind-coarser',
    message: 'Grind coarser',
    confidence: 'medium',
    reasoning: `Shot tastes ${isVeryBitter ? 'very ' : ''}bitter. Coarser grind will reduce extraction.`,
  };
}

/**
 * Get an icon name for a guidance action.
 */
export function getGuidanceIcon(action: GuidanceAction): string {
  switch (action) {
    case 'grind-finer':
      return 'minus'; // Finer = smaller particles
    case 'grind-coarser':
      return 'plus'; // Coarser = larger particles
    case 'none':
      return 'check';
    case 'experiment':
      return 'beaker';
    default:
      return 'info';
  }
}
```

Create `src/utils/guidance.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateGuidance } from './guidance';
import type { Shot } from '../types';

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

describe('generateGuidance', () => {
  describe('first shot (no previous)', () => {
    it('suggests grind finer for sour + fast first shot', () => {
      const shot = createMockShot({ taste: { balance: -1 }, timeSeconds: 18 });
      const guidance = generateGuidance({ currentShot: shot, previousShot: null });
      
      expect(guidance.action).toBe('grind-finer');
      expect(guidance.confidence).toBe('high');
      expect(guidance.reasoning).toContain('fast');
    });

    it('suggests grind coarser for bitter + slow first shot', () => {
      const shot = createMockShot({ taste: { balance: 1 }, timeSeconds: 40 });
      const guidance = generateGuidance({ currentShot: shot, previousShot: null });
      
      expect(guidance.action).toBe('grind-coarser');
      expect(guidance.confidence).toBe('high');
      expect(guidance.reasoning).toContain('slow');
    });

    it('encourages confirmation for balanced first shot', () => {
      const shot = createMockShot({ taste: { balance: 0 }, timeSeconds: 28 });
      const guidance = generateGuidance({ currentShot: shot, previousShot: null });
      
      expect(guidance.action).toBe('none');
      expect(guidance.message).toContain('Great start');
      expect(guidance.reasoning).toContain('confirm');
    });
  });

  describe('balanced shots', () => {
    it('encourages saving recipe for balanced shot', () => {
      const current = createMockShot({ taste: { balance: 0 }, shotNumber: 2 });
      const previous = createMockShot({ taste: { balance: -1 }, shotNumber: 1 });
      
      const guidance = generateGuidance({ currentShot: current, previousShot: previous });
      
      expect(guidance.action).toBe('none');
      expect(guidance.message).toContain('dialed');
    });
  });

  describe('sour shots', () => {
    it('high confidence grind finer for sour + fast', () => {
      const current = createMockShot({ 
        taste: { balance: -1 }, 
        timeSeconds: 18,
        shotNumber: 2 
      });
      const previous = createMockShot({ shotNumber: 1 });
      
      const guidance = generateGuidance({ currentShot: current, previousShot: previous });
      
      expect(guidance.action).toBe('grind-finer');
      expect(guidance.confidence).toBe('high');
    });

    it('suggests keep grinding finer when improving but still sour', () => {
      const current = createMockShot({ 
        taste: { balance: -1 }, 
        timeSeconds: 26,
        shotNumber: 2 
      });
      const previous = createMockShot({ 
        taste: { balance: -2 }, 
        timeSeconds: 20,
        shotNumber: 1 
      });
      
      const guidance = generateGuidance({ currentShot: current, previousShot: previous });
      
      expect(guidance.action).toBe('grind-finer');
      expect(guidance.reasoning).toContain('slowed');
    });

    it('suggests checking puck prep for slow but sour (channeling)', () => {
      const current = createMockShot({ 
        taste: { balance: -1 }, 
        timeSeconds: 40,
        shotNumber: 2 
      });
      const previous = createMockShot({ shotNumber: 1 });
      
      const guidance = generateGuidance({ currentShot: current, previousShot: previous });
      
      expect(guidance.action).toBe('experiment');
      expect(guidance.reasoning).toContain('channeling');
    });
  });

  describe('bitter shots', () => {
    it('high confidence grind coarser for bitter + slow', () => {
      const current = createMockShot({ 
        taste: { balance: 1 }, 
        timeSeconds: 40,
        shotNumber: 2 
      });
      const previous = createMockShot({ shotNumber: 1 });
      
      const guidance = generateGuidance({ currentShot: current, previousShot: previous });
      
      expect(guidance.action).toBe('grind-coarser');
      expect(guidance.confidence).toBe('high');
    });

    it('suggests keep grinding coarser when improving but still bitter', () => {
      const current = createMockShot({ 
        taste: { balance: 1 }, 
        timeSeconds: 30,
        shotNumber: 2 
      });
      const previous = createMockShot({ 
        taste: { balance: 2 }, 
        timeSeconds: 38,
        shotNumber: 1 
      });
      
      const guidance = generateGuidance({ currentShot: current, previousShot: previous });
      
      expect(guidance.action).toBe('grind-coarser');
      expect(guidance.reasoning).toContain('sped up');
    });

    it('detects overcorrection from sour to bitter', () => {
      const current = createMockShot({ 
        taste: { balance: 1 }, 
        timeSeconds: 28,
        shotNumber: 2 
      });
      const previous = createMockShot({ 
        taste: { balance: -1 }, 
        timeSeconds: 24,
        shotNumber: 1 
      });
      
      const guidance = generateGuidance({ currentShot: current, previousShot: previous });
      
      expect(guidance.action).toBe('grind-coarser');
      expect(guidance.reasoning).toContain('overcorrected');
    });

    it('flags unusual fast + bitter combination', () => {
      const current = createMockShot({ 
        taste: { balance: 1 }, 
        timeSeconds: 18,
        shotNumber: 2 
      });
      const previous = createMockShot({ shotNumber: 1 });
      
      const guidance = generateGuidance({ currentShot: current, previousShot: previous });
      
      expect(guidance.action).toBe('experiment');
      expect(guidance.confidence).toBe('low');
      expect(guidance.reasoning).toContain('unusual');
    });
  });

  describe('very sour/bitter intensifiers', () => {
    it('includes "very" in reasoning for balance -2', () => {
      const current = createMockShot({ 
        taste: { balance: -2 }, 
        timeSeconds: 18,
        shotNumber: 2 
      });
      const previous = createMockShot({ shotNumber: 1 });
      
      const guidance = generateGuidance({ currentShot: current, previousShot: previous });
      
      expect(guidance.reasoning).toContain('very');
    });

    it('includes "very" in reasoning for balance +2', () => {
      const current = createMockShot({ 
        taste: { balance: 2 }, 
        timeSeconds: 40,
        shotNumber: 2 
      });
      const previous = createMockShot({ shotNumber: 1 });
      
      const guidance = generateGuidance({ currentShot: current, previousShot: previous });
      
      expect(guidance.reasoning).toContain('very');
    });
  });
});
```

### 3. Create GuidanceCard Component

Create `src/components/guidance/GuidanceCard.tsx`:

```tsx
import type { GuidanceSuggestion } from '../../types';
import { Card } from '../shared';

interface GuidanceCardProps {
  guidance: GuidanceSuggestion;
}

export function GuidanceCard({ guidance }: GuidanceCardProps) {
  const { action, message, confidence, reasoning } = guidance;

  // Color scheme based on action
  const getActionStyles = () => {
    switch (action) {
      case 'none':
        return {
          bg: 'bg-dialed-light dark:bg-dialed-dm-bg',
          border: 'border-dialed/30 dark:border-dialed-dm-text/30',
          icon: 'text-dialed-dark dark:text-dialed-dm-text',
          text: 'text-dialed-dark dark:text-dialed-dm-text',
        };
      case 'grind-finer':
      case 'grind-coarser':
        return {
          bg: 'bg-caramel-100 dark:bg-caramel-500/20',
          border: 'border-caramel-300 dark:border-caramel-500/30',
          icon: 'text-caramel-600 dark:text-caramel-400',
          text: 'text-caramel-700 dark:text-caramel-300',
        };
      case 'experiment':
      default:
        return {
          bg: 'bg-crema-100 dark:bg-roast-800',
          border: 'border-crema-300 dark:border-roast-600',
          icon: 'text-espresso-700 dark:text-steam-300',
          text: 'text-espresso-700 dark:text-steam-300',
        };
    }
  };

  const styles = getActionStyles();

  // Icon based on action
  const renderIcon = () => {
    switch (action) {
      case 'none':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'grind-finer':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        );
      case 'grind-coarser':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        );
      case 'experiment':
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
    }
  };

  // Confidence indicator
  const renderConfidence = () => {
    const dots = confidence === 'high' ? 3 : confidence === 'medium' ? 2 : 1;
    return (
      <div className="flex items-center gap-0.5" title={`${confidence} confidence`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i <= dots
                ? 'bg-current opacity-100'
                : 'bg-current opacity-30'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className={`${styles.bg} border ${styles.border}`}>
      <div className="flex items-start gap-3">
        <div className={`${styles.icon} mt-0.5`}>
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`font-medium ${styles.text}`}>
              {message}
            </span>
            <div className={styles.icon}>
              {renderConfidence()}
            </div>
          </div>
          <p className={`text-sm mt-1 ${styles.text} opacity-80`}>
            {reasoning}
          </p>
        </div>
      </div>
    </Card>
  );
}
```

Create `src/components/guidance/GuidanceCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GuidanceCard } from './GuidanceCard';
import type { GuidanceSuggestion } from '../../types';

describe('GuidanceCard', () => {
  it('renders guidance message and reasoning', () => {
    const guidance: GuidanceSuggestion = {
      action: 'grind-finer',
      message: 'Grind finer',
      confidence: 'high',
      reasoning: 'Shot ran fast and tastes sour.',
    };

    render(<GuidanceCard guidance={guidance} />);

    expect(screen.getByText('Grind finer')).toBeInTheDocument();
    expect(screen.getByText('Shot ran fast and tastes sour.')).toBeInTheDocument();
  });

  it('renders success styling for "none" action', () => {
    const guidance: GuidanceSuggestion = {
      action: 'none',
      message: 'This tastes dialed in!',
      confidence: 'high',
      reasoning: 'Consider saving this recipe.',
    };

    render(<GuidanceCard guidance={guidance} />);

    expect(screen.getByText('This tastes dialed in!')).toBeInTheDocument();
  });

  it('renders all confidence levels', () => {
    const highConfidence: GuidanceSuggestion = {
      action: 'grind-finer',
      message: 'Test',
      confidence: 'high',
      reasoning: 'Test',
    };

    const { container } = render(<GuidanceCard guidance={highConfidence} />);
    
    // Should have 3 dots for high confidence
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots.length).toBe(3);
  });

  it('renders experiment action', () => {
    const guidance: GuidanceSuggestion = {
      action: 'experiment',
      message: 'Check your puck prep',
      confidence: 'low',
      reasoning: 'Unusual extraction behavior.',
    };

    render(<GuidanceCard guidance={guidance} />);

    expect(screen.getByText('Check your puck prep')).toBeInTheDocument();
  });
});
```

Create `src/components/guidance/index.ts`:

```typescript
export { GuidanceCard } from './GuidanceCard';
```

### 4. Update ShotComparison Tests

Update `src/components/shot/ShotComparison.test.tsx` to reflect the changes:

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
    expect(screen.getByText('+4g')).toBeInTheDocument();
    expect(screen.getByText('+2s')).toBeInTheDocument();
  });

  it('shows 0g for unchanged yield', () => {
    const current = createMockShot({ shotNumber: 2, yieldGrams: 36 });
    const previous = createMockShot({ shotNumber: 1, yieldGrams: 36 });
    
    render(<ShotComparison currentShot={current} previousShot={previous} />);
    
    expect(screen.getByText('0g')).toBeInTheDocument();
  });

  it('shows previous shot taste in comparison', () => {
    const current = createMockShot({ shotNumber: 2, taste: { balance: 0 } });
    const previous = createMockShot({ shotNumber: 1, taste: { balance: -1 } });
    
    render(<ShotComparison currentShot={current} previousShot={previous} />);
    
    // Should show "Slightly Sour" as the previous taste
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Slightly Sour')).toBeInTheDocument();
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

  it('shows guidance card', () => {
    const shot = createMockShot({ taste: { balance: -1 }, timeSeconds: 18 });
    render(<ShotComparison currentShot={shot} />);
    
    // Should show guidance for sour + fast shot
    expect(screen.getByText('Grind finer')).toBeInTheDocument();
  });

  it('does not show "Mark as Dialed" for non-balanced shots', () => {
    const shot = createMockShot({ taste: { balance: -1 } });
    render(<ShotComparison currentShot={shot} onMarkAsDialed={() => {}} />);
    
    expect(screen.queryByText('Mark as Dialed')).not.toBeInTheDocument();
  });
});
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] `npm run test:run` — all tests pass
- [ ] `npm run lint` — no errors  
- [ ] `npm run dev` — app starts

Manual testing:
- [ ] Log a fast (<20s) sour shot → should suggest "Grind finer" with high confidence
- [ ] Log a slow (>35s) bitter shot → should suggest "Grind coarser" with high confidence
- [ ] Log a balanced shot → should say "This tastes dialed in!"
- [ ] Comparison now shows "0g" instead of "—g" for unchanged values
- [ ] Comparison shows previous shot's taste, not current
- [ ] Guidance card shows confidence dots (3 for high, 2 for medium, 1 for low)
- [ ] First shot of a new bean gets appropriate guidance

---

## Notes for Agent

- Fix the two bugs FIRST before adding new features
- The guidance engine is rule-based, not AI—keep logic transparent
- Time thresholds: fast < 20s, slow > 35s, normal 22-32s
- Include "very" in reasoning for balance values of -2 or +2
- Test all major rule branches
- Remove the old suggestion text from ShotComparison (it's replaced by GuidanceCard)
- Commit message: `feat(guidance): add rule-based guidance engine`
