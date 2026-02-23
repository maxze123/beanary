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
