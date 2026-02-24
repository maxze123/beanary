/**
 * Bean processing methods.
 */
export type BeanProcess = 'washed' | 'natural' | 'honey' | 'anaerobic' | 'other';

/**
 * Roast levels.
 */
export type RoastLevel = 'light' | 'medium' | 'medium-dark' | 'dark';

/**
 * Common coffee origins for suggestions.
 */
export const COMMON_ORIGINS = [
  'Ethiopia',
  'Kenya',
  'Colombia',
  'Brazil',
  'Guatemala',
  'Costa Rica',
  'Panama',
  'Peru',
  'Rwanda',
  'Burundi',
  'Indonesia',
  'Vietnam',
  'Yemen',
  'Blend',
  'Other',
];

/**
 * Represents a coffee bean in the user's library.
 * The primary object users interact with.
 */
export interface Bean {
  /** Unique identifier (UUID) */
  id: string;

  /** Name of the coffee (e.g., "Ethiopia Yirgacheffe") */
  name: string;

  /** Name of the roaster (e.g., "Square Mile") */
  roaster: string;

  /** Date the coffee was roasted (ISO string, optional) */
  roastDate: string | null;

  /** User's personal rating (1-5 scale, optional) */
  rating: number | null;

  /** Free-form notes about this bean */
  notes: string;

  /** Country/region of origin (optional) */
  origin: string | null;

  /** Processing method (optional) */
  process: BeanProcess | null;

  /** Roast level (optional) */
  roastLevel: RoastLevel | null;

  /** The recipe the user landed on when dialing in */
  dialedRecipe: DialedRecipe | null;

  /** Whether the bean has been marked as "dialed in" */
  isDialedIn: boolean;

  /** Timestamp when this bean was added to the library */
  createdAt: string;

  /** Timestamp when this bean was last modified */
  updatedAt: string;
}

/**
 * The final recipe saved when user marks a bean as "dialed".
 * Extracted from the winning shot.
 */
export interface DialedRecipe {
  /** Dose in grams (e.g., 18) */
  doseGrams: number;

  /** Yield in grams (e.g., 36) */
  yieldGrams: number;

  /** Extraction time in seconds (e.g., 28) */
  timeSeconds: number;

  /** Grind setting (machine-specific, user-entered string) */
  grindSetting: string;

  /** Calculated ratio (yield / dose) */
  ratio: number;

  /** ID of the shot this recipe came from */
  sourceShotId: string;

  /** When this recipe was saved */
  savedAt: string;
}
