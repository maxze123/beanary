import type { GuidanceSuggestion, GuidanceInput, GuidanceAction } from '../types';

/**
 * Time thresholds for extraction assessment (in seconds)
 */
const TIME_FAST = 20;
const TIME_SLOW = 35;
const TIME_NORMAL_MIN = 22;
const TIME_NORMAL_MAX = 32;

/**
 * Bean metadata for origin-aware guidance.
 */
export interface BeanMetadata {
  origin?: string | null;
  process?: string | null;
  roastLevel?: string | null;
}

/**
 * Extended guidance input with optional bean metadata.
 */
export interface ExtendedGuidanceInput extends GuidanceInput {
  beanMetadata?: BeanMetadata;
}

/**
 * Get origin-specific starting tips.
 */
function getOriginTip(origin: string | null | undefined): string | null {
  if (!origin) return null;

  const tips: Record<string, string> = {
    Brazil:
      'Brazilian beans often flow faster and are forgiving. Consider starting slightly finer.',
    Ethiopia:
      'Ethiopian coffees can be dense, especially naturals. Start medium and adjust based on taste.',
    Kenya: 'Kenyan beans are often dense and bright. May need a finer grind for full extraction.',
    Colombia: 'Colombian coffees are generally balanced and forgiving. A good baseline bean.',
    Guatemala: 'Guatemalan beans often have good body. Standard grind settings usually work well.',
    Indonesia:
      'Indonesian coffees (Sumatra, Java) often benefit from a coarser grind due to lower density.',
  };

  return tips[origin] || null;
}

/**
 * Get roast-level-specific tips.
 */
function getRoastTip(roastLevel: string | null | undefined): string | null {
  if (!roastLevel) return null;

  const tips: Record<string, string> = {
    light: 'Light roasts are denser and need more extraction. Grind finer and consider longer ratios (1:2.2+).',
    medium: 'Medium roasts are versatile. Start with a standard 1:2 ratio.',
    'medium-dark': 'Medium-dark roasts extract easier. Be careful not to over-extract.',
    dark: 'Dark roasts are brittle and extract quickly. Grind coarser and pull shorter (1:1.5-2).',
  };

  return tips[roastLevel] || null;
}

/**
 * Generate guidance based on shot data.
 * Uses rule-based logic to suggest adjustments.
 */
export function generateGuidance(input: ExtendedGuidanceInput): GuidanceSuggestion {
  const { currentShot, previousShot, beanMetadata } = input;
  const { balance } = currentShot.taste;
  const time = currentShot.timeSeconds;

  // First shot - give guidance based on bean metadata if available
  if (!previousShot) {
    return getFirstShotGuidance(balance, time, beanMetadata);
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
function getFirstShotGuidance(
  balance: number,
  time: number,
  metadata?: BeanMetadata
): GuidanceSuggestion {
  if (balance === 0) {
    return {
      action: 'none',
      message: 'Great start!',
      confidence: 'medium',
      reasoning: 'First shot tastes balanced. Pull another to confirm before marking as dialed.',
    };
  }

  const originTip = getOriginTip(metadata?.origin);
  const roastTip = getRoastTip(metadata?.roastLevel);

  if (balance < 0) {
    // Sour first shot
    let reasoning: string;
    if (time < TIME_FAST) {
      reasoning = `Shot ran fast (${time}s) and tastes sour. Finer grind will slow extraction and add sweetness.`;
    } else {
      reasoning = `Shot tastes sour at ${time}s. A finer grind should help extract more sweetness.`;
    }
    if (originTip) reasoning += ` Note: ${originTip}`;
    if (roastTip) reasoning += ` ${roastTip}`;

    return {
      action: 'grind-finer',
      message: time < TIME_FAST ? 'Grind finer' : 'Try grinding finer',
      confidence: time < TIME_FAST ? 'high' : 'medium',
      reasoning,
    };
  }

  // Bitter first shot
  let reasoning: string;
  if (time > TIME_SLOW) {
    reasoning = `Shot ran slow (${time}s) and tastes bitter. Coarser grind will speed up extraction and reduce bitterness.`;
  } else {
    reasoning = `Shot tastes bitter at ${time}s. A coarser grind should reduce over-extraction.`;
  }
  if (originTip) reasoning += ` Note: ${originTip}`;
  if (roastTip) reasoning += ` ${roastTip}`;

  return {
    action: 'grind-coarser',
    message: time > TIME_SLOW ? 'Grind coarser' : 'Try grinding coarser',
    confidence: time > TIME_SLOW ? 'high' : 'medium',
    reasoning,
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
