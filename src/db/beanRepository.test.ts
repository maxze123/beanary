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
      await createBean({ name: 'Bean 2', roaster: 'Roaster' });
      await createBean({ name: 'Bean 3', roaster: 'Roaster' });

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

      // Small delay to ensure updatedAt differs from createdAt
      await new Promise((resolve) => setTimeout(resolve, 2));

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
      await expect(updateBean({ id: 'nonexistent', name: 'Test' })).rejects.toThrow(
        'Bean not found'
      );
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
      await expect(markBeanAsDialed('nonexistent', 'shot-id')).rejects.toThrow('Bean not found');
    });

    it('throws when shot not found', async () => {
      const bean = await createBean({ name: 'Test', roaster: 'Test' });
      await expect(markBeanAsDialed(bean.id, 'nonexistent')).rejects.toThrow('Shot not found');
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
