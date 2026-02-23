/**
 * Represents a single espresso shot.
 * Always belongs to a Bean.
 */
export interface Shot {
  /** Unique identifier (UUID) */
  id: string;

  /** ID of the bean this shot belongs to */
  beanId: string;

  /** Dose in grams */
  doseGrams: number;

  /** Yield in grams */
  yieldGrams: number;

  /** Extraction time in seconds */
  timeSeconds: number;

  /** Grind setting (optional, user-entered string) */
  grindSetting: string;

  /** Calculated ratio (yield / dose) */
  ratio: number;

  /** User's taste assessment */
  taste: TasteFeedback;

  /** Free-form notes about this specific shot */
  notes: string;

  /** Order within the dial-in session (1 = first shot, etc.) */
  shotNumber: number;

  /** Whether this shot was marked as the dialed-in result */
  isDialedShot: boolean;

  /** Timestamp when this shot was logged */
  createdAt: string;
}

/**
 * Taste feedback for a shot.
 * Simplified to a single-axis assessment for Phase 0.
 */
export interface TasteFeedback {
  /**
   * Balance assessment on a scale from -2 to +2:
   * -2 = Very sour (under-extracted)
   * -1 = Slightly sour
   *  0 = Balanced
   * +1 = Slightly bitter
   * +2 = Very bitter (over-extracted)
   */
  balance: -2 | -1 | 0 | 1 | 2;
}

/** Valid balance values for type checking */
export type BalanceValue = -2 | -1 | 0 | 1 | 2;
