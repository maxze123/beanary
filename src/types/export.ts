import type { Bean } from './bean';
import type { Shot } from './shot';

/**
 * Full export of user data for backup purposes.
 */
export interface DataExport {
  /** Export format version for future compatibility */
  version: 1;

  /** When the export was created */
  exportedAt: string;

  /** All beans in the library */
  beans: Bean[];

  /** All shots across all beans */
  shots: Shot[];
}

/** Current export version */
export const EXPORT_VERSION = 1 as const;
