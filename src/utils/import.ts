import type { DataExport } from '../types';
import { EXPORT_VERSION } from '../types';
import { db } from '../db/database';

export interface ImportPreview {
  isValid: boolean;
  error?: string;
  beanCount: number;
  shotCount: number;
  exportDate?: string;
}

/**
 * Preview an import file without applying it.
 */
export function previewImport(data: unknown): ImportPreview {
  if (typeof data !== 'object' || data === null) {
    return {
      isValid: false,
      error: 'Invalid file format. Please select a Beanary export file.',
      beanCount: 0,
      shotCount: 0,
    };
  }

  const obj = data as Record<string, unknown>;

  if (
    typeof obj.exportedAt !== 'string' ||
    !Array.isArray(obj.beans) ||
    !Array.isArray(obj.shots)
  ) {
    return {
      isValid: false,
      error: 'Invalid file format. Please select a Beanary export file.',
      beanCount: 0,
      shotCount: 0,
    };
  }

  if (obj.version !== EXPORT_VERSION) {
    return {
      isValid: false,
      error: `Incompatible version. Expected v${EXPORT_VERSION}, got v${obj.version}.`,
      beanCount: 0,
      shotCount: 0,
    };
  }

  return {
    isValid: true,
    beanCount: obj.beans.length,
    shotCount: obj.shots.length,
    exportDate: obj.exportedAt,
  };
}

/**
 * Import data, replacing all existing data.
 */
export async function importData(data: DataExport): Promise<void> {
  await db.transaction('rw', db.beans, db.shots, async () => {
    await db.beans.clear();
    await db.shots.clear();

    if (data.beans.length > 0) {
      await db.beans.bulkAdd(data.beans);
    }
    if (data.shots.length > 0) {
      await db.shots.bulkAdd(data.shots);
    }
  });
}

/**
 * Read a File as JSON.
 */
export function readFileAsJSON(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        resolve(data);
      } catch (e) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
