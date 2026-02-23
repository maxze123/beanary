import { db } from './database';
import type { Shot } from '../types';
import type { CreateShotInput } from '../types';
import { generateId } from '../utils/id';

/**
 * Calculate ratio from dose and yield.
 */
function calculateRatio(doseGrams: number, yieldGrams: number): number {
  return Math.round((yieldGrams / doseGrams) * 100) / 100;
}

/**
 * Get all shots for a bean, sorted by creation time.
 */
export async function getShotsForBean(beanId: string): Promise<Shot[]> {
  return db.shots.where('beanId').equals(beanId).sortBy('createdAt');
}

/**
 * Get a single shot by ID.
 */
export async function getShotById(id: string): Promise<Shot | undefined> {
  return db.shots.get(id);
}

/**
 * Get the most recent shot for a bean.
 */
export async function getLatestShotForBean(beanId: string): Promise<Shot | undefined> {
  const shots = await db.shots.where('beanId').equals(beanId).sortBy('shotNumber');
  return shots[shots.length - 1];
}

/**
 * Get the dialed shot for a bean (if any).
 */
export async function getDialedShotForBean(beanId: string): Promise<Shot | undefined> {
  return db.shots
    .where('beanId')
    .equals(beanId)
    .and((shot) => shot.isDialedShot)
    .first();
}

/**
 * Count shots for a bean.
 */
export async function countShotsForBean(beanId: string): Promise<number> {
  return db.shots.where('beanId').equals(beanId).count();
}

/**
 * Create a new shot.
 */
export async function createShot(input: CreateShotInput): Promise<Shot> {
  const shotCount = await countShotsForBean(input.beanId);

  const shot: Shot = {
    id: generateId(),
    beanId: input.beanId,
    doseGrams: input.doseGrams,
    yieldGrams: input.yieldGrams,
    timeSeconds: input.timeSeconds,
    grindSetting: input.grindSetting ?? '',
    ratio: calculateRatio(input.doseGrams, input.yieldGrams),
    taste: input.taste,
    notes: input.notes ?? '',
    shotNumber: shotCount + 1,
    isDialedShot: false,
    createdAt: new Date().toISOString(),
  };

  await db.shots.add(shot);

  // Update the parent bean's updatedAt
  await db.beans.update(input.beanId, {
    updatedAt: new Date().toISOString(),
  });

  return shot;
}

/**
 * Update a shot.
 */
export async function updateShot(
  id: string,
  updates: Partial<Omit<Shot, 'id' | 'beanId' | 'createdAt' | 'shotNumber'>>
): Promise<Shot> {
  const existing = await db.shots.get(id);
  if (!existing) {
    throw new Error(`Shot not found: ${id}`);
  }

  // Recalculate ratio if dose or yield changed
  const doseGrams = updates.doseGrams ?? existing.doseGrams;
  const yieldGrams = updates.yieldGrams ?? existing.yieldGrams;
  const ratio = calculateRatio(doseGrams, yieldGrams);

  const updated: Shot = {
    ...existing,
    ...updates,
    ratio,
  };

  await db.shots.put(updated);
  return updated;
}

/**
 * Delete a shot.
 */
export async function deleteShot(id: string): Promise<void> {
  const shot = await db.shots.get(id);
  if (shot) {
    await db.shots.delete(id);

    // Update the parent bean's updatedAt
    await db.beans.update(shot.beanId, {
      updatedAt: new Date().toISOString(),
    });
  }
}
