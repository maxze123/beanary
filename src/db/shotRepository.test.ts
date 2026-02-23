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

  describe('getDialedShotForBean', () => {
    it('returns undefined when no dialed shot', async () => {
      const found = await getDialedShotForBean(testBeanId);
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
      await expect(updateShot('nonexistent', { notes: 'Test' })).rejects.toThrow('Shot not found');
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
