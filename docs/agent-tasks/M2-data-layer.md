# Agent Task: M2 - Data Layer

**Milestone:** M2  
**Agent:** Claude Code  
**Estimated time:** 45-60 minutes  
**Depends on:** M1 (Shared Types) complete

---

## Context

You are implementing the local database and data access layer for an espresso dial-in companion app. The app stores all data locally using IndexedDB via Dexie.js. There is no backend server.

Read the following documentation files before starting:
- `/docs/03-data-models.md` — Database schema and validation rules
- `/docs/02-tech-stack.md` — Tech decisions (Dexie.js)

---

## Objective

Create the Dexie database, repository functions for CRUD operations, and data export utility.

**Success criteria:**
- Database initializes without errors
- All CRUD operations work for beans and shots
- Marking a shot as "dialed" updates the parent bean
- Export produces valid JSON
- All tests pass
- 90%+ test coverage on repository functions

---

## Files to Create

```
src/db/
├── database.ts        # Dexie database setup
├── database.test.ts   # Database initialization tests
├── beanRepository.ts  # Bean CRUD operations
├── beanRepository.test.ts
├── shotRepository.ts  # Shot CRUD operations
├── shotRepository.test.ts
├── sampleData.ts      # Sample data for development
└── index.ts           # Barrel export

src/utils/
├── export.ts          # Data export utility
└── export.test.ts     # Export tests
```

---

## Step-by-Step Instructions

### 1. Create Database Setup

Create `src/db/database.ts`:

```typescript
import Dexie, { type Table } from 'dexie';
import type { Bean, Shot } from '../types';

/**
 * Local IndexedDB database for the espresso dial-in app.
 * Uses Dexie.js for a cleaner API over raw IndexedDB.
 */
export class BeanaryDatabase extends Dexie {
  beans!: Table<Bean, string>;
  shots!: Table<Shot, string>;

  constructor() {
    super('BeanaryDB');

    this.version(1).stores({
      // Primary key is 'id', additional indexed fields after
      beans: 'id, roaster, createdAt, updatedAt',
      shots: 'id, beanId, createdAt, isDialedShot',
    });
  }
}

/** Singleton database instance */
export const db = new BeanaryDatabase();

/**
 * Reset the database (for testing).
 * Clears all data but keeps the schema.
 */
export async function resetDatabase(): Promise<void> {
  await db.beans.clear();
  await db.shots.clear();
}
```

### 2. Create Database Tests

Create `src/db/database.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db, resetDatabase } from './database';

describe('BeanaryDatabase', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('initializes with empty tables', async () => {
    const beanCount = await db.beans.count();
    const shotCount = await db.shots.count();
    expect(beanCount).toBe(0);
    expect(shotCount).toBe(0);
  });

  it('has beans table', () => {
    expect(db.beans).toBeDefined();
  });

  it('has shots table', () => {
    expect(db.shots).toBeDefined();
  });
});
```

### 3. Create Bean Repository

Create `src/db/beanRepository.ts`:

```typescript
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
export async function markBeanAsDialed(
  beanId: string,
  shotId: string
): Promise<Bean> {
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
```

### 4. Create Bean Repository Tests

