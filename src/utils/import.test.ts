import { describe, it, expect } from 'vitest';
import { previewImport } from './import';
import { EXPORT_VERSION } from '../types';

describe('previewImport', () => {
  it('returns valid preview for correct data', () => {
    const data = {
      version: EXPORT_VERSION,
      exportedAt: '2026-02-24T10:00:00Z',
      beans: [{ id: '1', name: 'Test' }],
      shots: [{ id: '1' }, { id: '2' }],
    };

    const preview = previewImport(data);

    expect(preview.isValid).toBe(true);
    expect(preview.beanCount).toBe(1);
    expect(preview.shotCount).toBe(2);
    expect(preview.exportDate).toBe('2026-02-24T10:00:00Z');
  });

  it('returns error for invalid format', () => {
    const preview = previewImport({ foo: 'bar' });

    expect(preview.isValid).toBe(false);
    expect(preview.error).toContain('Invalid');
  });

  it('returns error for wrong version', () => {
    const data = {
      version: 999,
      exportedAt: '2026-02-24T10:00:00Z',
      beans: [],
      shots: [],
    };

    const preview = previewImport(data);

    expect(preview.isValid).toBe(false);
    expect(preview.error).toContain('version');
  });

  it('handles null input', () => {
    const preview = previewImport(null);
    expect(preview.isValid).toBe(false);
  });
});
