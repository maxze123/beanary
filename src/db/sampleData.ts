import type { Bean, Shot } from '../types';

/**
 * Sample bean for development and testing.
 */
export const sampleBean: Bean = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Ethiopia Yirgacheffe',
  roaster: 'Square Mile',
  roastDate: '2026-02-15',
  rating: 4,
  notes: 'Floral, tea-like. Works well as a longer ratio.',
  origin: 'Ethiopia',
  process: 'washed',
  roastLevel: 'light',
  dialedRecipe: {
    doseGrams: 18,
    yieldGrams: 40,
    timeSeconds: 30,
    grindSetting: '2.4',
    ratio: 2.22,
    sourceShotId: '550e8400-e29b-41d4-a716-446655440003',
    savedAt: '2026-02-16T10:30:00Z',
  },
  isDialedIn: true,
  createdAt: '2026-02-15T08:00:00Z',
  updatedAt: '2026-02-16T10:30:00Z',
};

/**
 * Sample shots for development and testing.
 */
export const sampleShots: Shot[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    beanId: '550e8400-e29b-41d4-a716-446655440000',
    doseGrams: 18,
    yieldGrams: 36,
    timeSeconds: 24,
    grindSetting: '2.2',
    ratio: 2.0,
    taste: { balance: -1 },
    notes: 'Ran fast, slightly sour',
    shotNumber: 1,
    isDialedShot: false,
    createdAt: '2026-02-15T08:15:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    beanId: '550e8400-e29b-41d4-a716-446655440000',
    doseGrams: 18,
    yieldGrams: 36,
    timeSeconds: 28,
    grindSetting: '2.3',
    ratio: 2.0,
    taste: { balance: 0 },
    notes: 'Better balance',
    shotNumber: 2,
    isDialedShot: false,
    createdAt: '2026-02-15T08:30:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    beanId: '550e8400-e29b-41d4-a716-446655440000',
    doseGrams: 18,
    yieldGrams: 40,
    timeSeconds: 30,
    grindSetting: '2.4',
    ratio: 2.22,
    taste: { balance: 0 },
    notes: 'Sweet spot! Longer ratio works well.',
    shotNumber: 3,
    isDialedShot: true,
    createdAt: '2026-02-15T08:45:00Z',
  },
];

/**
 * Load sample data into the database.
 * Useful for development and demos.
 */
export async function loadSampleData(): Promise<void> {
  const { db } = await import('./database');

  // Check if sample data already exists
  const existingBean = await db.beans.get(sampleBean.id);
  if (existingBean) {
    return; // Already loaded
  }

  await db.beans.add(sampleBean);
  await db.shots.bulkAdd(sampleShots);
}