Create `src/db/beanRepository.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { resetDatabase } from './database';
import {
  getAllBeans,
  getBeanById,
  createBean,
  updateBean,
  deleteBean,
  markBeanAsDialed,
  clearDialedStatus,
} from './beanRepository';
import { createShot } from './shotRepository';

describe('beanRepository', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe('createBean', () => {
    it('creates a bean with required fields', async () => {
      const bean = await createBean({
        name: 'Ethiopia Yirgacheffe',
        roaster: 'Square Mile',
      });

      expect(bean.id).toBeDefined();
      expect(bean.name).toBe('Ethiopia Yirgacheffe');
      expect(bean.roaster).toBe('Square Mile');
      expect(bean.roastDate).toBeNull();
      expect(bean.rating).toBeNull();
      expect(bean.notes).toBe('');
      expect(bean.dialedRecipe).toBeNull();
      expect(bean.isDialedIn).toBe(false);
      expect(bean.createdAt).toBeDefined();
      expect(bean.updatedAt).toBeDefined();
    });

    it('creates a bean with optional fields', async () => {
      const bean = await createBean({
        name: 'Colombia Huila',
        roaster: 'Onyx',
        roastDate: '2026-02-01',
        notes: 'Fruity and sweet',
      });

      expect(bean.roastDate).toBe('2026-02-01');
      expect(bean.notes).toBe('Fruity and sweet');
    });
  });

  describe('getAllBeans', () => {
    it('returns empty array when no beans', async () => {
      const beans = await getAllBeans();
      expect(beans).toEqual([]);
    });

    it('returns beans sorted by updatedAt descending', async () => {
      const bean1 = await createBean({ name: 'Bean 1', roaster: 'Roaster' });
      const bean2 = await createBean({ name: 'Bean 2', roaster: 'Roaster' });
      const bean3 = await createBean({ name: 'Bean 3', roaster: 'Roaster' });

      // Update bean1 to make it most recent
      await updateBean({ id: bean1.id, notes: 'Updated' });

      const beans = await getAllBeans();
      expect(beans[0].name).toBe('Bean 1');
      expect(beans[1].name).toBe('Bean 3');
      expect(beans[2].name).toBe('Bean 2');
    });
  });

  describe('getBeanById', () => {
    it('returns bean when found', async () => {
      const created = await createBean({ name: 'Test', roaster: 'Test' });
      const found = await getBeanById(created.id);
      expect(found).toEqual(created);
    });

    it('returns undefined when not found', async () => {
      const found = await getBeanById('nonexistent');
      expect(found).toBeUndefined();
    });
  });

  describe('updateBean', () => {
    it('updates specified fields', async () => {
      const bean = await createBean({ name: 'Original', roaster: 'Original' });
      
      const updated = await updateBean({
        id: bean.id,
        name: 'Updated Name',
        rating: 4,
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.roaster).toBe('Original');
      expect(updated.rating).toBe(4);
      expect(updated.updatedAt).not.toBe(bean.updatedAt);
    });

    it('throws when bean not found', async () => {
      await expect(
        updateBean({ id: 'nonexistent', name: 'Test' })
      ).rejects.toThrow('Bean not found');
    });
  });

  describe('deleteBean', () => {
    it('deletes bean and associated shots', async () => {
      const bean = await createBean({ name: 'Test', roaster: 'Test' });
      await createShot({
        beanId: bean.id,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        taste: { balance: 0 },
      });

      await deleteBean(bean.id);

      const found = await getBeanById(bean.id);
      expect(found).toBeUndefined();
    });
  });

  describe('markBeanAsDialed', () => {
    it('marks bean as dialed with shot recipe', async () => {
      const bean = await createBean({ name: 'Test', roaster: 'Test' });
      const shot = await createShot({
        beanId: bean.id,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        grindSetting: '2.5',
        taste: { balance: 0 },
      });

      const updated = await markBeanAsDialed(bean.id, shot.id);

      expect(updated.isDialedIn).toBe(true);
      expect(updated.dialedRecipe).toBeDefined();
      expect(updated.dialedRecipe?.doseGrams).toBe(18);
      expect(updated.dialedRecipe?.yieldGrams).toBe(36);
      expect(updated.dialedRecipe?.timeSeconds).toBe(28);
      expect(updated.dialedRecipe?.grindSetting).toBe('2.5');
      expect(updated.dialedRecipe?.sourceShotId).toBe(shot.id);
    });

    it('throws when bean not found', async () => {
      await expect(
        markBeanAsDialed('nonexistent', 'shot-id')
      ).rejects.toThrow('Bean not found');
    });

    it('throws when shot not found', async () => {
      const bean = await createBean({ name: 'Test', roaster: 'Test' });
      await expect(
        markBeanAsDialed(bean.id, 'nonexistent')
      ).rejects.toThrow('Shot not found');
    });
  });

  describe('clearDialedStatus', () => {
    it('clears dialed status from bean', async () => {
      const bean = await createBean({ name: 'Test', roaster: 'Test' });
      const shot = await createShot({
        beanId: bean.id,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        taste: { balance: 0 },
      });
      await markBeanAsDialed(bean.id, shot.id);

      const cleared = await clearDialedStatus(bean.id);

      expect(cleared.isDialedIn).toBe(false);
      expect(cleared.dialedRecipe).toBeNull();
    });
  });
});
```

### 5. Create Shot Repository

Create `src/db/shotRepository.ts`:

```typescript
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
  const shots = await db.shots
    .where('beanId')
    .equals(beanId)
    .reverse()
    .sortBy('createdAt');
  return shots[0];
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
```

### 6. Create Shot Repository Tests

