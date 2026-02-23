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
