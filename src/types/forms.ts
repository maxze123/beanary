import type { TasteFeedback } from './shot';

/**
 * Input for creating a new bean.
 * Subset of Bean without auto-generated fields.
 */
export interface CreateBeanInput {
  name: string;
  roaster: string;
  roastDate?: string | null;
  notes?: string;
}

/**
 * Input for updating an existing bean.
 * All fields optional except id.
 */
export interface UpdateBeanInput {
  id: string;
  name?: string;
  roaster?: string;
  roastDate?: string | null;
  rating?: number | null;
  notes?: string;
}

/**
 * Input for logging a new shot.
 * Subset of Shot without auto-generated fields.
 */
export interface CreateShotInput {
  beanId: string;
  doseGrams: number;
  yieldGrams: number;
  timeSeconds: number;
  grindSetting?: string;
  taste: TasteFeedback;
  notes?: string;
}