Create `src/db/shotRepository.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { resetDatabase } from './database';
import { createBean } from './beanRepository';
import {
  getShotsForBean,
  getShotById,
  getLatestShotForBean,
  getDialedShotForBean,
  countShotsForBean,
  createShot,
  updateShot,
  deleteShot,
} from './shotRepository';

describe('shotRepository', () => {
  let testBeanId: string;

  beforeEach(async () => {
    await resetDatabase();
    const bean = await createBean({ name: 'Test Bean', roaster: 'Test Roaster' });
    testBeanId = bean.id;
  });

  describe('createShot', () => {
    it('creates a shot with calculated fields', async () => {
      const shot = await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        taste: { balance: 0 },
      });

      expect(shot.id).toBeDefined();
      expect(shot.beanId).toBe(testBeanId);
      expect(shot.doseGrams).toBe(18);
      expect(shot.yieldGrams).toBe(36);
      expect(shot.timeSeconds).toBe(28);
      expect(shot.ratio).toBe(2);
      expect(shot.shotNumber).toBe(1);
      expect(shot.isDialedShot).toBe(false);
      expect(shot.createdAt).toBeDefined();
    });

    it('calculates ratio correctly', async () => {
      const shot = await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 40,
        timeSeconds: 30,
        taste: { balance: 0 },
      });

      expect(shot.ratio).toBe(2.22);
    });

    it('increments shot number', async () => {
      const shot1 = await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        taste: { balance: -1 },
      });
      const shot2 = await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 30,
        taste: { balance: 0 },
      });

      expect(shot1.shotNumber).toBe(1);
      expect(shot2.shotNumber).toBe(2);
    });

    it('includes optional fields', async () => {
      const shot = await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        grindSetting: '2.5',
        taste: { balance: 0 },
        notes: 'Sweet and balanced',
      });

      expect(shot.grindSetting).toBe('2.5');
      expect(shot.notes).toBe('Sweet and balanced');
    });
  });

  describe('getShotsForBean', () => {
    it('returns empty array when no shots', async () => {
      const shots = await getShotsForBean(testBeanId);
      expect(shots).toEqual([]);
    });

    it('returns shots sorted by createdAt', async () => {
      await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 24,
        taste: { balance: -1 },
      });
      await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        taste: { balance: 0 },
      });

      const shots = await getShotsForBean(testBeanId);
      expect(shots).toHaveLength(2);
      expect(shots[0].shotNumber).toBe(1);
      expect(shots[1].shotNumber).toBe(2);
    });
  });

  describe('getShotById', () => {
    it('returns shot when found', async () => {
      const created = await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        taste: { balance: 0 },
      });

      const found = await getShotById(created.id);
      expect(found).toEqual(created);
    });

    it('returns undefined when not found', async () => {
      const found = await getShotById('nonexistent');
      expect(found).toBeUndefined();
    });
  });

  describe('getLatestShotForBean', () => {
    it('returns most recent shot', async () => {
      await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 24,
        taste: { balance: -1 },
      });
      const latest = await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        taste: { balance: 0 },
      });

      const found = await getLatestShotForBean(testBeanId);
      expect(found?.id).toBe(latest.id);
    });

    it('returns undefined when no shots', async () => {
      const found = await getLatestShotForBean(testBeanId);
      expect(found).toBeUndefined();
    });
  });

  describe('countShotsForBean', () => {
    it('returns correct count', async () => {
      expect(await countShotsForBean(testBeanId)).toBe(0);

      await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        taste: { balance: 0 },
      });

      expect(await countShotsForBean(testBeanId)).toBe(1);
    });
  });

  describe('updateShot', () => {
    it('updates specified fields', async () => {
      const shot = await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        taste: { balance: 0 },
      });

      const updated = await updateShot(shot.id, {
        notes: 'Updated notes',
        taste: { balance: 1 },
      });

      expect(updated.notes).toBe('Updated notes');
      expect(updated.taste.balance).toBe(1);
      expect(updated.doseGrams).toBe(18); // Unchanged
    });

    it('recalculates ratio when dose/yield change', async () => {
      const shot = await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        taste: { balance: 0 },
      });

      const updated = await updateShot(shot.id, {
        yieldGrams: 45,
      });

      expect(updated.ratio).toBe(2.5);
    });

    it('throws when shot not found', async () => {
      await expect(
        updateShot('nonexistent', { notes: 'Test' })
      ).rejects.toThrow('Shot not found');
    });
  });

  describe('deleteShot', () => {
    it('deletes the shot', async () => {
      const shot = await createShot({
        beanId: testBeanId,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        taste: { balance: 0 },
      });

      await deleteShot(shot.id);

      const found = await getShotById(shot.id);
      expect(found).toBeUndefined();
    });
  });
});
```

