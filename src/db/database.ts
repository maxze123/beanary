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
