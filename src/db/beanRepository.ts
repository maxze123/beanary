import { db } from './database';
import type { Bean, DialedRecipe } from '../types';
import type { CreateBeanInput, UpdateBeanInput } from '../types';
import { generateId } from '../utils/id';

/**
 * Get all beans, sorted by most recently updated.
 */
export async function getAllBeans(): Promise<Bean[]> {
  return db.beans.orderBy('updatedAt').reverse().toArray();
}

/**
 * Get a single bean by ID.
 */
export async function getBeanById(id: string): Promise<Bean | undefined> {
  return db.beans.get(id);
}

/**
 * Create a new bean.
 */
export async function createBean(input: CreateBeanInput): Promise<Bean> {
  const now = new Date().toISOString();

  const bean: Bean = {
    id: generateId(),
    name: input.name,
    roaster: input.roaster,
    roastDate: input.roastDate ?? null,
    rating: null,
    notes: input.notes ?? '',
    origin: input.origin ?? null,
    process: input.process ?? null,
    roastLevel: input.roastLevel ?? null,
    dialedRecipe: null,
    isDialedIn: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.beans.add(bean);
  return bean;
}

/**
 * Update an existing bean.
 */
export async function updateBean(input: UpdateBeanInput): Promise<Bean> {
  const existing = await db.beans.get(input.id);
  if (!existing) {
    throw new Error(`Bean not found: ${input.id}`);
  }

  const updated: Bean = {
    ...existing,
    name: input.name ?? existing.name,
    roaster: input.roaster ?? existing.roaster,
    roastDate: input.roastDate !== undefined ? input.roastDate : existing.roastDate,
    rating: input.rating !== undefined ? input.rating : existing.rating,
    notes: input.notes ?? existing.notes,
    updatedAt: new Date().toISOString(),
  };

  await db.beans.put(updated);
  return updated;
}

/**
 * Delete a bean and all its associated shots.
 */
export async function deleteBean(id: string): Promise<void> {
  await db.transaction('rw', db.beans, db.shots, async () => {
    // Delete all shots for this bean
    await db.shots.where('beanId').equals(id).delete();
    // Delete the bean
    await db.beans.delete(id);
  });
}

/**
 * Mark a bean as dialed with the recipe from a specific shot.
 */
export async function markBeanAsDialed(beanId: string, shotId: string): Promise<Bean> {
  const bean = await db.beans.get(beanId);
  if (!bean) {
    throw new Error(`Bean not found: ${beanId}`);
  }

  const shot = await db.shots.get(shotId);
  if (!shot) {
    throw new Error(`Shot not found: ${shotId}`);
  }

  if (shot.beanId !== beanId) {
    throw new Error(`Shot ${shotId} does not belong to bean ${beanId}`);
  }

  const dialedRecipe: DialedRecipe = {
    doseGrams: shot.doseGrams,
    yieldGrams: shot.yieldGrams,
    timeSeconds: shot.timeSeconds,
    grindSetting: shot.grindSetting,
    ratio: shot.ratio,
    sourceShotId: shot.id,
    savedAt: new Date().toISOString(),
  };

  const updated: Bean = {
    ...bean,
    dialedRecipe,
    isDialedIn: true,
    updatedAt: new Date().toISOString(),
  };

  // Update shot to mark it as the dialed shot
  await db.shots.update(shotId, { isDialedShot: true });

  // Clear any previously dialed shots for this bean
  await db.shots
    .where('beanId')
    .equals(beanId)
    .and((s) => s.id !== shotId && s.isDialedShot)
    .modify({ isDialedShot: false });

  await db.beans.put(updated);
  return updated;
}

/**
 * Clear the dialed status from a bean.
 */
export async function clearDialedStatus(beanId: string): Promise<Bean> {
  const bean = await db.beans.get(beanId);
  if (!bean) {
    throw new Error(`Bean not found: ${beanId}`);
  }

  const updated: Bean = {
    ...bean,
    dialedRecipe: null,
    isDialedIn: false,
    updatedAt: new Date().toISOString(),
  };

  // Clear dialed shot flag
  await db.shots
    .where('beanId')
    .equals(beanId)
    .and((s) => s.isDialedShot)
    .modify({ isDialedShot: false });

  await db.beans.put(updated);
  return updated;
}