### 7. Create Sample Data

Create `src/db/sampleData.ts`:

```typescript
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
```

### 8. Create Export Utility

Create `src/utils/export.ts`:

```typescript
import { db } from '../db/database';
import type { DataExport } from '../types';
import { EXPORT_VERSION } from '../types';

/**
 * Export all user data as JSON.
 */
export async function exportData(): Promise<DataExport> {
  const beans = await db.beans.toArray();
  const shots = await db.shots.toArray();

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    beans,
    shots,
  };
}

/**
 * Export data as a downloadable JSON file.
 */
export function downloadExport(data: DataExport): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `beanary-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Validate an imported data structure.
 */
export function validateImport(data: unknown): data is DataExport {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  
  return (
    obj.version === EXPORT_VERSION &&
    typeof obj.exportedAt === 'string' &&
    Array.isArray(obj.beans) &&
    Array.isArray(obj.shots)
  );
}
```

### 9. Create Export Tests

Create `src/utils/export.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { resetDatabase } from '../db/database';
import { createBean } from '../db/beanRepository';
import { createShot } from '../db/shotRepository';
import { exportData, validateImport } from './export';
import { EXPORT_VERSION } from '../types';

describe('export', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe('exportData', () => {
    it('exports empty data when database is empty', async () => {
      const data = await exportData();

      expect(data.version).toBe(EXPORT_VERSION);
      expect(data.exportedAt).toBeDefined();
      expect(data.beans).toEqual([]);
      expect(data.shots).toEqual([]);
    });

    it('exports all beans and shots', async () => {
      const bean = await createBean({ name: 'Test', roaster: 'Test' });
      await createShot({
        beanId: bean.id,
        doseGrams: 18,
        yieldGrams: 36,
        timeSeconds: 28,
        taste: { balance: 0 },
      });

      const data = await exportData();

      expect(data.beans).toHaveLength(1);
      expect(data.shots).toHaveLength(1);
      expect(data.beans[0].name).toBe('Test');
    });
  });

  describe('validateImport', () => {
    it('returns true for valid export', () => {
      const valid = {
        version: EXPORT_VERSION,
        exportedAt: '2026-02-15T10:00:00Z',
        beans: [],
        shots: [],
      };

      expect(validateImport(valid)).toBe(true);
    });

    it('returns false for null', () => {
      expect(validateImport(null)).toBe(false);
    });

    it('returns false for wrong version', () => {
      const invalid = {
        version: 999,
        exportedAt: '2026-02-15T10:00:00Z',
        beans: [],
        shots: [],
      };

      expect(validateImport(invalid)).toBe(false);
    });

    it('returns false for missing fields', () => {
      expect(validateImport({ version: 1 })).toBe(false);
      expect(validateImport({ version: 1, exportedAt: '2026-02-15' })).toBe(false);
    });
  });
});
```

### 10. Create Database Barrel Export

Create `src/db/index.ts`:

```typescript
// Database
export { db, resetDatabase } from './database';

// Bean repository
export {
  getAllBeans,
  getBeanById,
  createBean,
  updateBean,
  deleteBean,
  markBeanAsDialed,
  clearDialedStatus,
} from './beanRepository';

// Shot repository
export {
  getShotsForBean,
  getShotById,
  getLatestShotForBean,
  getDialedShotForBean,
  countShotsForBean,
  createShot,
  updateShot,
  deleteShot,
} from './shotRepository';

// Sample data
export { sampleBean, sampleShots, loadSampleData } from './sampleData';
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run test:run` passes all tests
- [ ] `npm run lint` passes with no errors
- [ ] Database initializes on app start (check browser DevTools → Application → IndexedDB)
- [ ] All CRUD operations work (verified by tests)
- [ ] Export produces valid JSON structure

---

## Notes for Agent

- Follow the exact function signatures specified
- All async functions should use async/await, not raw Promises
- Use transactions where multiple tables are modified together
- The `markBeanAsDialed` function is complex—ensure it updates both bean and shot
- Tests should cover happy path and error cases
- Commit message: `feat(db): add data layer with repositories`
