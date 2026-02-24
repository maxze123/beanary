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

  // Slow but sour (unusual - possible channeling) — check before timeDelta
  if (time > TIME_SLOW) {
    return {
      action: 'experiment',
      message: 'Check for channeling',
      confidence: 'low',
      reasoning: `Shot ran slow (${time}s) but tastes sour—this is unusual. Water might be channeling through the puck unevenly. Focus on puck prep.`,
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

  // Fast but bitter (unusual) — check before timeDelta
  if (time < TIME_FAST) {
    return {
      action: 'experiment',
      message: 'Unusual result—try a different approach',
      confidence: 'low',
      reasoning: `Shot ran fast (${time}s) but tastes bitter—this is unusual. The coffee might be very dark roasted or stale. Try lowering brew temperature if possible.`,
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
